"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  fetchAdminBookings,
  updateAdminBookingStatus,
  type AdminBooking,
  type AdminBookingStatusFilter,
  type AdminBookingsData,
} from "@/lib/admin-bookings-api";
import { useSession } from "@/lib/auth-client";
import type { BookingPaymentStatus, BookingStatus } from "@/lib/booking-types";
import { useDebouncedValue } from "@/lib/use-debounced-value";

const FALLBACK_IMAGE = "/equipment-fallback.svg";
const PAGE_SIZE = 10;

const filters: { key: AdminBookingStatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "cancelled", label: "Cancelled" },
];

const statusStyles: Record<BookingStatus, string> = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200",
  confirmed:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200",
  cancelled:
    "border-stone-200 bg-stone-100 text-stone-600 dark:border-stone-700 dark:bg-stone-800/50 dark:text-stone-300",
};

const paymentStyles: Record<BookingPaymentStatus, string> = {
  paid: "text-emerald-700 dark:text-emerald-300",
  unpaid: "text-amber-700 dark:text-amber-300",
  refunded: "text-stone-500 dark:text-stone-400",
};

const emptyCounts: AdminBookingsData["statusCounts"] = {
  all: 0,
  pending: 0,
  confirmed: 0,
  cancelled: 0,
};

const formatCount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

const formatCurrency = (amount: number, currency?: string) => {
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

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(
    value.length === 10 ? `${value}T00:00:00Z` : value,
  );
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "—";

const normalizeStatus = (value: string): BookingStatus => {
  const normalized = value.toLowerCase();
  if (normalized === "pending") return "pending";
  if (normalized === "cancelled" || normalized === "canceled") {
    return "cancelled";
  }
  return "confirmed";
};

const normalizePaymentStatus = (value: string): BookingPaymentStatus => {
  const normalized = value.toLowerCase();
  if (normalized === "unpaid" || normalized === "refunded") return normalized;
  return "paid";
};

type DetailProps = {
  icon: ReactNode;
  label: string;
  value?: string;
  monospace?: boolean;
};

const Detail = ({ icon, label, value, monospace }: DetailProps) => (
  <div className="flex min-w-0 items-start gap-2 rounded-xl border border-[#F1E9E0] bg-[#FCFAF7] px-3 py-2.5 dark:border-stone-800 dark:bg-stone-900/50">
    <span
      aria-hidden="true"
      className="mt-0.5 shrink-0 text-[#C2561B] [&_svg]:size-3.5 dark:text-orange-400"
    >
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-bold tracking-[0.14em] text-[#9A8A79] uppercase dark:text-stone-500">
        {label}
      </p>
      <p
        className={`mt-1 truncate text-xs font-semibold text-[#4A3A2E] dark:text-stone-200 ${
          monospace ? "font-mono" : ""
        }`}
        title={value || undefined}
      >
        {value || "—"}
      </p>
    </div>
  </div>
);

const BookingSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-[#EDE1D6] bg-white p-4 dark:border-stone-800 dark:bg-[#111310] sm:p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
      <Skeleton className="h-36 w-full shrink-0 rounded-xl bg-[#F3E9DE] dark:bg-stone-800 sm:size-32" />
      <div className="min-w-0 flex-1 space-y-3">
        <Skeleton className="h-4 w-28 bg-[#F3E9DE] dark:bg-stone-800" />
        <Skeleton className="h-6 w-3/5 bg-[#F3E9DE] dark:bg-stone-800" />
        <Skeleton className="h-3 w-1/2 bg-[#F3E9DE] dark:bg-stone-800" />
        <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-14 rounded-xl bg-[#F3E9DE] dark:bg-stone-800"
            />
          ))}
        </div>
      </div>
    </div>
    <Skeleton className="mt-5 h-10 w-full rounded-lg bg-[#F3E9DE] dark:bg-stone-800" />
  </div>
);

const PageSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-5 w-44 bg-[#F3E9DE] dark:bg-stone-800" />
    <div className="space-y-2">
      <Skeleton className="h-8 w-80 max-w-full bg-[#F3E9DE] dark:bg-stone-800" />
      <Skeleton className="h-4 w-full max-w-xl bg-[#F3E9DE] dark:bg-stone-800" />
    </div>
    <Skeleton className="h-12 w-full rounded-xl bg-[#F3E9DE] dark:bg-stone-800" />
    <div className="space-y-5">
      <BookingSkeleton />
      <BookingSkeleton />
      <BookingSkeleton />
    </div>
  </div>
);

type BookingCardProps = {
  booking: AdminBooking;
  index: number;
  reducedMotion: boolean;
  updating: boolean;
  onStatusChange: (
    booking: AdminBooking,
    nextStatus: BookingStatus,
  ) => void;
};

const BookingCard = ({
  booking,
  index,
  reducedMotion,
  updating,
  onStatusChange,
}: BookingCardProps) => {
  const status = normalizeStatus(booking.status);
  const paymentStatus = normalizePaymentStatus(booking.paymentStatus);
  const options = useMemo(
    () =>
      Array.from(
        new Set<BookingStatus>([status, ...booking.allowedStatuses]),
      ),
    [status, booking.allowedStatuses],
  );
  const duration =
    booking.days > 0
      ? `${booking.days} ${booking.days === 1 ? "day" : "days"}`
      : "—";
  const owner =
    booking.ownerName?.trim() ||
    booking.ownerEmail?.trim() ||
    "Owner unavailable";

  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: reducedMotion ? 0 : 0.35,
        delay: reducedMotion ? 0 : Math.min(index, 5) * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="overflow-hidden rounded-2xl border border-[#EDE1D6] bg-white shadow-[0_8px_28px_-22px_rgba(67,42,20,0.55)] dark:border-stone-800 dark:bg-[#111310]"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-5 sm:p-5">
        <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-[#F3E9DE] dark:bg-stone-800 sm:size-32">
          {booking.equipmentImage ? (
            <Image
              src={booking.equipmentImage}
              alt={booking.equipmentName}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 128px"
              className="object-cover"
              onError={(event) => {
                if (!event.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
                  event.currentTarget.src = FALLBACK_IMAGE;
                }
              }}
            />
          ) : (
            <Package
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-[#B49B82]"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.16em] text-[#C2561B] uppercase dark:text-orange-400">
                {booking.equipmentCategory || "Equipment rental"}
              </p>
              <h2 className="mt-1 truncate text-base font-bold text-[#2E2119] dark:text-stone-100 sm:text-lg">
                {booking.equipmentName || "Equipment unavailable"}
              </h2>
              <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-md border border-[#EDE1D6] bg-[#FCFAF7] px-2 py-1 font-mono text-[10px] text-[#8B7B6B] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
                <span className="truncate">{booking.id || "ID unavailable"}</span>
              </span>
            </div>

            <div className="shrink-0 sm:text-right">
              <p className="text-[10px] font-bold tracking-[0.14em] text-[#9A8A79] uppercase dark:text-stone-500">
                Total value
              </p>
              <p className="mt-1 text-xl font-extrabold text-[#C2561B] dark:text-orange-400">
                {formatCurrency(booking.totalAmount, booking.currency)}
              </p>
              <p
                className={`mt-1 inline-flex items-center gap-1 text-[11px] font-bold capitalize ${
                  paymentStyles[paymentStatus]
                }`}
              >
                <CreditCard aria-hidden="true" className="size-3.5" />
                {paymentStatus} payment
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            <Detail
              icon={<UserRound aria-hidden="true" />}
              label="Renter"
              value={booking.renterName || undefined}
            />
            <Detail
              icon={<UserRound aria-hidden="true" />}
              label="Renter email"
              value={booking.renterEmail || undefined}
            />
            <Detail
              icon={<UserRound aria-hidden="true" />}
              label="Equipment owner"
              value={owner}
            />
            <Detail
              icon={<CalendarDays aria-hidden="true" />}
              label="Rental period"
              value={
                booking.startDate || booking.endDate
                  ? `${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}`
                  : undefined
              }
            />
            <Detail
              icon={<Clock3 aria-hidden="true" />}
              label="Duration"
              value={duration}
            />
            <Detail
              icon={<Boxes aria-hidden="true" />}
              label="Quantity"
              value={
                booking.quantity > 0
                  ? `${booking.quantity} ${booking.quantity === 1 ? "unit" : "units"}`
                  : undefined
              }
            />
            <Detail
              icon={<MapPin aria-hidden="true" />}
              label="Delivery address"
              value={booking.deliveryAddress?.trim() || undefined}
            />
            <Detail
              icon={<Phone aria-hidden="true" />}
              label="Contact phone"
              value={booking.renterPhone?.trim() || undefined}
            />
            <Detail
              icon={<CircleDollarSign aria-hidden="true" />}
              label="Payment status"
              value={capitalize(paymentStatus)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#F1E9E0] bg-[#FCFAF7]/70 px-4 py-3 dark:border-stone-800 dark:bg-stone-900/30 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusStyles[status]}`}
          >
            {capitalize(status)}
          </span>
          <span className="truncate text-xs text-[#8B7B6B] dark:text-stone-400">
            Booked on {formatDate(booking.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor={`booking-status-${booking.id}`}
            className="text-[11px] font-bold tracking-[0.12em] text-[#8B7B6B] uppercase dark:text-stone-400"
          >
            Status
          </label>
          <NativeSelect
            id={`booking-status-${booking.id}`}
            value={status}
            disabled={updating || options.length <= 1}
            aria-label={`Booking status for ${booking.id}`}
            onChange={(event) =>
              onStatusChange(booking, normalizeStatus(event.target.value))
            }
            className="[&_select]:border-[#E6D8C8] [&_select]:bg-white [&_select]:font-bold [&_select]:text-[#4A3A2E] dark:[&_select]:border-stone-700 dark:[&_select]:bg-stone-900 dark:[&_select]:text-stone-100"
          >
            {options.map((option) => (
              <NativeSelectOption key={option} value={option}>
                {capitalize(option)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {updating ? (
            <span className="text-[11px] font-semibold text-[#C2561B] dark:text-orange-400">
              Saving…
            </span>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
};

const GlobalBookingsRecord = () => {
  const searchParams = useSearchParams();
  const bookingParam = searchParams.get("booking") ?? "";
  const { data: session, isPending: isSessionPending } = useSession();
  const shouldReduceMotion = Boolean(useReducedMotion());
  const isAdmin = session?.user?.role === "admin";

  const [query, setQuery] = useState(bookingParam);
  const debouncedQuery = useDebouncedValue(query, 300);
  const [status, setStatus] = useState<AdminBookingStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [meta, setMeta] = useState<AdminBookingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingParam) return;

    queueMicrotask(() => {
      setQuery(bookingParam);
      setStatus("all");
      setPage(1);
    });
  }, [bookingParam]);

  useEffect(() => {
    queueMicrotask(() => setPage(1));
  }, [status, debouncedQuery]);

  useEffect(() => {
    if (isSessionPending || !isAdmin) return;

    const controller = new AbortController();
    const isFirstPage = page === 1;

    queueMicrotask(() => {
      if (controller.signal.aborted) return;

      if (isFirstPage) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      void (async () => {
        try {
          const data = await fetchAdminBookings(
            {
              status,
              search: debouncedQuery.trim(),
              page,
              limit: PAGE_SIZE,
              sort: "newest",
            },
            controller.signal,
          );

          if (controller.signal.aborted) return;

          setMeta(data);
          setBookings((current) => {
            const merged = isFirstPage
              ? data.bookings
              : [...current, ...data.bookings];
            const seen = new Set<string>();
            return merged.filter((booking) => {
              if (seen.has(booking.id)) return false;
              seen.add(booking.id);
              return true;
            });
          });
        } catch (caught) {
          if (controller.signal.aborted) return;
          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load the global bookings record.",
          );
        } finally {
          if (!controller.signal.aborted) {
            setIsLoading(false);
            setIsLoadingMore(false);
          }
        }
      })();
    });

    return () => controller.abort();
  }, [isAdmin, isSessionPending, status, debouncedQuery, page, retryKey]);

  const retry = useCallback(() => setRetryKey((value) => value + 1), []);

  const clearFilters = useCallback(() => {
    setQuery("");
    setStatus("all");
    setPage(1);
  }, []);

  const applyStatusUpdate = useCallback(
    (previous: AdminBooking, updated: AdminBooking) => {
      setBookings((current) => {
        if (status === "all" || updated.status === status) {
          return current.map((booking) =>
            booking.id === updated.id ? updated : booking,
          );
        }
        return current.filter((booking) => booking.id !== updated.id);
      });

      setMeta((current) => {
        if (!current) return current;

        const statusCounts = { ...current.statusCounts };
        statusCounts[previous.status] = Math.max(
          0,
          statusCounts[previous.status] - 1,
        );
        statusCounts[updated.status] += 1;

        const total =
          status === "all"
            ? current.total
            : Math.max(0, current.total - 1);

        return {
          ...current,
          total,
          statusCounts,
          totalPages: Math.max(1, Math.ceil(total / current.limit)),
          hasMore: current.currentPage * current.limit < total,
        };
      });
    },
    [status],
  );

  const handleStatusChange = useCallback(
    async (booking: AdminBooking, nextStatus: BookingStatus) => {
      if (updatingId || nextStatus === booking.status) return;

      if (!booking.allowedStatuses.includes(nextStatus)) {
        toast.add({
          type: "error",
          title: "Invalid status change",
          description: `A ${booking.status} booking cannot be moved to ${nextStatus}.`,
          timeout: 5000,
        });
        return;
      }

      setUpdatingId(booking.id);

      try {
        const updated = await updateAdminBookingStatus(booking.id, nextStatus);
        applyStatusUpdate(booking, updated);

        toast.add({
          type: "success",
          title: "Booking status updated",
          description: `${booking.id.slice(-8)} is now ${updated.status}.`,
          timeout: 5000,
        });
      } catch (caught) {
        toast.add({
          type: "error",
          title: "Could not update booking",
          description:
            caught instanceof Error
              ? caught.message
              : "Please try again.",
          timeout: 6000,
        });
      } finally {
        setUpdatingId(null);
      }
    },
    [applyStatusUpdate, updatingId],
  );

  const counts = meta?.statusCounts ?? emptyCounts;
  const totalCount = meta?.totalBookings ?? 0;
  const matchedTotal = meta?.total ?? 0;
  const hasActiveFilters = status !== "all" || debouncedQuery.trim() !== "";
  const showInitialLoading = isSessionPending || (isAdmin && isLoading);

  if (!isSessionPending && !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-red-200 bg-white p-8 dark:border-red-900/60 dark:bg-[#111310]">
        <div className="max-w-md text-center">
          <ShieldCheck
            aria-hidden="true"
            className="mx-auto size-10 text-red-500"
          />
          <h1 className="mt-4 text-xl font-bold text-[#2E2119] dark:text-stone-100">
            Admin access required
          </h1>
          <p className="mt-2 text-sm text-[#8B7B6B] dark:text-stone-400">
            The global bookings record is only available to administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B7B6B] transition-colors hover:text-[#C2561B] dark:text-stone-400 dark:hover:text-orange-400"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Admin Overview
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#2E2119] dark:text-stone-100 sm:text-3xl">
          {`Global Bookings Record (${formatCount(totalCount)})`}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#8B7B6B] dark:text-stone-400">
          Audit all equipment rentals, track payout totals, and resolve disputed
          bookings.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-[#EDE1D6] bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-[#111310] sm:p-5">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#9A8A79] dark:text-stone-500"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search bookings"
            placeholder="Search by equipment, renter name, or booking ID..."
            className="h-11 w-full rounded-xl border border-[#E6D8C8] bg-[#FCFAF7] pr-11 pl-10 text-sm text-[#3B2F27] outline-none transition placeholder:text-[#A99887] focus:border-[#D9601B] focus:ring-3 focus:ring-[#F97316]/15 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-orange-500"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[#8B7B6B] transition hover:bg-[#F3E9DE] hover:text-[#C2561B] dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-orange-400"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div
          role="tablist"
          aria-label="Filter bookings by status"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filters.map((filter) => {
            const isActive = status === filter.key;

            return (
              <button
                key={filter.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setStatus(filter.key)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 ${
                  isActive
                    ? "border-[#D9601B] bg-[#D9601B] text-white shadow-md shadow-orange-900/15"
                    : "border-[#E6D8C8] bg-[#FCFAF7] text-[#6F5D4D] hover:border-[#D9601B] hover:text-[#C2561B] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-orange-600 dark:hover:text-orange-300"
                }`}
              >
                {filter.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#F3E9DE] text-[#8B7B6B] dark:bg-stone-800 dark:text-stone-400"
                  }`}
                >
                  {formatCount(counts[filter.key])}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error && bookings.length === 0 && !showInitialLoading ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center dark:border-red-900/60 dark:bg-red-950/20">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
            <AlertCircle className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-4 font-bold text-red-800 dark:text-red-200">
            Could not load the bookings record
          </p>
          <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/70">
            {error}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={retry}
            className="mt-5 rounded-lg border-[#E6D8C8] bg-white text-[#6F5D4D] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
          >
            <RefreshCw aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : showInitialLoading ? (
        <div className="space-y-5" aria-label="Loading bookings">
          <BookingSkeleton />
          <BookingSkeleton />
          <BookingSkeleton />
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E6D8C8] bg-white px-6 py-16 text-center dark:border-stone-700 dark:bg-[#111310]">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#F6E7D8] text-[#C2561B] dark:bg-orange-950/40 dark:text-orange-300">
            <Package className="size-7" aria-hidden="true" />
          </span>
          <p className="mt-5 text-base font-bold text-[#2E2119] dark:text-stone-100">
            {hasActiveFilters
              ? "No bookings match your filters"
              : "No bookings recorded yet"}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8B7B6B] dark:text-stone-400">
            {hasActiveFilters
              ? "Try a different search term or status, or clear the filters to see every booking."
              : "Completed rentals will appear here as soon as customers book equipment."}
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="mt-6 rounded-lg border-[#E6D8C8] bg-white text-[#6F5D4D] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-[#8B7B6B] dark:text-stone-400">
              Showing {formatCount(bookings.length)} of{" "}
              {formatCount(matchedTotal)}{" "}
              {matchedTotal === 1 ? "booking" : "bookings"}
            </p>
            {isLoadingMore ? (
              <p className="text-xs font-semibold text-[#C2561B] dark:text-orange-400">
                Loading more…
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-200">
              <span>{error}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={retry}
                className="rounded-lg border-red-200 bg-white text-red-700 dark:border-red-800 dark:bg-stone-900 dark:text-red-300"
              >
                <RefreshCw aria-hidden="true" />
                Retry
              </Button>
            </div>
          ) : null}

          {bookings.map((booking, index) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              index={index}
              reducedMotion={shouldReduceMotion}
              updating={updatingId === booking.id}
              onStatusChange={(item, nextStatus) =>
                void handleStatusChange(item, nextStatus)
              }
            />
          ))}

          {meta?.hasMore ? (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPage((current) => current + 1)}
                disabled={isLoadingMore}
                className="w-full max-w-xs rounded-xl border-[#E6D8C8] bg-white font-bold text-[#6F5D4D] hover:border-[#D9601B] hover:text-[#C2561B] disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 sm:w-auto"
              >
                {isLoadingMore ? (
                  <RefreshCw className="animate-spin" aria-hidden="true" />
                ) : null}
                Load more bookings
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

const GlobalBookingsRecordPage = () => (
  <Suspense fallback={<PageSkeleton />}>
    <GlobalBookingsRecord />
  </Suspense>
);

export default GlobalBookingsRecordPage;
