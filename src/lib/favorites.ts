/**
 * Server-side favorites persistence.
 *
 * Favorites live in their own MongoDB collection. The authenticated user ID
 * comes from the Better Auth session (never from the request body) and each
 * document only stores a reference to the equipment, whose details are loaded
 * dynamically from the equipment service.
 */
import { ObjectId } from "mongodb";
import { auth, db } from "@/lib/auth";
import {
  fetchEquipmentById,
  fetchEquipments,
  type Equipment,
} from "@/lib/equipment";

export type FavoriteDocument = {
  _id?: ObjectId;
  userId: string;
  equipmentId: ObjectId;
  createdAt: Date;
};

const FAVORITES_COLLECTION = "favorites";

let indexPromise: Promise<void> | null = null;

const favoritesCollection = () => {
  const collection = db.collection<FavoriteDocument>(FAVORITES_COLLECTION);

  // One unique compound index per process. Duplicate favorites are also caught
  // when inserting, in case the index has not been created yet.
  if (!indexPromise) {
    indexPromise = collection
      .createIndex(
        { userId: 1, equipmentId: 1 },
        { unique: true, name: "userId_1_equipmentId_1" },
      )
      .then(() => undefined)
      .catch((error: unknown) => {
        indexPromise = null;
        console.error("Could not create favorites index", error);
      });
  }

  return collection;
};

/** Better Auth verifies the session cookie before returning a user. */
export const getSessionUserId = async (
  request: Request,
): Promise<string | null> => {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id ?? null;
};

export const isValidEquipmentId = (id: string): boolean =>
  /^[0-9a-fA-F]{24}$/.test(id);

export const toEquipmentObjectId = (id: string): ObjectId | null =>
  isValidEquipmentId(id) ? new ObjectId(id) : null;

/** Add a favorite. Upserting keeps repeated requests safe. */
export const addFavorite = async (
  userId: string,
  equipmentId: ObjectId,
): Promise<void> => {
  await favoritesCollection().updateOne(
    { userId, equipmentId },
    {
      $setOnInsert: {
        userId,
        equipmentId,
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );
};

export const removeFavorite = async (
  userId: string,
  equipmentId: ObjectId,
): Promise<boolean> => {
  const result = await favoritesCollection().deleteOne({ userId, equipmentId });
  return result.deletedCount > 0;
};

export const hasFavorite = async (
  userId: string,
  equipmentId: ObjectId,
): Promise<boolean> => {
  const favorite = await favoritesCollection().findOne(
    { userId, equipmentId },
    { projection: { _id: 1 } },
  );

  return favorite !== null;
};

/**
 * Return the signed-in user's favorites with live equipment data.
 * Equipment is fetched in one request and unavailable/missing records are
 * skipped (and cleaned up) so a deleted listing cannot break the page.
 */
export const getFavoriteEquipments = async (
  userId: string,
): Promise<Equipment[]> => {
  const collection = favoritesCollection();
  const favorites = await collection
    .find({ userId }, { sort: { createdAt: -1 } })
    .toArray();

  if (favorites.length === 0) return [];

  const equipments = await fetchEquipments();
  const byId = new Map(equipments.map((item) => [item._id, item]));

  const result: Equipment[] = [];
  const staleIds: ObjectId[] = [];

  for (const favorite of favorites) {
    const equipment = byId.get(favorite.equipmentId.toHexString());

    if (equipment && equipment.name) {
      result.push(equipment);
    } else if (favorite._id) {
      staleIds.push(favorite._id);
    }
  }

  if (staleIds.length > 0) {
    await collection.deleteMany({ _id: { $in: staleIds } });
  }

  return result;
};

/** Used by POST /favorites/:equipmentId to reject invalid equipment IDs. */
export const equipmentExists = async (id: string): Promise<boolean> => {
  const equipment = await fetchEquipmentById(id);
  return equipment !== null;
};
