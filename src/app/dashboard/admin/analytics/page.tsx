"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Boxes,
  CalendarCheck2,
  CircleDollarSign,
  RefreshCw,
  ShieldCheck,
  Users,
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
import {
  fetchAdminAnalytics,
  fetchAdminMonthlyBookings,
  fetchAdminMonthlyRevenue,
  type AdminAnalyticsOverview,
  type AdminMonthlyBookingsData,
  type AdminMonthlyRevenueData,
} from "@/lib/admin-analytics-api";
import { useSession } from "@/lib/auth-client";

type MetricCardProps = {
  title: string;
  value: string;
  support: string;
  icon: ReactNode;
  iconClassName: string;
  index: number;
  reducedMotion: boolean;
  isLoading: boolean;
};

const MetricCard = ({
  title,
  value,
  support,
  icon,
  iconClassName,
  index,
  reducedMotion,
  isLoading,
}: MetricCardProps) => (
  <motion.article
    initial={reducedMotion ? false : { opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: reducedMotion ? 0 : 0.4,
      delay: reducedMotion ? 0 : index * 0.07,
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
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 [&_svg]:size-5 ${
          reducedMotion ? "" : "group-hover:scale-105"
        } ${iconClassName}`}
      >
        {icon}
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
  <div className="space-y-6">
    <Skeleton className="h-5 w-40 bg-[#F3E9DE] dark:bg-stone-800" />
    <div className="space-y-2">
      <Skeleton className="h-9 w-full max-w-md bg-[#F3E9DE] dark:bg-stone-800" />
      <Skeleton className="h-4 w-full max-w-xl bg-[#F3E9DE] dark:bg-stone-800" />
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

const getErrorMessage = (caught: unknown, fallback: string) =>
  caught instanceof Error ? caught.message : fallback;

const AdminAnalyticsPage = () => {
  const { data: session, isPending: isSessionPending } = useSession();
  const reducedMotion = Boolean(useReducedMotion());
  const isAdmin = session?.user?.role === "admin";

  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [overview, setOverview] = useState<AdminAnalyticsOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [overviewRetryKey, setOverviewRetryKey] = useState(0);

  const [revenue, setRevenue] = useState<AdminMonthlyRevenueData | null>(null);
  const [bookings, setBookings] = useState<AdminMonthlyBookingsData | null>(null);
  const [revenueError, setRevenueError] = useState<string | null>(null);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [chartsRetryKey, setChartsRetryKey] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);
  const retryCharts = useCallback(
    () => setChartsRetryKey((value) => value + 1),
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
    if (isSessionPending || !isAdmin) return;

    const controller = new AbortController();

    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setOverviewLoading(true);
      setOverviewError(null);

      void (async () => {
        try {
          const response = await fetchAdminAnalytics(controller.signal);
          if (!controller.signal.aborted) setOverview(response.data);
        } catch (caught) {
          if (controller.signal.aborted) return;
          setOverviewError(
            getErrorMessage(caught, "Could not load platform analytics."),
          );
        } finally {
          if (!controller.signal.aborted) setOverviewLoading(false);
        }
      })();
    });

    return () => controller.abort();
  }, [isAdmin, isSessionPending, overviewRetryKey, refreshKey]);

  useEffect(() => {
    if (isSessionPending || !isAdmin || selectedYear === null) return;

    const controller = new AbortController();

    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setChartsLoading(true);
      setRevenueError(null);
      setBookingsError(null);

      void (async () => {
        const [revenueResult, bookingsResult] = await Promise.allSettled([
          fetchAdminMonthlyRevenue(selectedYear, controller.signal),
          fetchAdminMonthlyBookings(selectedYear, controller.signal),
        ]);

        if (controller.signal.aborted) return;

        setRevenue(
          revenueResult.status === "fulfilled" ? revenueResult.value.data : null,
        );
        setRevenueError(
          revenueResult.status === "rejected"
            ? getErrorMessage(
                revenueResult.reason,
                "Could not load monthly revenue.",
              )
            : null,
        );
        setBookings(
          bookingsResult.status === "fulfilled"
            ? bookingsResult.value.data
            : null,
        );
        setBookingsError(
          bookingsResult.status === "rejected"
            ? getErrorMessage(
                bookingsResult.reason,
                "Could not load monthly bookings.",
              )
            : null,
        );
        setChartsLoading(false);
      })();
    });

    return () => controller.abort();
  }, [isAdmin, isSessionPending, selectedYear, chartsRetryKey, refreshKey]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    if (currentYear !== null) years.add(currentYear);
    if (selectedYear !== null) years.add(selectedYear);
    for (const year of revenue?.availableYears ?? []) years.add(year);
    for (const year of bookings?.availableYears ?? []) years.add(year);
    return [...years].sort((a, b) => b - a);
  }, [bookings?.availableYears, currentYear, revenue?.availableYears, selectedYear]);

  if (isSessionPending || selectedYear === null) return <PageSkeleton />;

  if (!isAdmin) {
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
            Platform analytics are only available to administrators.
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
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B7B6B] transition-colors hover:text-[#C2561B] dark:text-stone-400 dark:hover:text-orange-400"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Admin Console
        </Link>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#2E2119] dark:text-stone-100 sm:text-3xl">
            Global Platform Performance Overview
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#8B7B6B] dark:text-stone-400">
            Comprehensive financial metrics, rental confirmation rates, and
            platform booking velocities.
          </p>
        </div>
      </motion.header>

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
            onClick={() => setOverviewRetryKey((value) => value + 1)}
            className="rounded-lg border-red-200 bg-white text-red-700 dark:border-red-800 dark:bg-stone-900 dark:text-red-300"
          >
            <RefreshCw aria-hidden="true" />
            Retry metrics
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Paid Rental Volume"
          value={formatCurrency(
            overview?.totalRevenue ?? 0,
            overview?.currency,
          )}
          support="Total paid rentals"
          icon={<CircleDollarSign aria-hidden="true" />}
          iconClassName="bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-emerald-300"
          index={0}
          reducedMotion={reducedMotion}
          isLoading={overviewLoading && !overview}
        />
        <MetricCard
          title="Total Bookings"
          value={formatCount(overview?.totalBookings ?? 0)}
          support="Across all categories"
          icon={<CalendarCheck2 aria-hidden="true" />}
          iconClassName="bg-orange-50 text-[#C2561B] dark:bg-orange-950/40 dark:text-orange-300"
          index={1}
          reducedMotion={reducedMotion}
          isLoading={overviewLoading && !overview}
        />
        <MetricCard
          title="Total Users"
          value={formatCount(overview?.totalUsers ?? 0)}
          support="Registered platform accounts"
          icon={<Users aria-hidden="true" />}
          iconClassName="bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
          index={2}
          reducedMotion={reducedMotion}
          isLoading={overviewLoading && !overview}
        />
        <MetricCard
          title="Total Listed Machinery"
          value={formatCount(overview?.totalEquipment ?? 0)}
          support={`${
            overview ? formatCount(overview.pendingEquipment) : "—"
          } number of equipment listings pending review`}
          icon={<Boxes aria-hidden="true" />}
          iconClassName="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
          index={3}
          reducedMotion={reducedMotion}
          isLoading={overviewLoading && !overview}
        />
      </div>

      {overview && overview.paidTransactions > 0 ? null : (
        <p className="text-[11px] leading-5 text-[#9A8A79] dark:text-stone-500">
          GearNest does not store a commission or platform-fee field on payment
          records, so revenue is shown as gross paid rental volume rather than
          platform earnings.
        </p>
      )}

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
            htmlFor="analytics-year"
            className="text-[11px] font-bold tracking-[0.12em] text-[#8B7B6B] uppercase dark:text-stone-400"
          >
            Year
          </label>
          <NativeSelect
            id="analytics-year"
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={chartsLoading || overviewLoading}
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
        />
        <MonthlyBookingVolumeChart
          data={bookings}
          isLoading={chartsLoading}
          error={bookingsError}
          onRetry={retryCharts}
          reducedMotion={reducedMotion}
        />
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
