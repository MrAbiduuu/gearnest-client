/**
 * Client helpers for owner-scoped rental requests.
 *
 * The Express backend verifies the Better Auth session and owner role on every
 * call. It derives the owner from the verified session email and joins each
 * purchase back to that owner's equipment; no client-supplied owner ID exists.
 */
import type { BookingPaymentStatus, BookingStatus } from "@/lib/booking-types";
import { getEquipmentApiBaseUrl } from "@/lib/equipment";

const RENTALS_BASE_URL = `${getEquipmentApiBaseUrl()}/owner/rentals`;

export type { BookingStatus, BookingPaymentStatus as PaymentStatus };
export type OwnerRentalStatus = BookingStatus;
export type OwnerRentalPaymentStatus = BookingPaymentStatus;
export type OwnerRentalStatusFilter = "all" | BookingStatus;

export type RentalEquipment = {
  id: string;
  name: string;
  category?: string;
  image?: string;
};

export type Renter = {
  name: string;
  email: string;
  phone?: string;
};

export type RentalPayment = {
  /** Major currency units. Stripe minor units are converted by the API. */
  amount: number;
  currency: string;
  status: OwnerRentalPaymentStatus;
};

export type RentalBooking = {
  id: string;
  equipmentId: string;
  equipment: RentalEquipment;
  renter: Renter;
  payment: RentalPayment;
  status: OwnerRentalStatus;
  /** Statuses the backend permits from the current booking status. */
  allowedStatuses: OwnerRentalStatus[];
  /** Date-only ISO strings (YYYY-MM-DD). */
  startDate?: string;
  endDate?: string;
  days: number;
  quantity: number;
  deliveryAddress?: string;
  createdAt?: string;
};

export type OwnerRentalEquipmentStatus = "approved" | "pending" | "rejected";

/** A listing owned by the signed-in owner, with its booking totals. */
export type OwnerRentalEquipment = {
  id: string;
  name: string;
  category?: string;
  image?: string;
  rentalRate: number;
  rentalPeriod?: string;
  availableStock: number;
  status: OwnerRentalEquipmentStatus;
  requestCount: number;
  pendingRequests: number;
  confirmedRequests: number;
  cancelledRequests: number;
  /** At least one confirmed request exists for this listing. */
  isOnRent: boolean;
  createdAt?: string;
};

export type RentalStatistics = {
  totalBookings: number;
  statusCounts: Record<OwnerRentalStatusFilter, number>;
};

export type OwnerRentalsData = {
  bookings: RentalBooking[];
  /** All owner listings matching the search, including those with no bookings. */
  equipment: OwnerRentalEquipment[];
  stats: RentalStatistics;
  /** Bookings matching the active status and search filters. */
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  hasMore: boolean;
};

type Envelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type OwnerRentalsQuery = {
  status: OwnerRentalStatusFilter;
  search: string;
  page: number;
  limit: number;
  sort?: "newest" | "oldest";
};

export class OwnerRentalsRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "OwnerRentalsRequestError";
    this.status = status;
  }
}

const getErrorMessage = async (
  response: Response,
  fallback: string,
): Promise<string> => {
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  if (response.status === 401) {
    return "Your session has expired. Please sign in again.";
  }
  if (response.status === 403) {
    return "Only equipment owners can view rental requests.";
  }

  return payload?.message ?? fallback;
};

export async function fetchOwnerRentals(
  query: OwnerRentalsQuery,
  signal?: AbortSignal,
): Promise<OwnerRentalsData> {
  const params = new URLSearchParams({
    status: query.status,
    search: query.search,
    page: String(query.page),
    limit: String(query.limit),
    sort: query.sort ?? "newest",
  });

  const response = await fetch(`${RENTALS_BASE_URL}?${params}`, {
    signal,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new OwnerRentalsRequestError(
      await getErrorMessage(response, "Could not load your rental requests."),
      response.status,
    );
  }

  return ((await response.json()) as Envelope<OwnerRentalsData>).data;
}

export async function fetchOwnerRentalStats(
  signal?: AbortSignal,
): Promise<RentalStatistics> {
  const response = await fetch(`${RENTALS_BASE_URL}/stats`, {
    signal,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new OwnerRentalsRequestError(
      await getErrorMessage(response, "Could not load your rental statistics."),
      response.status,
    );
  }

  return ((await response.json()) as Envelope<RentalStatistics>).data;
}

export async function updateOwnerRentalStatus(
  id: string,
  status: OwnerRentalStatus,
): Promise<RentalBooking> {
  const response = await fetch(
    `${RENTALS_BASE_URL}/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    throw new OwnerRentalsRequestError(
      await getErrorMessage(response, "Could not update this rental request."),
      response.status,
    );
  }

  return ((await response.json()) as Envelope<RentalBooking>).data;
}
