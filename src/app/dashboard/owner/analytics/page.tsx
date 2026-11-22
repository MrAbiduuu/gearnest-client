"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Boxes,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Info,
  RefreshCw,
  ShieldCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import MonthlyBookingVolumeChart from "@/components/admin/monthly-booking-volume-chart";
import MonthlyRevenueChart from "@/components/admin/monthly-revenue-chart";
import {
  formatCount,
  formatCurrency,
} from "@/components/admin/analytics-utils";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import {
  fetchOwnerDashboardMonthlyBookings,
  fetchOwnerDashboardOverview,
  fetchOwnerDashboardRevenue,
  type OwnerBookingStatus,
  type OwnerDashboardOverview,
  type OwnerEquipmentStatus,
  type OwnerMonthlyBookingsData,
  type OwnerMonthlyRevenueData,
} from "@/lib/owner-dashboard-api";
import {
  fetchOwnerRentals,
  type OwnerRentalEquipment,
} from "@/lib/owner-rentals-api";

const FALLBACK_IMAGE = "/equipment-fallback.svg";
const TOP_LISTING_LIMIT = 5;

const equipmentStatusStyles: Record<OwnerEquipmentStatus, string> = {
  approved:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  rejected:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
};

const equipmentStatusLabel: Record<OwnerEquipmentStatus, string> = {
  approved: "Published",
  pending: "In review",
  rejected: "Needs attention",
};

const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "—";

const getErrorMessage = (caught: unknown, fallback: string) =>
  caught instanceof Error ? caught.message : fallback;

type MetricCardProps = {
  title: string;
  value: string;
  support: string;
  icon: LucideIcon;
  iconClassName: string;
  index: number;
  reducedMotion: boolean;
  isLoading: boolean;
};

const MetricCard = ({
  title,
  value,
  support,
  icon: Icon,
  iconClassName,
  index,
  reducedMotion,
  isLoading,
}: MetricCardProps) => (
  <motion.article
    initial={reducedMotion ? false : { opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: reducedMotion ? 0 : 0.42,
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

const PageSkeleton = () => (
  <div className="min-h-screen space-y-6 bg-[#FAF7F2] dark:bg-transparent sm:-mx-2 sm:px-2">
    <Skeleton className="h-5 w-44 bg-[#F3E9DE] dark:bg-stone-800" />
    <div className="space-y-2">
      <Skeleton className="h-9 w-full max-w-lg bg-[#F3E9DE] dark:bg-stone-800" />
      <Skeleton className="h-4 w-full max-w-2xl bg-[#F3E9DE] dark:bg-stone-800" />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton
          key={index}
          className="h-40 rounded-2xl bg-[#F3E9DE] dark:bg-stone-800"
        />
      ))}
    </div>
    <Skeleton className="h-18 w-full rounded-2xl bg-[#F3E9DE] dark:bg-stone-800" />
    <div className="grid gap-5 xl:grid-cols-2">
      <Skeleton className="h-105 rounded-2xl bg-[#F3E9DE] dark:bg-stone-800" />
      <Skeleton className="h-105 rounded-2xl bg-[#F3E9DE] dark:bg-stone-800" />
    </div>
  </div>
);

const ErrorBanner = ({
  message,
  onRetry,
  actionLabel = "Retry",
}: {
  message: string;
  onRetry: () => void;
  actionLabel?: string;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/60 dark:bg-red-950/20">
    <div className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onRetry}
      className="rounded-lg border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-stone-900 dark:text-red-300"
    >
      <RefreshCw aria-hidden="true" />
      {actionLabel}
    </Button>
  </div>
);

type ListingPerformanceCardProps = {
  equipment: OwnerRentalEquipment;
  currency?: string;
  index: number;
  reducedMotion: boolean;
};

const ListingPerformanceCard = ({
  equipment,
  currency,
  index,
  reducedMotion,
}: ListingPerformanceCardProps) => (
  <motion.article
    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{
      duration: reducedMotion ? 0 : 0.35,
      delay: reducedMotion ? 0 : index * 0.05,
      ease: [0.22, 1, 0.36, 1],
    }}
    className="group rounded-2xl border border-[#F1E9E0] bg-[#FCFAF7] p-4 dark:border-stone-800 dark:bg-stone-900/40"
  >
    <div className="flex min-w-0 gap-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-[#EDE1D6] bg-[#F3E9DE] dark:border-stone-800 dark:bg-stone-800">
        <Image
          src={equipment.image || FALLBACK_IMAGE}
          alt={equipment.name}
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
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${equipmentStatusStyles[equipment.status]}`}
          >
            {equipmentStatusLabel[equipment.status]}
          </span>
          {equipment.isOnRent ? (
            <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300">
              On rent
            </span>
          ) : null}
        </div>
        <h3
          className="mt-1.5 truncate text-sm font-bold text-[#2E2119] dark:text-stone-100"
          title={equipment.name}
        >
          {equipment.name}
        </h3>
        <p className="mt-0.5 truncate text-[11px] text-[#8B7B6B] dark:text-stone-400">
          {equipment.category || "Equipment"}
          {equipment.rentalRate > 0
            ? ` · ${formatCurrency(equipment.rentalRate, currency)}${
                equipment.rentalPeriod
                  ? ` / ${capitalize(equipment.rentalPeriod)}`
                  : ""
              }`
            : ""}
        </p>
      </div>
    </div>

    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#EDE1D6] pt-3 dark:border-stone-800">
      <div>
        <p className="text-[10px] font-bold tracking-wide text-[#9A8A79] uppercase dark:text-stone-500">
          Requests
        </p>
        <p className="mt-0.5 text-sm font-extrabold text-[#2E2119] dark:text-stone-100">
          {formatCount(equipment.requestCount)}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-wide text-[#9A8A79] uppercase dark:text-stone-500">
          Confirmed
        </p>
        <p className="mt-0.5 text-sm font-extrabold text-blue-700 dark:text-blue-300">
          {formatCount(equipment.confirmedRequests)}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-wide text-[#9A8A79] uppercase dark:text-stone-500">
          Pending
        </p>
        <p className="mt-0.5 text-sm font-extrabold text-amber-700 dark:text-amber-300">
          {formatCount(equipment.pendingRequests)}
        </p>
      </div>
    </div>

    <Link
      href="/dashboard/owner/rentals"
      className="mt-3 inline-flex text-[11px] font-bold text-[#C2561B] transition hover:text-[#9A3412] dark:text-orange-400 dark:hover:text-orange-300"
    >
      View rental requests →
    </Link>
  </motion.article>
);

const OwnerAnalyticsPage = () => {
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
  const [bookings, setBookings] = useState<OwnerMonthlyBookingsData | null>(
    null,
  );
  const [revenueError, setRevenueError] = useState<string | null>(null);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [chartsRetryKey, setChartsRetryKey] = useState(0);

  const [listings, setListings] = useState<OwnerRentalEquipment[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [listingsRetryKey, setListingsRetryKey] = useState(0);

  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);
  const retryOverview = useCallback(
    () => setOverviewRetryKey((value) => value + 1),
    [],
  );
  const retryCharts = useCallback(
    () => setChartsRetryKey((value) => value + 1),
    [],
  );
  const retryListings = useCallback(
    () => setListingsRetryKey((value) => value + 1),
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
          setOverview(null);
          setOverviewError(
            getErrorMessage(caught, "Could not load your analytics overview."),
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
      setChartsLoading(true);
      setRevenueError(null);
      setBookingsError(null);

      void (async () => {
        const [revenueResult, bookingsResult] = await Promise.allSettled([
          fetchOwnerDashboardRevenue(selectedYear, controller.signal),
          fetchOwnerDashboardMonthlyBookings(selectedYear, controller.signal),
        ]);

        if (controller.signal.aborted) return;

        setRevenue(
          revenueResult.status === "fulfilled" ? revenueResult.value : null,
        );
        setRevenueError(
          revenueResult.status === "rejected"
            ? getErrorMessage(
                revenueResult.reason,
                "Could not load your monthly revenue.",
              )
            : null,
        );
        setBookings(
          bookingsResult.status === "fulfilled" ? bookingsResult.value : null,
        );
        setBookingsError(
          bookingsResult.status === "rejected"
            ? getErrorMessage(
                bookingsResult.reason,
                "Could not load your monthly bookings.",
              )
            : null,
        );
        setChartsLoading(false);
      })();
    });

    return () => controller.abort();
  }, [isOwner, isSessionPending, selectedYear, chartsRetryKey, refreshKey]);

  useEffect(() => {
    if (isSessionPending || !isOwner) return;

    const controller = new AbortController();

    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setListingsLoading(true);
      setListingsError(null);

      void (async () => {
        try {
          const data = await fetchOwnerRentals(
            { status: "all", search: "", page: 1, limit: 1, sort: "newest" },
            controller.signal,
          );
          if (!controller.signal.aborted) setListings(data.equipment);
        } catch (caught) {
          if (controller.signal.aborted) return;
          setListings([]);
          setListingsError(
            getErrorMessage(caught, "Could not load your listing performance."),
          );
        } finally {
          if (!controller.signal.aborted) setListingsLoading(false);
        }
      })();
    });

    return () => controller.abort();
  }, [isOwner, isSessionPending, listingsRetryKey, refreshKey]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    if (currentYear !== null) years.add(currentYear);
    if (selectedYear !== null) years.add(selectedYear);
    for (const year of revenue?.availableYears ?? []) years.add(year);
    for (const year of bookings?.availableYears ?? []) years.add(year);
    return [...years].sort((a, b) => b - a);
  }, [bookings?.availableYears, currentYear, revenue?.availableYears, selectedYear]);

  const bookingMix = useMemo(() => {
    const rows: Array<{
      key: OwnerBookingStatus;
      label: string;
      value: number;
      icon: LucideIcon;
      barClassName: string;
      textClassName: string;
    }> = [
      {
        key: "pending",
        label: "Pending approval",
        value: overview?.pendingBookings ?? 0,
        icon: Clock3,
        barClassName: "bg-amber-500",
        textClassName: "text-amber-700 dark:text-amber-300",
      },
      {
        key: "confirmed",
        label: "Confirmed",
        value: overview?.confirmedBookings ?? 0,
        icon: CheckCircle2,
        barClassName: "bg-blue-500",
        textClassName: "text-blue-700 dark:text-blue-300",
      },
      {
        key: "cancelled",
        label: "Cancelled",
        value: overview?.cancelledBookings ?? 0,
        icon: XCircle,
        barClassName: "bg-red-500",
        textClassName: "text-red-700 dark:text-red-300",
      },
    ];

    const total = rows.reduce((sum, row) => sum + row.value, 0);
    return rows.map((row) => ({
      ...row,
      percentage: total > 0 ? (row.value / total) * 100 : 0,
    }));
  }, [overview]);

  const topListings = useMemo(
    () =>
      [...listings]
        .sort(
          (a, b) =>
            b.requestCount - a.requestCount ||
            b.confirmedRequests - a.confirmedRequests ||
            a.name.localeCompare(b.name),
        )
        .slice(0, TOP_LISTING_LIMIT),
    [listings],
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
            Performance analytics are only available to equipment owners.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-[#FAF7F2] dark:bg-transparent sm:-mx-2 sm:px-2">
      <motion.header
        initial={reducedMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.45 }}
        className="space-y-3"
      >
        <Link
          href="/dashboard/owner"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B7B6B] transition-colors hover:text-[#C2561B] dark:text-stone-400 dark:hover:text-orange-400"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Owner Dashboard
        </Link>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#2E2119] dark:text-stone-100 sm:text-3xl">
            Rental Performance Analytics
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#8B7B6B] dark:text-stone-400">
            Track your listings, rental requests, and successful payment volume
            from your own account data only.
          </p>
        </div>
      </motion.header>

      {overviewError ? (
        <ErrorBanner
          message={overviewError}
          onRetry={retryOverview}
          actionLabel="Retry metrics"
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Paid rental volume"
          value={formatCurrency(
            overview?.paidRentalVolume ?? 0,
            overview?.currency,
          )}
          support={
            overview
              ? `${formatCount(overview.paidTransactions)} successful ${
                  overview.paidTransactions === 1 ? "transaction" : "transactions"
                }`
              : "—"
          }
          icon={CircleDollarSign}
          iconClassName="bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-emerald-300"
          index={0}
          reducedMotion={reducedMotion}
          isLoading={overviewLoading && !overview}
        />
        <MetricCard
          title="Rental requests"
          value={formatCount(overview?.totalBookings ?? 0)}
          support={
            overview
              ? `${formatCount(overview.confirmedBookings)} confirmed requests`
              : "—"
          }
          icon={CalendarCheck2}
          iconClassName="bg-orange-50 text-[#C2561B] dark:bg-orange-950/40 dark:text-orange-300"
          index={1}
          reducedMotion={reducedMotion}
          isLoading={overviewLoading && !overview}
        />
        <MetricCard
          title="Published listings"
          value={formatCount(overview?.approvedEquipment ?? 0)}
          support={
            overview
              ? `${formatCount(overview.totalEquipment)} total listings · ${formatCount(overview.availableEquipment)} available`
              : "—"
          }
          icon={Boxes}
          iconClassName="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
          index={2}
          reducedMotion={reducedMotion}
          isLoading={overviewLoading && !overview}
        />
        <MetricCard
          title="Fulfilled rentals"
          value={formatCount(overview?.completedRentals ?? 0)}
          support="Confirmed bookings with a successful payment"
          icon={CheckCircle2}
          iconClassName="bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
          index={3}
          reducedMotion={reducedMotion}
          isLoading={overviewLoading && !overview}
        />
      </div>

      {overview?.definitions?.paidRentalVolume ? (
        <p className="text-[11px] leading-5 text-[#9A8A79] dark:text-stone-500">
          {overview.definitions.paidRentalVolume}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EDE1D6] bg-white px-4 py-3 shadow-sm dark:border-stone-800 dark:bg-[#111310] sm:px-5">
        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] text-[#9A8A79] uppercase dark:text-stone-500">
            Historical analytics
          </p>
          <p className="mt-1 text-sm text-[#6F5D4D] dark:text-stone-300">
            Choose a year to update both charts together.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="owner-analytics-year"
            className="text-[11px] font-bold tracking-[0.12em] text-[#8B7B6B] uppercase dark:text-stone-400"
          >
            Year
          </label>
          <NativeSelect
            id="owner-analytics-year"
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="w-24 [&_select]:border-[#E6D8C8] [&_select]:bg-[#FCFAF7] [&_select]:font-bold [&_select]:text-[#3B2F27] [&_select]:transition-colors dark:[&_select]:border-stone-700 dark:[&_select]:bg-stone-900 dark:[&_select]:text-stone-100"
          >
            {availableYears.map((year) => (
              <NativeSelectOption key={year} value={year}>
                {year}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={chartsLoading || overviewLoading || listingsLoading}
            className="rounded-lg border-[#E6D8C8] bg-[#FCFAF7] text-[#6F5D4D] hover:border-[#D9601B] hover:text-[#C2561B] disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
          >
            <RefreshCw
              className={chartsLoading ? "animate-spin" : ""}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <MonthlyRevenueChart
          data={revenue}
          isLoading={chartsLoading}
          error={revenueError}
          onRetry={retryCharts}
          reducedMotion={reducedMotion}
          title="Monthly Paid Rental Volume"
          eyebrow="Your financial performance"
          subtitle="Successful payments for your equipment"
          accentColor="#16A34A"
          tooltipName="Paid rental volume"
          footnote={
            revenue?.revenueBasis ??
            "Successful payments tied to your equipment are grouped by creation month."
          }
        />
        <MonthlyBookingVolumeChart
          data={bookings}
          isLoading={chartsLoading}
          error={bookingsError}
          onRetry={retryCharts}
          reducedMotion={reducedMotion}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <motion.section
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: reducedMotion ? 0 : 0.42 }}
          className="rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-[#111310] sm:p-6"
        >
          <h2 className="text-lg font-bold text-[#2E2119] dark:text-stone-100">
            Rental request mix
          </h2>
          <p className="mt-1 text-xs text-[#8B7B6B] dark:text-stone-400">
            Current status breakdown for all your rental requests.
          </p>

          <div className="mt-5 space-y-4">
            {overviewLoading && !overview ? (
              Array.from({ length: 3 }, (_, index) => (
                <Skeleton
                  key={index}
                  className="h-14 rounded-xl bg-[#F3E9DE] dark:bg-stone-800"
                />
              ))
            ) : overview && overview.totalBookings > 0 ? (
              bookingMix.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.key}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="inline-flex min-w-0 items-center gap-2 font-semibold text-[#5B4A3B] dark:text-stone-300">
                        <Icon
                          aria-hidden="true"
                          className={`size-4 shrink-0 ${row.textClassName}`}
                        />
                        <span className="truncate">{row.label}</span>
                      </span>
                      <span className="shrink-0 font-extrabold text-[#2E2119] dark:text-stone-100">
                        {formatCount(row.value)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#F3E9DE] dark:bg-stone-800">
                      <motion.div
                        initial={reducedMotion ? false : { width: 0 }}
                        whileInView={{ width: `${row.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: reducedMotion ? 0 : 0.6 }}
                        className={`h-full rounded-full ${row.barClassName}`}
                      />
                    </div>
                    <p className="mt-1 text-[10px] font-semibold text-[#9A8A79] dark:text-stone-500">
                      {row.percentage.toFixed(1)}% of requests
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="flex items-start gap-2 rounded-xl border border-dashed border-[#E6D8C8] bg-[#FCFAF7] px-3 py-4 text-xs text-[#8B7B6B] dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-400">
                <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  No rental requests exist for your equipment yet. The status
                  mix will appear automatically when requests arrive.
                </span>
              </div>
            )}
          </div>
        </motion.section>

        <motion.section
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: reducedMotion ? 0 : 0.42, delay: reducedMotion ? 0 : 0.06 }}
          className="rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-[#111310] sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-[#2E2119] dark:text-stone-100">
                Listing performance
              </h2>
              <p className="mt-1 text-xs text-[#8B7B6B] dark:text-stone-400">
                Ranked by real rental request counts.
              </p>
            </div>
            {!listingsLoading && !listingsError && listings.length > 0 ? (
              <p className="text-[11px] font-semibold text-[#9A8A79] dark:text-stone-500">
                Top {formatCount(topListings.length)} of{" "}
                {formatCount(listings.length)}
              </p>
            ) : null}
          </div>

          <div className="mt-5">
            {listingsLoading && listings.length === 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton
                    key={index}
                    className="h-42 rounded-2xl bg-[#F3E9DE] dark:bg-stone-800"
                  />
                ))}
              </div>
            ) : listingsError ? (
              <ErrorBanner
                message={listingsError}
                onRetry={retryListings}
                actionLabel="Retry listings"
              />
            ) : topListings.length === 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[#E6D8C8] bg-[#FCFAF7] px-4 py-5 dark:border-stone-700 dark:bg-stone-900/40">
                <p className="text-sm text-[#8B7B6B] dark:text-stone-400">
                  You have no equipment listings to measure yet.
                </p>
                <Link
                  href="/dashboard/owner/add-equipment"
                  className="text-sm font-bold text-[#C2561B] transition hover:text-[#9A3412] dark:text-orange-400 dark:hover:text-orange-300"
                >
                  Add equipment →
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {topListings.map((equipment, index) => (
                  <ListingPerformanceCard
                    key={equipment.id}
                    equipment={equipment}
                    currency={revenue?.currency ?? overview?.currency}
                    index={index}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default OwnerAnalyticsPage;
