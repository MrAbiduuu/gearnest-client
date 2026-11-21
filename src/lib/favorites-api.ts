/**
 * Client-side favorites API service. All requests are scoped by the
 * authenticated session on the server; no user ID is ever sent from here.
 */
import { unwrapApiData, type Equipment } from "@/lib/equipment";

export class FavoriteRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "FavoriteRequestError";
    this.status = status;
  }
}

const getResponseMessage = async (
  response: Response,
  fallback: string,
): Promise<string> => {
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
    error?: string;
  } | null;

  return payload?.message ?? payload?.error ?? fallback;
};

const ensureOk = async (response: Response, fallback: string) => {
  if (!response.ok) {
    throw new FavoriteRequestError(
      await getResponseMessage(response, fallback),
      response.status,
    );
  }
};

export async function getMyFavorites(
  signal?: AbortSignal,
): Promise<Equipment[]> {
  const response = await fetch("/api/favorites", {
    signal,
    cache: "no-store",
  });

  await ensureOk(response, "Could not load your favorites.");

  const equipments = unwrapApiData(await response.json());
  if (!Array.isArray(equipments)) {
    throw new Error("The favorites API returned an unexpected response.");
  }

  return equipments as Equipment[];
}

export async function addToFavorites(equipmentId: string): Promise<void> {
  const response = await fetch(
    `/api/favorites/${encodeURIComponent(equipmentId)}`,
    { method: "POST" },
  );

  await ensureOk(response, "Could not add this equipment to favorites.");
}

export async function removeFromFavorites(equipmentId: string): Promise<void> {
  const response = await fetch(
    `/api/favorites/${encodeURIComponent(equipmentId)}`,
    { method: "DELETE" },
  );

  await ensureOk(response, "Could not remove this equipment from favorites.");
}

/** Available for components that only need a single item's status. */
export async function checkFavoriteStatus(
  equipmentId: string,
): Promise<boolean> {
  const response = await fetch(
    `/api/favorites/${encodeURIComponent(equipmentId)}/status`,
    { cache: "no-store" },
  );

  await ensureOk(response, "Could not check favorite status.");

  const data = unwrapApiData(await response.json()) as {
    isFavorite?: unknown;
  } | null;

  return data?.isFavorite === true;
}
