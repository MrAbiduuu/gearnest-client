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

export type Equipment = {
  _id: string;
  name: string;
  shortDescription?: string;
  description?: string;
  category: string;
  image?: string;
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

const getApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_EQUIPMENT_API_URL ?? DEFAULT_API_BASE_URL).replace(
    /\/$/,
    "",
  );

/** Unwrap the Express API's { success, message, data } response envelope. */
const unwrapApiData = (payload: unknown): unknown =>
  payload && typeof payload === "object" && "data" in payload
    ? (payload as { data: unknown }).data
    : payload;

export async function fetchEquipments(
  signal?: AbortSignal,
): Promise<Equipment[]> {
  const response = await fetch(`${getApiBaseUrl()}/equipments`, {
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
    `${getApiBaseUrl()}/equipments/${encodeURIComponent(id)}`,
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
