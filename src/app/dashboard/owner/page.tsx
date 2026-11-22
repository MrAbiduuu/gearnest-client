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
  AlertCircle,
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  Package,
  Pencil,
  RefreshCw,
  ShieldCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import MonthlyRevenueChart from "@/components/admin/monthly-revenue-chart";
import {
  formatCount,
  formatCurrency,
} from "@/components/admin/analytics-utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import {
  fetchOwnerDashboardOverview,
  fetchOwnerDashboardRevenue,
  type OwnerBookingStatus,
  type OwnerDashboardOverview,
  type OwnerEquipmentStatus,
  type OwnerMonthlyRevenueData,
  type OwnerRecentBooking,
  type OwnerRecentEquipment,
} from "@/lib/owner-dashboard-api";

const FALLBACK_IMAGE = "/equipment-fallback.svg";

const bookingStatusStyles: Record<OwnerBookingStatus, string> = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  confirmed:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  cancelled:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
};

const equipmentStatusStyles: Record<OwnerEquipmentStatus, string> = {
  approved:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  rejected:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
};

const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "—";

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const getErrorMessage = (caught: unknown, fallback: string) =>
  caught instanceof Error ? caught.message : fallback;

const Thumbnail = ({ src, alt }: { src?: string; alt: string }) => (
  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-[#EDE1D6] bg-[#F3E9DE] dark:border-stone-800 dark:bg-stone-800">
    <Image
      src={src || FALLBACK_IMAGE}
      alt={alt}
      fill
      unoptimized
      sizes="56px"
      className="object-cover transition-transform duration-300 group-hover:scale-105"
      onError={(event) => {
        if (!event.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
          event.currentTarget.src = FALLBACK_IMAGE;
        }
      }}
    />
  </div>
);

type StatCardProps = {
  title: string;
  value: string;
  support: string;
  icon: LucideIcon;
  iconClassName: string;
  index: number;
  reducedMotion: boolean;
  isLoading: boolean;
};

const StatCard = ({
  title,
  value,
  support,
  icon: Icon,
  iconClassName,
  index,
  reducedMotion,
  isLoading,
}: StatCardProps) => (
  <motion.article
    initial={reducedMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      duration: reducedMotion ? 0 : 0.4,
      delay: reducedMotion ? 0 : index * 0.06,
      ease: [0.22, 1, 0.36, 1],
    }}
    whileHover={reducedMotion ? undefined : { y: -4 }}
    className="rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-[0_8px_28px_-22px_rgba(67,42,20,0.55)] transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(67,42,20,0.55)] dark:border-stone-800 dark:bg-[#111310]"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-bold tracking-[0.14em] text-[#9A8A79] uppercase dark:text-stone-500">
          {title}
        </p>
        {isLoading ? (
          <Skeleton className="mt-3 h-9 w-28 bg-[#F3E9DE] dark:bg-stone-800" />
        ) : (
          <p className="mt-3 truncate text-2xl font-extrabold tracking-tight text-[#2E2119] dark:text-stone-100 sm:text-3xl">
            {value}
          </p>
        )}
      </div>
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5 ${iconClassName}`}
      >
        <Icon aria-hidden="true" />
      </span>
    </div>
    <div className="mt-4 flex min-h-5 items-center border-t border-[#F1E9E0] pt-3 text-xs text-[#8B7B6B] dark:border-stone-800 dark:text-stone-400">
      {isLoading ? (
        <Skeleton className="h-3 w-40 bg-[#F3E9DE] dark:bg-stone-800" />
      ) : (
        <span className="truncate">{support}</span>
      )}
    </div>
  </motion.article>
);

type StatusCardProps = {
  title: string;
  value: string;
  support: string;
  icon: LucideIcon;
  iconClassName: string;
  href: string;
  index: number;
  reducedMotion: boolean;
  isLoading: boolean;
};

const StatusCard = ({
  title,
  value,
  support,
  icon: Icon,
  iconClassName,
  href,
  index,
  reducedMotion,
  isLoading,
}: StatusCardProps) => (
  <motion.article
    initial={reducedMotion ? false : { opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
      duration: reducedMotion ? 0 : 0.38,
      delay: reducedMotion ? 0 : 0.08 + index * 0.05,
    }}
    whileHover={reducedMotion ? undefined : { y: -3 }}
    className="group rounded-2xl border border-[#EDE1D6] bg-white shadow-sm dark:border-stone-800 dark:bg-[#111310]"
  >
    <Link
      href={href}
      className="flex h-full items-center gap-3 rounded-2xl p-4 outline-none focus-visible:ring-3 focus-visible:ring-[#F97316]/25"
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5 ${iconClassName}`}
      >
        <Icon aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-bold tracking-[0.12em] text-[#9A8A79] uppercase dark:text-stone-500">
          {title}
        </span>
        {isLoading ? (
          <Skeleton className="mt-1 h-6 w-12 bg-[#F3E9DE] dark:bg-stone-800" />
        ) : (
          <span className="mt-0.5 block text-xl font-extrabold text-[#2E2119] dark:text-stone-100">
            {value}
          </span>
        )}
        <span className="mt-0.5 block truncate text-[11px] text-[#8B7B6B] dark:text-stone-400">
          {support}
        </span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="size-4 shrink-0 text-[#C7B4A1] transition-transform group-hover:translate-x-1"
      />
    </Link>
  </motion.article>
);

const RowSkeleton = () => (
  <div className="flex items-center gap-3 rounded-xl border border-[#F1E9E0] bg-[#FCFAF7] p-3 dark:border-stone-800 dark:bg-stone-900/40">
    <Skeleton className="size-14 shrink-0 rounded-xl bg-[#F3E9DE] dark:bg-stone-800" />
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-4 w-2/3 bg-[#F3E9DE] dark:bg-stone-800" />
      <Skeleton className="h-3 w-1/2 bg-[#F3E9DE] dark:bg-stone-800" />
      <Skeleton className="h-3 w-1/3 bg-[#F3E9DE] dark:bg-stone-800" />
    </div>
  </div>
);

const SectionError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-red-200 bg-red-50/60 px-5 text-center dark:border-red-900/60 dark:bg-red-950/20">
    <AlertCircle className="size-6 text-red-500" aria-hidden="true" />
    <p className="text-sm font-semibold text-red-800 dark:text-red-200">
      Could not load this section
    </p>
    <p className="text-xs text-red-700/80 dark:text-red-300/80">{message}</p>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onRetry}
      className="rounded-lg border-red-200 bg-white text-red-700 dark:border-red-800 dark:bg-stone-900 dark:text-red-300"
    >
      <RefreshCw aria-hidden="true" />
      Retry
    </Button>
  </div>
);

type RecentBookingsCardProps = {
  bookings: OwnerRecentBooking[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  reducedMotion: boolean;
};

const RecentBookingsCard = ({
  bookings,
  isLoading,
  error,
  onRetry,
  reducedMotion,
}: RecentBookingsCardProps) => (
  <motion.section
    initial={reducedMotion ? false : { opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: reducedMotion ? 0 : 0.45 }}
    className="rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-[#111310] sm:p-6"
  >
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[#2E2119] dark:text-stone-100">
          Recent Booking Requests
        </h2>
        <p className="mt-1 text-xs text-[#8B7B6B] dark:text-stone-400">
          Latest rentals across your equipment
        </p>
      </div>
      <Link
        href="/dashboard/owner/rentals"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C2561B] transition hover:text-[#9E410F] dark:text-orange-400 dark:hover:text-orange-300"
      >
        Manage Rentals
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>

    <div className="mt-5 space-y-3">
      {isLoading ? (
        Array.from({ length: 5 }, (_, index) => <RowSkeleton key={index} />)
      ) : error ? (
        <SectionError message={error} onRetry={onRetry} />
      ) : bookings.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-[#E6D8C8] px-6 text-center dark:border-stone-700">
          <ClipboardList
            aria-hidden="true"
            className="size-7 text-[#C2561B] dark:text-orange-400"
          />
          <p className="mt-3 text-sm font-bold text-[#2E2119] dark:text-stone-100">
            No booking requests yet
          </p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-[#8B7B6B] dark:text-stone-400">
            List equipment and approved rentals will appear here.
          </p>
          <Link
            href="/dashboard/owner/equipment"
            className={buttonVariants({ size: "sm", className: "mt-4 rounded-lg" })}
          >
            Manage Equipment
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      ) : (
        bookings.map((booking, index) => (
          <motion.article
            key={booking.id}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: reducedMotion ? 0 : 0.35,
              delay: reducedMotion ? 0 : index * 0.04,
            }}
            className="group flex items-center gap-3 rounded-xl border border-[#F1E9E0] bg-[#FCFAF7] p-3 transition hover:border-[#E6D8C8] hover:shadow-sm dark:border-stone-800 dark:bg-stone-900/40"
          >
            <Thumbnail src={booking.equipmentImage} alt={booking.equipmentName} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="truncate text-sm font-bold text-[#2E2119] dark:text-stone-100">
                  {booking.equipmentName}
                </h3>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${bookingStatusStyles[booking.status]}`}
                >
                  {capitalize(booking.status)}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-[#8B7B6B] dark:text-stone-400">
                Renter: {booking.renterName || booking.renterEmail || "Unknown"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-xs font-extrabold text-[#C2561B] dark:text-orange-400">
                  {formatCurrency(booking.totalAmount, booking.currency)}
                </span>
                <span className="text-[11px] text-[#9A8A79] dark:text-stone-500">
                  {formatDate(booking.createdAt)}
                </span>
              </div>
            </div>
          </motion.article>
        ))
      )}
    </div>
  </motion.section>
);

type ListedEquipmentCardProps = {
  equipment: OwnerRecentEquipment[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  reducedMotion: boolean;
};

const ListedEquipmentCard = ({
  equipment,
  isLoading,
  error,
  onRetry,
  reducedMotion,
}: ListedEquipmentCardProps) => (
  <motion.section
    initial={reducedMotion ? false : { opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{
      duration: reducedMotion ? 0 : 0.45,
      delay: reducedMotion ? 0 : 0.08,
    }}
    className="rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-[#111310] sm:p-6"
  >
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[#2E2119] dark:text-stone-100">
          Your Listed Equipment
        </h2>
        <p className="mt-1 text-xs text-[#8B7B6B] dark:text-stone-400">
          Latest listings and approval states
        </p>
      </div>
      <Link
        href="/dashboard/owner/equipment"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C2561B] transition hover:text-[#9E410F] dark:text-orange-400 dark:hover:text-orange-300"
      >
        Manage Equipment
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>

    <div className="mt-5 space-y-3">
      {isLoading ? (
        Array.from({ length: 5 }, (_, index) => <RowSkeleton key={index} />)
      ) : error ? (
        <SectionError message={error} onRetry={onRetry} />
      ) : equipment.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-[#E6D8C8] px-6 text-center dark:border-stone-700">
          <Package
            aria-hidden="true"
            className="size-7 text-[#C2561B] dark:text-orange-400"
          />
          <p className="mt-3 text-sm font-bold text-[#2E2119] dark:text-stone-100">
            No equipment listed yet
          </p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-[#8B7B6B] dark:text-stone-400">
            Add your first machine to start receiving rental requests.
          </p>
          <Link
            href="/dashboard/owner/add-equipment"
            className={buttonVariants({ size: "sm", className: "mt-4 rounded-lg" })}
          >
            Add Equipment
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      ) : (
        equipment.map((item, index) => (
          <motion.article
            key={item.id}
            initial={reducedMotion ? false : { opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: reducedMotion ? 0 : 0.35,
              delay: reducedMotion ? 0 : index * 0.04,
            }}
            className="group flex items-center gap-3 rounded-xl border border-[#F1E9E0] bg-[#FCFAF7] p-3 transition hover:border-[#E6D8C8] hover:shadow-sm dark:border-stone-800 dark:bg-stone-900/40"
          >
            <Thumbnail src={item.image} alt={item.name} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="truncate text-sm font-bold text-[#2E2119] dark:text-stone-100">
                  {item.name}
                </h3>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${equipmentStatusStyles[item.status]}`}
                >
                  {capitalize(item.status)}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-[#8B7B6B] dark:text-stone-400">
                {formatCurrency(item.rentalRate)} /{" "}
                {String(item.rentalPeriod || "daily").toLowerCase()} · Stock:{" "}
                {formatCount(item.availableStock)}
              </p>
            </div>
            <Link
              href={`/dashboard/owner/equipment/edit/${item.id}`}
              aria-label={`Edit ${item.name}`}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#E6D8C8] bg-white text-[#8B7B6B] transition hover:border-[#D9601B] hover:text-[#C2561B] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
            </Link>
          </motion.article>
        ))
      )}
    </div>
  </motion.section>
);

const PageSkeleton = () => (
  <div className="min-h-full space-y-6 rounded-2xl bg-[#FAF7F2] p-4 dark:bg-[#0B0D0B] sm:p-6 lg:p-7">
    <Skeleton className="h-44 rounded-2xl bg-gradient-to-br from-[#2A1C14]/60 via-[#3D271B]/60 to-[#5A3623]/60" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton
          key={index}
          className="h-40 rounded-2xl bg-[#F3E9DE] dark:bg-stone-800"
        />
      ))}
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton
          key={index}
          className="h-24 rounded-2xl bg-[#F3E9DE] dark:bg-stone-800"
        />
      ))}
    </div>
    <Skeleton className="h-18 w-full rounded-2xl bg-[#F3E9DE] dark:bg-stone-800" />
    <Skeleton className="h-105 w-full rounded-2xl bg-[#F3E9DE] dark:bg-stone-800" />
    <div className="grid gap-5 lg:grid-cols-2">
      <Skeleton className="h-100 rounded-2xl bg-[#F3E9DE] dark:bg-stone-800" />
      <Skeleton className="h-100 rounded-2xl bg-[#F3E9DE] dark:bg-stone-800" />
    </div>
  </div>
);

const OwnerDashboardPage = () => {
  const { data: session, isPending: isSessionPending } = useSession();
  const reducedMotion = Boolean(useReducedMotion());
  const isOwner = session?.user?.role === "owner";

  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [overview, setOverview] = useState<OwnerDashboardOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [overviewRetryKey, setOverviewRetryKey] = useState(0);
  const [revenue, setRevenue] = useState<OwnerMonthlyRevenueData | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState<string | null>(null);
  const [revenueRetryKey, setRevenueRetryKey] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);
  const retryOverview = useCallback(
    () => setOverviewRetryKey((value) => value + 1),
    [],
  );
  const retryRevenue = useCallback(
    () => setRevenueRetryKey((value) => value + 1),
    [],
  );

  useEffect(() => {
    const year = new Date().getFullYear();

    queueMicrotask(() => {
      setCurrentYear(year);
      setSelectedYear((value) => value ?? year);
    });
  }, []);

  useEffect(() => {
    if (isSessionPending || !isOwner) return;

    const controller = new AbortController();

    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setOverviewLoading(true);
      setOverviewError(null);

      void (async () => {
        try {
          const data = await fetchOwnerDashboardOverview(controller.signal);
          if (!controller.signal.aborted) setOverview(data);
        } catch (caught) {
          if (controller.signal.aborted) return;
          setOverviewError(
            getErrorMessage(caught, "Could not load your dashboard."),
          );
        } finally {
          if (!controller.signal.aborted) setOverviewLoading(false);
        }
      })();
    });

    return () => controller.abort();
  }, [isOwner, isSessionPending, overviewRetryKey, refreshKey]);

  useEffect(() => {
    if (isSessionPending || !isOwner || selectedYear === null) return;

    const controller = new AbortController();

    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setRevenueLoading(true);
      setRevenueError(null);

      void (async () => {
        try {
          const data = await fetchOwnerDashboardRevenue(
            selectedYear,
            controller.signal,
          );
          if (!controller.signal.aborted) setRevenue(data);
        } catch (caught) {
          if (controller.signal.aborted) return;
          setRevenueError(
            getErrorMessage(caught, "Could not load your monthly revenue."),
          );
        } finally {
          if (!controller.signal.aborted) setRevenueLoading(false);
        }
      })();
    });

    return () => controller.abort();
  }, [isOwner, isSessionPending, selectedYear, revenueRetryKey, refreshKey]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    if (currentYear !== null) years.add(currentYear);
    if (selectedYear !== null) years.add(selectedYear);
    for (const year of revenue?.availableYears ?? []) years.add(year);
    return [...years].sort((a, b) => b - a);
  }, [currentYear, revenue?.availableYears, selectedYear]);

  const stats = useMemo(
    () => [
      {
        title: "Listed Equipment",
        value: formatCount(overview?.totalEquipment ?? 0),
        support: `${formatCount(overview?.availableEquipment ?? 0)} currently available`,
        icon: Package,
        iconClassName:
          "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
      },
      {
        title: "Completed Rentals",
        value: formatCount(overview?.completedRentals ?? 0),
        support: "FULFILLED",
        icon: CalendarCheck2,
        iconClassName:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      },
      {
        title: "Total Earnings",
        value: formatCurrency(
          overview?.paidRentalVolume ?? 0,
          overview?.currency,
        ),
        support: "Gross paid volume · Paid",
        icon: CircleDollarSign,
        iconClassName:
          "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-emerald-300",
      },
      {
        title: "Total Bookings",
        value: formatCount(overview?.totalBookings ?? 0),
        support: `${formatCount(overview?.pendingBookings ?? 0)} pending requests`,
        icon: ClipboardList,
        iconClassName:
          "bg-orange-50 text-[#C2561B] dark:bg-orange-950/40 dark:text-orange-300",
      },
    ],
    [overview],
  );

  const statusCards = useMemo(
    () => [
      {
        title: "Approved Listings",
        value: formatCount(overview?.approvedEquipment ?? 0),
        support: "Live on the catalog",
        icon: CheckCircle2,
        iconClassName:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
        href: "/dashboard/owner/equipment?status=approved",
      },
      {
        title: "Pending Approvals",
        value: formatCount(overview?.pendingEquipment ?? 0),
        support: "Awaiting admin review",
        icon: Clock3,
        iconClassName:
          "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
        href: "/dashboard/owner/equipment?status=pending",
      },
      {
        title: "Rejected Listings",
        value: formatCount(overview?.rejectedEquipment ?? 0),
        support: "Need your attention",
        icon: XCircle,
        iconClassName:
          "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
        href: "/dashboard/owner/equipment?status=rejected",
      },
      {
        title: "In-Stock / Available",
        value: formatCount(overview?.availableEquipment ?? 0),
        support: `${formatCount(overview?.availableStockUnits ?? 0)} units available`,
        icon: Package,
        iconClassName:
          "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
        href: "/dashboard/owner/equipment?status=available",
      },
    ],
    [overview],
  );

  if (isSessionPending || selectedYear === null) return <PageSkeleton />;

  if (!isOwner) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-red-200 bg-white p-8 dark:border-red-900/60 dark:bg-[#111310]">
        <div className="max-w-md text-center">
          <ShieldCheck
            aria-hidden="true"
            className="mx-auto size-10 text-red-500"
          />
          <h1 className="mt-4 text-xl font-bold text-[#2E2119] dark:text-stone-100">
            Owner access required
          </h1>
          <p className="mt-2 text-sm text-[#8B7B6B] dark:text-stone-400">
            This dashboard is only available to registered equipment owners.
          </p>
        </div>
      </div>
    );
  }

  const footnote: ReactNode = revenue ? (
    <>
      {formatCount(revenue.currencyBreakdown.length)} actual payment{" "}
      {revenue.currencyBreakdown.length === 1 ? "currency" : "currencies"}{" "}
      found. Duplicate Stripe sessions are excluded. GearNest has no owner
      payout field, so this is gross paid rental volume.
    </>
  ) : null;

  return (
    <div className="min-h-full space-y-6 rounded-2xl bg-[#FAF7F2] p-4 dark:bg-[#0B0D0B] sm:p-6 lg:p-7">
      <motion.section
        initial={reducedMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2A1C14] via-[#3D271B] to-[#5A3623] p-6 shadow-[0_20px_45px_-30px_rgba(42,28,20,0.9)] sm:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-20 size-80 rounded-full bg-orange-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 left-1/3 size-72 rounded-full bg-amber-300/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-300/40 bg-orange-100/15 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.2em] text-orange-300 uppercase">
              <span className="size-1.5 rounded-full bg-orange-400" />
              OWNER DASHBOARD
            </span>
            <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-[#FFF8EF] sm:text-3xl lg:text-[34px]">
              Manage Your Equipment &amp; Rentals
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#E4D2C2]/80 sm:text-base">
              Monitor listings, review rental bookings, and track your monthly
              earnings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-bold tracking-[0.14em] text-[#E4D2C2]/70 uppercase">
                Account type
              </p>
              <p className="mt-1 text-lg font-extrabold text-white">
                Equipment Owner
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={refresh}
              disabled={overviewLoading || revenueLoading}
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-60"
            >
              <RefreshCw
                className={overviewLoading || revenueLoading ? "animate-spin" : ""}
                aria-hidden="true"
              />
              Refresh
            </Button>
          </div>
        </div>
      </motion.section>

      {overviewError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/60 dark:bg-red-950/20">
          <div className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{overviewError}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={retryOverview}
            className="rounded-lg border-red-200 bg-white text-red-700 dark:border-red-800 dark:bg-stone-900 dark:text-red-300"
          >
            <RefreshCw aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            index={index}
            reducedMotion={reducedMotion}
            isLoading={overviewLoading && !overview}
          />
        ))}
      </div>

      <p className="text-[11px] leading-5 text-[#9A8A79] dark:text-stone-500">
        Completed rentals are confirmed bookings with successful payments.
        GearNest does not store owner payouts or commission, so paid rental
        volume is not money already received by the owner.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statusCards.map((card, index) => (
          <StatusCard
            key={card.title}
            {...card}
            index={index}
            reducedMotion={reducedMotion}
            isLoading={overviewLoading && !overview}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EDE1D6] bg-white px-4 py-3 shadow-sm dark:border-stone-800 dark:bg-[#111310] sm:px-5">
        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] text-[#9A8A79] uppercase dark:text-stone-500">
            Historical revenue
          </p>
          <p className="mt-1 text-sm text-[#6F5D4D] dark:text-stone-300">
            Choose a year to update your performance chart.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="owner-revenue-year"
            className="text-[11px] font-bold tracking-[0.12em] text-[#8B7B6B] uppercase dark:text-stone-400"
          >
            Year
          </label>
          <NativeSelect
            id="owner-revenue-year"
            value={selectedYear ?? ""}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="w-24 [&_select]:border-[#E6D8C8] [&_select]:bg-[#FCFAF7] [&_select]:font-bold [&_select]:text-[#3B2F27] [&_select]:transition-colors dark:[&_select]:border-stone-700 dark:[&_select]:bg-stone-900 dark:[&_select]:text-stone-100"
          >
            {availableYears.map((year) => (
              <NativeSelectOption key={year} value={year}>
                {year}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      <MonthlyRevenueChart
        data={revenue}
        isLoading={revenueLoading}
        error={revenueError}
        onRetry={retryRevenue}
        reducedMotion={reducedMotion}
        title="Monthly Revenue Performance"
        eyebrow="Your earnings"
        subtitle="Paid rental volume from your equipment by payment date"
        accentColor="#F97316"
        eyebrowClassName="text-[#C2561B] dark:text-orange-400"
        summaryClassName="border-orange-100 bg-orange-50 dark:border-orange-900/60 dark:bg-orange-950/20"
        summaryLabelClassName="text-[#C2561B] dark:text-orange-400"
        summaryValueClassName="text-[#A8470F] dark:text-orange-300"
        skeletonClassName="bg-[#FCE9DA] dark:bg-stone-800"
        tooltipName="Your paid rental volume"
        footnote={footnote}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <RecentBookingsCard
          bookings={overview?.recentBookings ?? []}
          isLoading={overviewLoading && !overview}
          error={overviewError}
          onRetry={retryOverview}
          reducedMotion={reducedMotion}
        />
        <ListedEquipmentCard
          equipment={overview?.recentEquipment ?? []}
          isLoading={overviewLoading && !overview}
          error={overviewError}
          onRetry={retryOverview}
          reducedMotion={reducedMotion}
        />
      </div>

      <motion.section
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: reducedMotion ? 0 : 0.45 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2A1C14] via-[#3D271B] to-[#5A3623] p-6 shadow-[0_20px_45px_-30px_rgba(42,28,20,0.9)] sm:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 right-10 size-64 rounded-full bg-orange-500/15 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#FFF8EF] sm:text-2xl">
              Need to manage your listings or add new machinery?
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#E4D2C2]/80">
              Update pricing, available quantities, or rental conditions
              seamlessly.
            </p>
          </div>
          <Link
            href="/dashboard/owner/equipment"
            className={buttonVariants({
              className:
                "w-fit rounded-xl bg-[#F97316] font-bold text-white shadow-lg shadow-orange-900/25 hover:bg-[#EA6A0F]",
            })}
          >
            Manage Equipment
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default OwnerDashboardPage;
