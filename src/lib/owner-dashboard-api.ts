/**
 * Client helpers for the owner-scoped dashboard endpoints on the Express API.
 *
 * The backend derives the owner from the verified Better Auth session, so the
 * browser never sends an owner ID and cannot request another owner's data.
 */
import { authenticatedFetch } from "@/lib/authenticated-api";

const OWNER_DASHBOARD_BASE_PATH = "/owner/dashboard";

export type OwnerEquipmentStatus = "approved" | "pending" | "rejected";
export type OwnerBookingStatus = "pending" | "confirmed" | "cancelled";
export type OwnerPaymentStatus = "paid" | "unpaid" | "refunded";

export type OwnerRecentBooking = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentImage?: string;
  renterName: string;
  renterEmail: string;
  /** Major currency units (Stripe minor units are converted by the API). */
  totalAmount: number;
  currency: string;
  status: OwnerBookingStatus;
  paymentStatus: OwnerPaymentStatus;
  createdAt?: string;
};

export type OwnerRecentEquipment = {
  id: string;
  name: string;
  image?: string;
  rentalRate: number;
  rentalPeriod: string;
  availableStock: number;
  status: OwnerEquipmentStatus;
  createdAt?: string;
};

export type OwnerDashboardOverview = {
  totalEquipment: number;
  approvedEquipment: number;
  pendingEquipment: number;
  rejectedEquipment: number;
  availableEquipment: number;
  availableStockUnits: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedRentals: number;
  paidTransactions: number;
  /** Gross successful payment volume, not a recorded owner payout. */
  paidRentalVolume: number;
  currency: string;
  recentBookings: OwnerRecentBooking[];
  recentEquipment: OwnerRecentEquipment[];
  definitions: {
    completedRentals: string;
    paidRentalVolume: string;
    availableEquipment: string;
  };
};

export type OwnerMonthlyBookingPoint = {
  month: string;
  monthNumber: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
};

export type OwnerMonthlyBookingsData = {
  year: number;
  availableYears: number[];
  monthlyBookings: OwnerMonthlyBookingPoint[];
  bookingStatusesIncluded: OwnerBookingStatus[];
  timezone: string;
};

export type OwnerMonthlyRevenuePoint = {
  month: string;
  monthNumber: number;
  revenue: number;
};

export type OwnerCurrencyBreakdown = {
  currency: string;
  transactions: number;
  totalRevenue: number;
};

export type OwnerMonthlyRevenueData = {
  year: number;
  availableYears: number[];
  monthlyRevenue: OwnerMonthlyRevenuePoint[];
  currency: string;
  currencyBreakdown: OwnerCurrencyBreakdown[];
  timezone: string;
  revenueBasis: string;
  excludedStatuses: {
    payments: string[];
    bookings: string[];
  };
};

type Envelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export class OwnerDashboardRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "OwnerDashboardRequestError";
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
    return "Only equipment owners can view this dashboard.";
  }

  return payload?.message ?? fallback;
};

export async function fetchOwnerDashboardOverview(
  signal?: AbortSignal,
): Promise<OwnerDashboardOverview> {
  const response = await authenticatedFetch(`${OWNER_DASHBOARD_BASE_PATH}/overview`, {
    signal,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new OwnerDashboardRequestError(
      await getErrorMessage(response, "Could not load your dashboard."),
      response.status,
    );
  }

  return ((await response.json()) as Envelope<OwnerDashboardOverview>).data;
}

export async function fetchOwnerDashboardMonthlyBookings(
  year: number,
  signal?: AbortSignal,
): Promise<OwnerMonthlyBookingsData> {
  const query = new URLSearchParams({ year: String(year) });
  const response = await authenticatedFetch(
    `${OWNER_DASHBOARD_BASE_PATH}/monthly-bookings?${query}`,
    {
      signal,
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new OwnerDashboardRequestError(
      await getErrorMessage(response, "Could not load your monthly bookings."),
      response.status,
    );
  }

  return ((await response.json()) as Envelope<OwnerMonthlyBookingsData>).data;
}

export async function fetchOwnerDashboardRevenue(
  year: number,
  signal?: AbortSignal,
): Promise<OwnerMonthlyRevenueData> {
  const query = new URLSearchParams({ year: String(year) });
  const response = await authenticatedFetch(
    `${OWNER_DASHBOARD_BASE_PATH}/revenue?${query}`,
    {
      signal,
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new OwnerDashboardRequestError(
      await getErrorMessage(response, "Could not load your monthly revenue."),
      response.status,
    );
  }

  return ((await response.json()) as Envelope<OwnerMonthlyRevenueData>).data;
}
