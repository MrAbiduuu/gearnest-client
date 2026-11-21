/**
 * Server-side purchase records.
 *
 * A purchase is created only after Stripe confirms a paid Checkout Session.
 * The record is keyed by the authenticated GearNest user and the equipment so
 * the rental panel can disable checkout once that customer has bought it.
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
  createdAt: Date;
};

const PURCHASES_COLLECTION = "purchases";

let indexPromise: Promise<void> | null = null;

const purchasesCollection = () => {
  const collection = db.collection<PurchaseDocument>(PURCHASES_COLLECTION);

  if (!indexPromise) {
    indexPromise = Promise.all([
      collection.createIndex(
        { userId: 1, equipmentId: 1 },
        { unique: true, name: "userId_1_equipmentId_1" },
      ),
      collection.createIndex(
        { stripeSessionId: 1 },
        { unique: true, name: "stripeSessionId_1" },
      ),
    ])
      .then(() => undefined)
      .catch((error: unknown) => {
        indexPromise = null;
        console.error("Could not create purchases indexes", error);
      });
  }

  return collection;
};

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
};

/** Idempotent: repeat visits to the Stripe success page are safe. */
export const recordCompletedPurchase = async (
  input: RecordPurchaseInput,
): Promise<void> => {
  const equipmentId = toEquipmentObjectId(input.equipmentId);
  if (!equipmentId) return;

  try {
    await purchasesCollection().updateOne(
      { userId: input.userId, equipmentId },
      {
        $setOnInsert: {
          userId: input.userId,
          equipmentId,
          stripeSessionId: input.stripeSessionId,
          amountTotal: input.amountTotal,
          currency: input.currency,
          startDate: input.startDate,
          endDate: input.endDate,
          quantity: input.quantity,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  } catch (error) {
    // A concurrent request may have inserted the same purchase first.
    if ((error as { code?: number }).code === 11000) return;
    throw error;
  }
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
