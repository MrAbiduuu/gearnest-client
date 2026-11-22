/**
 * Client helpers for the admin-only analytics endpoints on the Express API.
 *
 * The backend verifies the Better Auth session and admin role on every call,
 * then aggregates MongoDB server-side. The browser never fetches whole
 * collections to calculate platform statistics.
 */
import { getEquipmentApiBaseUrl } from "@/lib/equipment";

const ANALYTICS_BASE_URL = `${getEquipmentApiBaseUrl()}/admin/analytics`;

export type UserRole = "customer" | "owner" | "admin";
export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "paid" | "unpaid" | "refunded";

export type AdminMonthlyBooking = {
  month: string;
  monthNumber: number;
  totalBookings: number;
};

export type AdminLatestBooking = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentImage?: string;
  renterName: string;
  renterEmail: string;
  /** Major currency units (the API converts Stripe minor units). */
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt?: string;
};

export type AdminAnalyticsOverview = {
  totalUsers: number;
  totalOwners: number;
  totalRenters: number;
  totalEquipment: number;
  approvedEquipment: number;
  pendingEquipment: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  paidTransactions: number;
  /** Major currency units, aggregated from successful payments. */
  totalRevenue: number;
  currency: string;
  latestBookings: AdminLatestBooking[];
};

export type AdminAnalyticsData = AdminAnalyticsOverview;

export type AdminAnalyticsResponse = {
  success: boolean;
  message: string;
  data: AdminAnalyticsData;
};

export type AdminMonthlyBookingsData = {
  year: number;
  availableYears: number[];
  monthlyBookings: AdminMonthlyBooking[];
  /** The booking statuses included in the chart, defined by the backend. */
  bookingStatusesIncluded: BookingStatus[];
};

export type AdminMonthlyBookingsResponse = {
  success: boolean;
  message: string;
  data: AdminMonthlyBookingsData;
};

export class AdminAnalyticsRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminAnalyticsRequestError";
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
    return "You do not have permission to view platform analytics.";
  }

  return payload?.message ?? fallback;
};

export async function fetchAdminAnalytics(
  signal?: AbortSignal,
): Promise<AdminAnalyticsResponse> {
  const response = await fetch(ANALYTICS_BASE_URL, {
    signal,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AdminAnalyticsRequestError(
      await getErrorMessage(response, "Could not load platform analytics."),
      response.status,
    );
  }

  return (await response.json()) as AdminAnalyticsResponse;
}

export async function fetchAdminMonthlyBookings(
  year: number,
  signal?: AbortSignal,
): Promise<AdminMonthlyBookingsResponse> {
  const query = new URLSearchParams({ year: String(year) });
  const response = await fetch(`${ANALYTICS_BASE_URL}/monthly-bookings?${query}`, {
    signal,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AdminAnalyticsRequestError(
      await getErrorMessage(response, "Could not load monthly booking activity."),
      response.status,
    );
  }

  return (await response.json()) as AdminMonthlyBookingsResponse;
}
