/**
 * Server-side purchase records.
 *
 * A purchase is created only after Stripe confirms a paid Checkout Session.
 * The record is keyed by the authenticated GearNest user and the equipment so
 * the rental panel can disable checkout once that customer has bought it.
 *
 * The same record also drives stock: the bought quantity is deducted from the
 * equipment immediately and returned automatically after 24 hours.
 */
import { ObjectId } from "mongodb";
import { auth, db } from "@/lib/auth";

export type PurchaseDocument = {
  _id?: ObjectId;
  userId: string;
  equipmentId: ObjectId;
  stripeSessionId: string;
  amountTotal?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  quantity?: number;
  deliveryAddress?: string;
  createdAt: Date;
  restoreAt?: Date;
  stockReduced?: boolean;
  restoredQuantity?: number;
  restoredAt?: Date;
};

type EquipmentStockDocument = {
  _id: ObjectId;
  availableStock?: number;
};

const PURCHASES_COLLECTION = "purchases";
const EQUIPMENTS_COLLECTION = "equipments";
export const STOCK_RESTORE_DELAY_MS = 24 * 60 * 60 * 1000;

let indexPromise: Promise<void> | null = null;

const ensurePurchaseIndexes = async () => {
  if (!indexPromise) {
    const collection = db.collection<PurchaseDocument>(PURCHASES_COLLECTION);

    indexPromise = Promise.all([
      collection.createIndex(
        { userId: 1, equipmentId: 1 },
        { unique: true, name: "userId_1_equipmentId_1" },
      ),
      collection.createIndex(
        { stripeSessionId: 1 },
        { unique: true, name: "stripeSessionId_1" },
      ),
      collection.createIndex({ restoreAt: 1, restoredAt: 1 }),
    ])
      .then(() => undefined)
      .catch((error: unknown) => {
        indexPromise = null;
        console.error("Could not create purchases indexes", error);
      });
  }

  await indexPromise;
};

const purchasesCollection = () =>
  db.collection<PurchaseDocument>(PURCHASES_COLLECTION);

const equipmentsCollection = () =>
  db.collection<EquipmentStockDocument>(EQUIPMENTS_COLLECTION);

/** Better Auth verifies the session cookie before returning a user. */
export const getSessionUserIdFromHeaders = async (
  requestHeaders: Headers,
): Promise<string | null> => {
  const session = await auth.api.getSession({ headers: requestHeaders });
  return session?.user?.id ?? null;
};

export const getSessionUserId = async (
  request: Request,
): Promise<string | null> => getSessionUserIdFromHeaders(request.headers);

export const isValidEquipmentId = (id: string): boolean =>
  /^[0-9a-fA-F]{24}$/.test(id);

export const toEquipmentObjectId = (id: string): ObjectId | null =>
  isValidEquipmentId(id) ? new ObjectId(id) : null;

export type RecordPurchaseInput = {
  userId: string;
  equipmentId: string;
  stripeSessionId: string;
  amountTotal?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  quantity?: number;
  deliveryAddress?: string;
};

/**
 * Insert a paid purchase and reduce the equipment stock by the bought
 * quantity. Returns the booking (purchase) ID so the success page can show it,
 * including on repeat visits when the purchase was already recorded.
 */
export const recordCompletedPurchase = async (
  input: RecordPurchaseInput,
): Promise<string | null> => {
  const equipmentId = toEquipmentObjectId(input.equipmentId);
  if (!equipmentId) return null;

  const quantity =
    Number.isInteger(input.quantity) && Number(input.quantity) > 0
      ? Number(input.quantity)
      : 1;
  const createdAt = new Date();

  const purchase: PurchaseDocument = {
    userId: input.userId,
    equipmentId,
    stripeSessionId: input.stripeSessionId,
    amountTotal: input.amountTotal,
    currency: input.currency,
    startDate: input.startDate,
    endDate: input.endDate,
    quantity,
    deliveryAddress: input.deliveryAddress,
    createdAt,
    restoreAt: new Date(createdAt.getTime() + STOCK_RESTORE_DELAY_MS),
    stockReduced: false,
    restoredQuantity: 0,
  };

  await ensurePurchaseIndexes();

  let insertedId: ObjectId;
  try {
    const result = await purchasesCollection().insertOne(purchase);
    insertedId = result.insertedId;
  } catch (error) {
    // A concurrent request may have inserted the same purchase first.
    if ((error as { code?: number }).code === 11000) {
      const existing = await purchasesCollection().findOne(
        { stripeSessionId: input.stripeSessionId },
        { projection: { _id: 1 } },
      );

      return existing?._id?.toString() ?? null;
    }
    throw error;
  }

  let deductedQuantity = 0;

  try {
    const equipment = await equipmentsCollection().findOne(
      { _id: equipmentId },
      { projection: { availableStock: 1 } },
    );

    const currentStock = Math.max(
      0,
      Math.floor(Number(equipment?.availableStock ?? 0)),
    );
    deductedQuantity = Math.min(currentStock, quantity);

    if (deductedQuantity > 0) {
      const result = await equipmentsCollection().updateOne(
        { _id: equipmentId, availableStock: { $gte: deductedQuantity } },
        { $inc: { availableStock: -deductedQuantity } },
      );

      if (result.modifiedCount === 0) deductedQuantity = 0;
    }
  } catch (error) {
    // Payment already succeeded; keep the purchase even if stock sync fails.
    console.error("Could not reduce equipment stock", error);
    deductedQuantity = 0;
  }

  await purchasesCollection().updateOne(
    { _id: insertedId },
    {
      $set: {
        stockReduced: deductedQuantity > 0,
        restoredQuantity: deductedQuantity,
      },
    },
  );

  return insertedId.toString();
};

/** Return stock for purchases whose 24-hour window has ended. */
export const restoreExpiredPurchases = async (): Promise<number> => {
  await ensurePurchaseIndexes();

  const due = await purchasesCollection()
    .find({
      stockReduced: true,
      restoredAt: { $exists: false },
      restoreAt: { $lte: new Date() },
    })
    .toArray();

  let restored = 0;

  for (const purchase of due) {
    const quantity = purchase.restoredQuantity ?? 0;

    // Claim the record first so restarts and multiple workers cannot double-add.
    const claimed = await purchasesCollection().findOneAndUpdate(
      { _id: purchase._id, restoredAt: { $exists: false } },
      { $set: { restoredAt: new Date() } },
    );

    if (!claimed) continue;

    if (quantity <= 0) continue;

    try {
      await equipmentsCollection().updateOne(
        { _id: purchase.equipmentId },
        { $inc: { availableStock: quantity } },
      );
      restored += 1;
    } catch (error) {
      console.error("Could not restore equipment stock", error);
    }
  }

  return restored;
};

export const hasPurchasedEquipment = async (
  userId: string,
  equipmentId: ObjectId,
): Promise<boolean> => {
  const purchase = await purchasesCollection().findOne(
    { userId, equipmentId },
    { projection: { _id: 1 } },
  );

  return purchase !== null;
};
