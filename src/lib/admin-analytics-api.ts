/**
 * Client helpers for the admin-only analytics endpoints on the Express API.
 *
 * The backend verifies the Better Auth session and admin role on every call,
 * then aggregates MongoDB server-side. The browser never fetches whole
 * collections to calculate platform statistics.
 */
import { authenticatedFetch } from "@/lib/authenticated-api";

const ANALYTICS_BASE_PATH = "/admin/analytics";

export type UserRole = "customer" | "owner" | "admin";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
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
  completedBookings: number;
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

export type AdminMonthlyRevenuePoint = {
  month: string;
  monthNumber: number;
  /** Major currency units, converted from Stripe minor units by the API. */
  revenue: number;
};

export type AdminCurrencyBreakdown = {
  currency: string;
  transactions: number;
  totalRevenue: number;
};

export type AdminMonthlyRevenueData = {
  year: number;
  availableYears: number[];
  monthlyRevenue: AdminMonthlyRevenuePoint[];
  /** Actual dominant currency stored on the included payment records. */
  currency: string;
  currencyBreakdown: AdminCurrencyBreakdown[];
  timezone: string;
  revenueBasis: string;
  excludedStatuses: {
    payments: string[];
    bookings: string[];
  };
};

export type AdminMonthlyRevenueResponse = {
  success: boolean;
  message: string;
  data: AdminMonthlyRevenueData;
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
  const response = await authenticatedFetch(ANALYTICS_BASE_PATH, {
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
  const response = await authenticatedFetch(`${ANALYTICS_BASE_PATH}/monthly-bookings?${query}`, {
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

export async function fetchAdminMonthlyRevenue(
  year: number,
  signal?: AbortSignal,
): Promise<AdminMonthlyRevenueResponse> {
  const query = new URLSearchParams({ year: String(year) });
  const response = await authenticatedFetch(
    `${ANALYTICS_BASE_PATH}/monthly-revenue?${query}`,
    {
      signal,
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new AdminAnalyticsRequestError(
      await getErrorMessage(response, "Could not load monthly revenue."),
      response.status,
    );
  }

  return (await response.json()) as AdminMonthlyRevenueResponse;
}
