/**
 * Client helpers for the customer-scoped dashboard endpoints on the Express
 * API. The Next.js proxy attaches a short-lived JWT from the Better Auth
 * session, and the backend derives the customer from the verified identity.
 */
import { authenticatedFetch } from "@/lib/authenticated-api";

const CUSTOMER_DASHBOARD_BASE_PATH = "/customer/dashboard";

export type CustomerBookingStatus = "pending" | "confirmed" | "cancelled";
export type CustomerBookingPeriod = "3months" | "6months" | "12months";

export type CustomerCurrencyBreakdown = {
  currency: string;
  transactions: number;
  totalSpent: number;
};

export type CustomerDashboardOverview = {
  customerName: string;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  favoriteItems: number;
  /** Gross paid rental volume in major currency units, not a payout. */
  totalSpent: number;
  paidTransactions: number;
  reviewsPublished: number;
  currency: string;
  currencyBreakdown: CustomerCurrencyBreakdown[];
  generatedAt?: string;
  definitions: {
    totalSpent: string;
    favoriteItems: string;
    reviewsPublished: string;
  };
};

export type CustomerBookingStatusData = {
  totalBookings: number;
  statusCounts: {
    all: number;
    pending: number;
    confirmed: number;
    cancelled: number;
  };
  bookingStatusesIncluded: CustomerBookingStatus[];
  generatedAt?: string;
};

export type CustomerMonthlyBookingPoint = {
  key: string;
  month: string;
  monthNumber: number;
  year: number;
  label: string;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
};

export type CustomerBookingAnalyticsData = {
  period: CustomerBookingPeriod;
  months: number;
  monthlyBookings: CustomerMonthlyBookingPoint[];
  totalBookings: number;
  availablePeriods: CustomerBookingPeriod[];
  bookingStatusesIncluded: CustomerBookingStatus[];
  timezone: string;
  generatedAt?: string;
};

export type CustomerRecentBooking = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentImage?: string;
  status: CustomerBookingStatus;
  paymentStatus: "paid" | "unpaid" | "refunded";
  startDate?: string;
  endDate?: string;
  days: number;
  quantity: number;
  /** Major currency units. */
  totalAmount: number;
  currency: string;
  createdAt?: string;
  canReview: boolean;
};

export type CustomerRecentBookingsData = {
  bookings: CustomerRecentBooking[];
  totalReturned: number;
  generatedAt?: string;
};

type Envelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export class CustomerDashboardRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "CustomerDashboardRequestError";
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
    return "Only customers can view this dashboard.";
  }

  return payload?.message ?? fallback;
};

const request = async <T>(
  path: string,
  fallback: string,
  signal?: AbortSignal,
): Promise<T> => {
  const response = await authenticatedFetch(`${CUSTOMER_DASHBOARD_BASE_PATH}${path}`, {
    signal,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new CustomerDashboardRequestError(
      await getErrorMessage(response, fallback),
      response.status,
    );
  }

  return ((await response.json()) as Envelope<T>).data;
};

export const fetchCustomerDashboardOverview = (signal?: AbortSignal) =>
  request<CustomerDashboardOverview>(
    "/overview",
    "Could not load your dashboard overview.",
    signal,
  );

export const fetchCustomerBookingStatus = (signal?: AbortSignal) =>
  request<CustomerBookingStatusData>(
    "/booking-status",
    "Could not load your booking status summary.",
    signal,
  );

export const fetchCustomerBookingAnalytics = (
  period: CustomerBookingPeriod,
  signal?: AbortSignal,
) => {
  const query = new URLSearchParams({ period });
  return request<CustomerBookingAnalyticsData>(
    `/booking-analytics?${query}`,
    "Could not load your booking analytics.",
    signal,
  );
};

export const fetchCustomerRecentBookings = (
  limit = 3,
  signal?: AbortSignal,
) => {
  const query = new URLSearchParams({ limit: String(limit) });
  return request<CustomerRecentBookingsData>(
    `/recent-bookings?${query}`,
    "Could not load your recent bookings.",
    signal,
  );
};
