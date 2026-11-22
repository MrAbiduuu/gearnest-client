"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Package,
  Receipt,
  RefreshCw,
  Star,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import type {
  BookingPaymentStatus,
  BookingStatus,
  CustomerBooking,
} from "@/lib/booking-types";
import { getMyBookings } from "@/lib/bookings-api";

type FilterKey = "all" | BookingStatus;

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const PAGE_SIZE = 5;

type BookingPageState = {
  bookings: CustomerBooking[];
  activeFilter: FilterKey;
  page: number;
};

const statusStyles: Record<BookingStatus, string> = {
  confirmed:
    "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/40 dark:text-lime-200",
  completed:
    "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-200",
  pending:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-900/25 dark:text-amber-200",
  cancelled:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
};

const paymentStyles: Record<BookingPaymentStatus, string> = {
  paid: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/40 dark:text-lime-200",
  unpaid:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-900/25 dark:text-amber-200",
  refunded:
    "border-stone-200 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800/50 dark:text-stone-200",
};

const formatDate = (value?: string) => {
  if (!value) return "Not scheduled";

  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value,
  );
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const formatMoney = (amount: number) =>
  `৳${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount)}`;

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const Badge = ({ className, children }: { className: string; children: ReactNode }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${className}`}
  >
    {children}
  </span>
);

const InfoItem = ({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <div className="min-w-0">
    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      <Icon className="size-3.5 shrink-0 text-green-700 dark:text-lime-400" aria-hidden="true" />
      {label}
    </p>
    <p
      className={`mt-1 text-sm font-semibold ${
        accent
          ? "text-green-700 dark:text-lime-400"
          : "text-foreground"
      }`}
    >
      {value}
    </p>
  </div>
);

const BookingCard = ({ booking }: { booking: CustomerBooking }) => (
  <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-900/5">
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-5 sm:p-5">
      <Link
        href={`/equipment/${booking.equipmentId}`}
        className="relative block h-44 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:size-36"
        aria-label={`View ${booking.equipmentName}`}
      >
        {booking.equipmentImage ? (
          <Image
            src={booking.equipmentImage}
            alt={booking.equipmentName}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, 144px"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <Package className="size-10" aria-hidden="true" />
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              {booking.equipmentName}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Booking ID{" "}
              <span className="font-mono text-foreground/80">{booking.id}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className={statusStyles[booking.status]}>
              {capitalize(booking.status)}
            </Badge>
            <Badge className={paymentStyles[booking.paymentStatus]}>
              {capitalize(booking.paymentStatus)}
            </Badge>
          </div>
        </div>

        <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            icon={CalendarDays}
            label="Start date"
            value={formatDate(booking.startDate)}
          />
          <InfoItem
            icon={CalendarDays}
            label="End date"
            value={formatDate(booking.endDate)}
          />
          <InfoItem
            icon={Clock3}
            label="Duration"
            value={`${booking.days} ${booking.days === 1 ? "day" : "days"}`}
          />
          <InfoItem
            icon={Package}
            label="Quantity"
            value={`${booking.quantity} ${booking.quantity === 1 ? "unit" : "units"}`}
          />
          <InfoItem
            icon={MapPin}
            label="Delivery address"
            value={booking.deliveryAddress || "Not provided"}
          />
          <InfoItem
            icon={Receipt}
            label="Total amount"
            value={formatMoney(booking.totalAmount)}
            accent
          />
        </div>
      </div>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/50 px-4 py-3 sm:px-5">
      <p className="text-xs text-muted-foreground">
        Booked on {formatDate(booking.createdAt?.slice(0, 10))}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          render={<Link href={`/equipment/${booking.equipmentId}`} />}
          nativeButton={false}
          variant="outline"
          size="sm"
          className="rounded-lg text-xs font-semibold"
        >
          View Item
          <ArrowUpRight aria-hidden="true" />
        </Button>

        {booking.canReview ? (
          <Button
            render={
              <Link href={`/equipment/${booking.equipmentId}#reviews`} />
            }
            nativeButton={false}
            size="sm"
            className="rounded-lg bg-[#166534] text-xs font-semibold text-white hover:bg-[#14532D]"
          >
            <Star aria-hidden="true" />
            Write Review
          </Button>
        ) : null}
      </div>
    </div>
  </article>
);

const BookingSkeleton = () => (
  <div className="space-y-5">
    {Array.from({ length: 3 }, (_, index) => (
      <div
        key={index}
        className="overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
          <Skeleton className="h-44 w-full shrink-0 rounded-xl sm:size-36" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid gap-4 pt-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, item) => (
                <Skeleton key={item} className="h-9 w-full" />
              ))}
            </div>
          </div>
        </div>
        <Skeleton className="mt-5 h-10 w-full" />
      </div>
    ))}
  </div>
);

const MyBookingsPage = () => {
  const { data: session, isPending: isSessionPending } = useSession();
  const userId = session?.user?.id ?? null;

  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [pageState, setPageState] = useState<BookingPageState | null>(null);

  // Status summary cards link here with ?status=pending|confirmed|completed|cancelled.
  useEffect(() => {
    const requestedStatus = new URLSearchParams(window.location.search).get(
      "status",
    );
    if (
      requestedStatus === "pending" ||
      requestedStatus === "confirmed" ||
      requestedStatus === "completed" ||
      requestedStatus === "cancelled"
    ) {
      // Defer the update so effects do not update state synchronously.
      queueMicrotask(() => setActiveFilter(requestedStatus));
    }
  }, []);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!userId) {
        setBookings([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getMyBookings(signal);
        if (!signal?.aborted) setBookings(data);
      } catch (caught) {
        if (signal?.aborted) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not load your bookings.",
        );
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (isSessionPending) return;

    const controller = new AbortController();
    // Defer the request so effects do not update state synchronously.
    queueMicrotask(() => void load(controller.signal));

    return () => controller.abort();
  }, [isSessionPending, load]);

  const counts = useMemo(
    () => ({
      all: bookings.length,
      pending: bookings.filter((booking) => booking.status === "pending")
        .length,
      confirmed: bookings.filter((booking) => booking.status === "confirmed")
        .length,
      completed: bookings.filter((booking) => booking.status === "completed")
        .length,
      cancelled: bookings.filter((booking) => booking.status === "cancelled")
        .length,
    }),
    [bookings],
  );

  const visibleBookings = useMemo(
    () =>
      activeFilter === "all"
        ? bookings
        : bookings.filter((booking) => booking.status === activeFilter),
    [activeFilter, bookings],
  );

  // A stored page is only valid for the filter and data set that created it.
  const isCurrentResult =
    pageState?.bookings === bookings &&
    pageState.activeFilter === activeFilter;
  const page = isCurrentResult && pageState ? pageState.page : 1;

  const totalPages = Math.max(
    1,
    Math.ceil(visibleBookings.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedBookings = useMemo(
    () => visibleBookings.slice(startIndex, startIndex + PAGE_SIZE),
    [visibleBookings, startIndex],
  );

  const goToPage = (nextPage: number) => {
    setPageState({ bookings, activeFilter, page: nextPage });
  };

  const changeFilter = (filter: FilterKey) => {
    setActiveFilter(filter);
  };

  const isInitializing = isSessionPending || (Boolean(userId) && isLoading);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Rental Bookings History
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Track, manage, and review all your equipment rental reservations.
        </p>
      </div>

      {!isSessionPending && !userId ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
            <Package className="size-7" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-bold text-foreground">
            Please sign in
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Sign in to view your rental bookings and manage your reservations.
          </p>
          <Button
            render={
              <Link href="/signin?callbackUrl=/dashboard/customer/bookings" />
            }
            nativeButton={false}
            className="mt-6 rounded-lg bg-[#166534] text-white hover:bg-[#14532D]"
          >
            Sign in
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      ) : error && !isInitializing ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <p className="font-semibold text-red-800 dark:text-red-300">
            Could not load your bookings
          </p>
          <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/70">
            {error}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void load()}
            className="mt-5 rounded-lg"
          >
            <RefreshCw aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div
            role="tablist"
            aria-label="Filter bookings by status"
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filters.map((filter) => {
              const isActive = activeFilter === filter.key;

              return (
                <button
                  key={filter.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => changeFilter(filter.key)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 ${
                    isActive
                      ? "border-[#166534] bg-[#166534] text-white shadow-md shadow-green-900/15 dark:border-lime-400 dark:bg-lime-400 dark:text-[#17251C]"
                      : "border-border bg-card text-muted-foreground hover:border-green-500/60 hover:text-foreground"
                  }`}
                >
                  {filter.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white dark:bg-[#17251C]/15 dark:text-[#17251C]"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {counts[filter.key]}
                  </span>
                </button>
              );
            })}
          </div>

          {isInitializing ? (
            <BookingSkeleton />
          ) : visibleBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
                <Package className="size-7" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-lg font-bold text-foreground">
                {activeFilter === "all"
                  ? "No bookings yet"
                  : `No ${activeFilter} bookings`}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {activeFilter === "all"
                  ? "When you reserve equipment, your rentals will appear here."
                  : "Try another status filter to see the rest of your rentals."}
              </p>
              {activeFilter === "all" ? (
                <Button
                  render={<Link href="/equipment" />}
                  nativeButton={false}
                  className="mt-6 rounded-lg bg-[#166534] text-white hover:bg-[#14532D]"
                >
                  Browse Equipment
                  <ArrowRight aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => changeFilter("all")}
                  className="mt-6 rounded-lg"
                >
                  Show all bookings
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                {visibleBookings.length === 0 ? (
                  <>Showing 0 bookings</>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {startIndex + 1}–{startIndex + paginatedBookings.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">
                      {visibleBookings.length}
                    </span>{" "}
                    {visibleBookings.length === 1 ? "booking" : "bookings"}
                  </>
                )}
              </p>

              {paginatedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}

              {totalPages > 1 ? (
                <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page{" "}
                    <span className="font-semibold text-foreground">
                      {currentPage}
                    </span>{" "}
                    of {totalPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => goToPage(currentPage - 1)}
                      className="rounded-lg"
                    >
                      <ChevronLeft aria-hidden="true" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => goToPage(currentPage + 1)}
                      className="rounded-lg"
                    >
                      Next
                      <ChevronRight aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyBookingsPage;
