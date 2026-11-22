/**
 * Client helpers for the admin-only global bookings record API.
 *
 * The Express backend verifies the Better Auth session and admin role on every
 * call. Search, filtering, counting, and related-record lookups all happen in
 * MongoDB; the browser only renders the returned page of bookings.
 */
import { authenticatedFetch } from "@/lib/authenticated-api";
import type { BookingPaymentStatus, BookingStatus } from "@/lib/booking-types";

const BOOKINGS_BASE_PATH = "/admin/bookings";

export type AdminBookingStatusFilter = "all" | BookingStatus;

export type AdminBooking = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentImage?: string;
  equipmentCategory?: string;
  renterName: string;
  renterEmail: string;
  renterPhone?: string;
  ownerName?: string;
  ownerEmail?: string;
  status: BookingStatus;
  paymentStatus: BookingPaymentStatus;
  /** Statuses the backend allows the current booking to move to. */
  allowedStatuses: BookingStatus[];
  /** Date-only ISO strings (YYYY-MM-DD). */
  startDate?: string;
  endDate?: string;
  days: number;
  quantity: number;
  deliveryAddress?: string;
  /** Major currency units (Stripe stores the amount in minor units). */
  totalAmount: number;
  currency: string;
  createdAt?: string;
};

export type AdminBookingsData = {
  bookings: AdminBooking[];
  /** Total bookings in the database, independent of the active filters. */
  totalBookings: number;
  /** Bookings matching the current search/status filters. */
  total: number;
  statusCounts: Record<AdminBookingStatusFilter, number>;
  currentPage: number;
  totalPages: number;
  limit: number;
  hasMore: boolean;
};

type AdminBookingsResponse = {
  success: boolean;
  message: string;
  data: AdminBookingsData;
};

type AdminBookingMutationResponse = {
  success: boolean;
  message: string;
  data: AdminBooking;
};

export type AdminBookingsQuery = {
  status: AdminBookingStatusFilter;
  search: string;
  page: number;
  limit: number;
  sort?: "newest" | "oldest";
};

export class AdminBookingsRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminBookingsRequestError";
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
    return "You do not have permission to manage bookings.";
  }

  return payload?.message ?? fallback;
};

export async function fetchAdminBookings(
  query: AdminBookingsQuery,
  signal?: AbortSignal,
): Promise<AdminBookingsData> {
  const params = new URLSearchParams({
    status: query.status,
    search: query.search,
    page: String(query.page),
    limit: String(query.limit),
    sort: query.sort ?? "newest",
  });

  const response = await authenticatedFetch(`${BOOKINGS_BASE_PATH}?${params}`, {
    signal,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AdminBookingsRequestError(
      await getErrorMessage(response, "Could not load bookings."),
      response.status,
    );
  }

  const payload = (await response.json()) as AdminBookingsResponse;
  return payload.data;
}

export async function updateAdminBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<AdminBooking> {
  const response = await authenticatedFetch(
    `${BOOKINGS_BASE_PATH}/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    throw new AdminBookingsRequestError(
      await getErrorMessage(response, "Could not update the booking status."),
      response.status,
    );
  }

  const payload = (await response.json()) as AdminBookingMutationResponse;
  return payload.data;
}
