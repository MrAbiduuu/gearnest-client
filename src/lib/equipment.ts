/**
 * Equipment API types and fetch helper.
 *
 * The backend is a small Express service. It exposes a single endpoint:
 *   GET /equipments -> raw JSON array of MongoDB documents
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

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("The equipment API returned an unexpected response.");
  }

  return data as Equipment[];
}
