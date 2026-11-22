/**
 * Equipment API types and fetch helper.
 *
 * The backend is a small Express service. It exposes:
 *   GET /equipments     -> { success, message, data: MongoDB documents[] }
 *   GET /equipments/:id -> { success, message, data: MongoDB document }
 *
 * Only the fields that actually exist in that response are declared as
 * required. A few optional fields are included so the UI can take advantage
 * of them if the backend adds them later.
 */

export type EquipmentOwner = {
  name?: string;
  email?: string;
  isVerified?: boolean;
};

export type EquipmentStatus = "approved" | "pending" | "rejected";

export type Equipment = {
  _id: string;
  name: string;
  shortDescription?: string;
  description?: string;
  category: string;
  image?: string;
  images?: string[];
  status?: EquipmentStatus;
  brand?: string;
  model?: string;
  condition?: string;
  availableStock: number;
  rentalRate: number;
  rentalPeriod: string;
  owner?: EquipmentOwner;
  rentalTerms?: string;

  // Optional: not returned by the current backend, but supported by the UI.
  location?: string;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
};

const DEFAULT_API_BASE_URL = "http://localhost:5000";

export const getEquipmentApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_EQUIPMENT_API_URL ?? DEFAULT_API_BASE_URL).replace(
    /\/$/,
    "",
  );

/** Unwrap the Express API's { success, message, data } response envelope. */
export const unwrapApiData = (payload: unknown): unknown =>
  payload && typeof payload === "object" && "data" in payload
    ? (payload as { data: unknown }).data
    : payload;

export async function fetchEquipments(
  signal?: AbortSignal,
  options?: { status?: "all" | EquipmentStatus },
): Promise<Equipment[]> {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  const search = params.toString();
  const query = search ? `?${search}` : "";

  const response = await fetch(`${getEquipmentApiBaseUrl()}/equipments${query}`, {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Could not load equipment (status ${response.status}).`);
  }

  // A bare array is accepted as well, so this keeps working if the API's
  // { success, message, data } wrapper is removed later.
  const equipments = unwrapApiData(await response.json());

  if (!Array.isArray(equipments)) {
    throw new Error("The equipment API returned an unexpected response.");
  }

  return equipments as Equipment[];
}

/** Fetch one equipment document. Returns null when the API responds with 404. */
export async function fetchEquipmentById(
  id: string,
): Promise<Equipment | null> {
  const response = await fetch(
    `${getEquipmentApiBaseUrl()}/equipments/${encodeURIComponent(id)}`,
    { cache: "no-store" },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(
      `Could not load this equipment (status ${response.status}).`,
    );
  }

  const equipment = unwrapApiData(await response.json());

  if (
    !equipment ||
    typeof equipment !== "object" ||
    Array.isArray(equipment) ||
    typeof (equipment as Partial<Equipment>)._id !== "string" ||
    typeof (equipment as Partial<Equipment>).name !== "string"
  ) {
    throw new Error("The equipment API returned an unexpected response.");
  }

  return equipment as Equipment;
}

export type EquipmentInput = {
  name: string;
  category: string;
  description: string;
  rentalRate: number;
  rentalPeriod: string;
  availableStock: number;
  brand: string;
  model: string;
  condition: string;
  location: string;
  rentalTerms: string;
  imageUrls: string[];
};

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

/** Listings belonging to the signed-in owner (filtered server-side). */
export async function fetchOwnerEquipments(
  signal?: AbortSignal,
): Promise<Equipment[]> {
  const response = await fetch("/api/equipments", {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getResponseMessage(response, "Could not load your equipment."),
    );
  }

  const equipments = unwrapApiData(await response.json());
  if (!Array.isArray(equipments)) {
    throw new Error("The equipment API returned an unexpected response.");
  }

  return equipments as Equipment[];
}

/** Load one owned listing for the edit page. Returns null when not found. */
export async function fetchOwnerEquipmentById(
  id: string,
  signal?: AbortSignal,
): Promise<Equipment | null> {
  const response = await fetch(`/api/equipments/${encodeURIComponent(id)}`, {
    signal,
    cache: "no-store",
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(
      await getResponseMessage(response, "Could not load this equipment."),
    );
  }

  return unwrapApiData(await response.json()) as Equipment;
}

export async function updateOwnerEquipment(
  id: string,
  payload: EquipmentInput,
): Promise<Equipment> {
  const response = await fetch(`/api/equipments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getResponseMessage(response, "Could not save your changes."),
    );
  }

  return unwrapApiData(await response.json()) as Equipment;
}

export async function deleteOwnerEquipment(id: string): Promise<void> {
  const response = await fetch(`/api/equipments/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getResponseMessage(response, "Could not delete this equipment."),
    );
  }
}
