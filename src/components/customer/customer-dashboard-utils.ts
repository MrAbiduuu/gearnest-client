import type { CustomerBookingStatus } from "@/lib/customer-dashboard-api";

export const formatCount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export const formatMoney = (amount: number, currency = "BDT") => {
  const code = (currency || "BDT").toUpperCase();

  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `৳${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(amount)}`;
  }
};

export const formatDate = (value?: string) => {
  if (!value) return "Not scheduled";
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value,
  );
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

export const formatUpdatedAt = (value?: string) => {
  if (!value) return "Updated in real time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Updated in real time";

  return `Updated ${new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date)} UTC`;
};

export const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "—";

export const getErrorMessage = (caught: unknown, fallback: string) =>
  caught instanceof Error ? caught.message : fallback;

export const bookingStatusStyles: Record<CustomerBookingStatus, string> = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-900/25 dark:text-amber-200",
  confirmed:
    "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/30 dark:text-blue-200",
  completed:
    "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800/60 dark:bg-teal-950/30 dark:text-teal-200",
  cancelled:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
};

export const bookingStatusColors: Record<CustomerBookingStatus, string> = {
  confirmed: "#2563EB",
  completed: "#0D9488",
  pending: "#F59E0B",
  cancelled: "#DC2626",
};

export const DEFAULT_FALLBACK_IMAGE = "/equipment-fallback.svg";
