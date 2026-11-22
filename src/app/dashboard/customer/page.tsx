"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Heart,
  Package,
  Star,
  Wallet,
  XCircle,
} from "lucide-react";
import { useReducedMotion } from "motion/react";

import CustomerBookingOverviewChart from "@/components/customer/customer-booking-overview-chart";
import CustomerBookingStatusCard from "@/components/customer/customer-booking-status-card";
import CustomerBookingStatusChart from "@/components/customer/customer-booking-status-chart";
import CustomerDashboardSkeleton from "@/components/customer/customer-dashboard-skeleton";
import {
  formatCount,
  formatMoney,
  formatUpdatedAt,
  getErrorMessage,
} from "@/components/customer/customer-dashboard-utils";
import CustomerPromotionalBanner from "@/components/customer/customer-promotional-banner";
import CustomerQuickActions from "@/components/customer/customer-quick-actions";
import CustomerRecentBookings from "@/components/customer/customer-recent-bookings";
import CustomerSectionError from "@/components/customer/customer-section-error";
import CustomerStatCard from "@/components/customer/customer-stat-card";
import CustomerWelcomeBanner from "@/components/customer/customer-welcome-banner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import {
  fetchCustomerBookingAnalytics,
  fetchCustomerBookingStatus,
  fetchCustomerDashboardOverview,
  fetchCustomerRecentBookings,
  type CustomerBookingAnalyticsData,
  type CustomerBookingPeriod,
  type CustomerBookingStatusData,
  type CustomerDashboardOverview,
  type CustomerRecentBookingsData,
} from "@/lib/customer-dashboard-api";

type SectionKey = "overview" | "status" | "analytics" | "recent";

type SectionState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

const initialSectionState = <T,>(): SectionState<T> => ({
  data: null,
  loading: true,
  error: null,
});

const CustomerDashboardPage = () => {
  const { data: session, isPending: isSessionPending } = useSession();
  const reducedMotion = Boolean(useReducedMotion());
  const role = session?.user?.role;
  const isCustomer = role === "customer";

  const [overview, setOverview] = useState<SectionState<CustomerDashboardOverview>>(
    initialSectionState,
  );
  const [status, setStatus] = useState<SectionState<CustomerBookingStatusData>>(
    initialSectionState,
  );
  const [analytics, setAnalytics] = useState<
    SectionState<CustomerBookingAnalyticsData>
  >(initialSectionState);
  const [recent, setRecent] = useState<SectionState<CustomerRecentBookingsData>>(
    initialSectionState,
  );
  const [period, setPeriod] = useState<CustomerBookingPeriod>("6months");
  const [reloadToken, setReloadToken] = useState(0);

  const loadOverview = useCallback(async (signal: AbortSignal) => {
    setOverview((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const data = await fetchCustomerDashboardOverview(signal);
      if (!signal.aborted) setOverview({ data, loading: false, error: null });
    } catch (caught) {
      if (!signal.aborted) {
        setOverview((previous) => ({
          ...previous,
          loading: false,
          error: getErrorMessage(caught, "Could not load your dashboard overview."),
        }));
      }
    }
  }, []);

  const loadStatus = useCallback(async (signal: AbortSignal) => {
    setStatus((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const data = await fetchCustomerBookingStatus(signal);
      if (!signal.aborted) setStatus({ data, loading: false, error: null });
    } catch (caught) {
      if (!signal.aborted) {
        setStatus((previous) => ({
          ...previous,
          loading: false,
          error: getErrorMessage(caught, "Could not load your booking status."),
        }));
      }
    }
  }, []);

  const loadAnalytics = useCallback(
    async (selectedPeriod: CustomerBookingPeriod, signal: AbortSignal) => {
      setAnalytics((previous) => ({ ...previous, loading: true, error: null }));
      try {
        const data = await fetchCustomerBookingAnalytics(selectedPeriod, signal);
        if (!signal.aborted) setAnalytics({ data, loading: false, error: null });
      } catch (caught) {
        if (!signal.aborted) {
          setAnalytics((previous) => ({
            ...previous,
            loading: false,
            error: getErrorMessage(caught, "Could not load your booking analytics."),
          }));
        }
      }
    },
    [],
  );

  const loadRecent = useCallback(async (signal: AbortSignal) => {
    setRecent((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const data = await fetchCustomerRecentBookings(3, signal);
      if (!signal.aborted) setRecent({ data, loading: false, error: null });
    } catch (caught) {
      if (!signal.aborted) {
        setRecent((previous) => ({
          ...previous,
          loading: false,
          error: getErrorMessage(caught, "Could not load your recent bookings."),
        }));
      }
    }
  }, []);

  useEffect(() => {
    if (isSessionPending || !session?.user || !isCustomer) return;

    const controller = new AbortController();
    queueMicrotask(() => {
      void loadOverview(controller.signal);
      void loadStatus(controller.signal);
      void loadRecent(controller.signal);
    });

    return () => controller.abort();
  }, [
    isSessionPending,
    session?.user,
    isCustomer,
    loadOverview,
    loadStatus,
    loadRecent,
    reloadToken,
  ]);

  useEffect(() => {
    if (isSessionPending || !session?.user || !isCustomer) return;

    const controller = new AbortController();
    queueMicrotask(() => void loadAnalytics(period, controller.signal));

    return () => controller.abort();
  }, [isSessionPending, session?.user, isCustomer, period, loadAnalytics, reloadToken]);

  const retrySection = useCallback((section: SectionKey) => {
    if (section === "analytics") {
      setReloadToken((value) => value + 1);
      return;
    }
    setReloadToken((value) => value + 1);
  }, []);

  const retryAll = useCallback(() => setReloadToken((value) => value + 1), []);

  if (isSessionPending) return <CustomerDashboardSkeleton />;

  if (!session?.user) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-orange-100 text-[#C2561B] dark:bg-orange-900/40 dark:text-orange-300">
          <Package className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-lg font-bold text-foreground">Please sign in</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Sign in to see your rentals, saved equipment, spending, and reviews.
        </p>
        <Button
          render={
            <Link href="/signin?callbackUrl=/dashboard/customer" />
          }
          nativeButton={false}
          className="mt-6 rounded-lg bg-[#F97316] text-white hover:bg-[#EA6A0F]"
        >
          Sign in
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    );
  }

  if (!isCustomer) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E6D8C8] bg-[#FCFAF7] px-6 py-16 text-center dark:border-stone-700 dark:bg-stone-900/40">
        <h1 className="text-lg font-bold text-[#2E2119] dark:text-stone-100">
          Customer dashboard only
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#8B7B6B] dark:text-stone-400">
          This overview is available to customer accounts. Use your role&apos;s
          dashboard from the sidebar instead.
        </p>
        <Button
          render={<Link href="/dashboard" />}
          nativeButton={false}
          variant="outline"
          className="mt-6 rounded-lg border-[#E6D8C8] dark:border-stone-700"
        >
          Go to Dashboard
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    );
  }

  const overviewData = overview.data;
  const statusData = status.data;
  const currency = overviewData?.currency ?? "BDT";
  const customerName =
    overviewData?.customerName || session.user.name || "Customer";

  const statCards = [
    {
      title: "Total Bookings",
      value: formatCount(overviewData?.totalBookings ?? 0),
      support: formatUpdatedAt(overviewData?.generatedAt),
      icon: CalendarCheck2,
      tone: "orange" as const,
    },
    {
      title: "Favorite Items",
      value: formatCount(overviewData?.favoriteItems ?? 0),
      support:
        overviewData?.favoriteItems === 0
          ? "No saved equipment yet"
          : "Saved equipment",
      icon: Heart,
      tone: "green" as const,
    },
    {
      title: "Total Spent",
      value: formatMoney(overviewData?.totalSpent ?? 0, currency),
      support: `${formatCount(
        overviewData?.paidTransactions ?? 0,
      )} successful ${overviewData?.paidTransactions === 1 ? "payment" : "payments"}`,
      icon: Wallet,
      tone: "blue" as const,
    },
    {
      title: "Your Reviews",
      value: formatCount(overviewData?.reviewsPublished ?? 0),
      support: "Published reviews",
      icon: Star,
      tone: "red" as const,
    },
  ];

  const statusCards = [
    {
      title: "Pending Bookings",
      value: formatCount(statusData?.statusCounts.pending ?? 0),
      support: "Awaiting confirmation",
      icon: Clock3,
      iconClassName:
        "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      href: "/dashboard/customer/bookings?status=pending",
    },
    {
      title: "Confirmed Bookings",
      value: formatCount(statusData?.statusCounts.confirmed ?? 0),
      support: "Ready to rent",
      icon: CheckCircle2,
      iconClassName:
        "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
      href: "/dashboard/customer/bookings?status=confirmed",
    },
    {
      title: "Completed Bookings",
      value: formatCount(statusData?.statusCounts.completed ?? 0),
      support: "Rental finished",
      icon: CheckCircle2,
      iconClassName:
        "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
      href: "/dashboard/customer/bookings?status=completed",
    },
    {
      title: "Cancelled Bookings",
      value: formatCount(statusData?.statusCounts.cancelled ?? 0),
      support: "No longer active",
      icon: XCircle,
      iconClassName: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
      href: "/dashboard/customer/bookings?status=cancelled",
    },
  ];

  return (
    <div className="mx-auto min-h-full w-full max-w-360 space-y-6 rounded-2xl bg-[#FAF7F2] p-4 dark:bg-[#0B0D0B] sm:p-6 lg:p-7">
      <CustomerWelcomeBanner
        customerName={customerName}
        isLoading={overview.loading}
        reducedMotion={reducedMotion}
      />

      {overview.error ? (
        <CustomerSectionError
          message={overview.error}
          onRetry={retryAll}
          title="Could not load your dashboard summary"
        />
      ) : (
        <section
          aria-label="Customer statistics"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {statCards.map((card, index) => (
            <CustomerStatCard
              key={card.title}
              {...card}
              index={index}
              reducedMotion={reducedMotion}
              isLoading={overview.loading}
            />
          ))}
        </section>
      )}

      {status.error ? (
        <CustomerSectionError
          message={status.error}
          onRetry={() => retrySection("status")}
          title="Could not load your booking status summary"
        />
      ) : (
        <section
          aria-label="Booking status summary"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {statusCards.map((card, index) => (
            <CustomerBookingStatusCard
              key={card.title}
              {...card}
              index={index}
              reducedMotion={reducedMotion}
              isLoading={status.loading}
            />
          ))}
        </section>
      )}

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <CustomerBookingOverviewChart
          data={analytics.data}
          period={period}
          onPeriodChange={setPeriod}
          isLoading={analytics.loading}
          error={analytics.error}
          onRetry={() => retrySection("analytics")}
          reducedMotion={reducedMotion}
        />
        <CustomerBookingStatusChart
          data={status.data}
          isLoading={status.loading}
          error={status.error}
          onRetry={() => retrySection("status")}
          reducedMotion={reducedMotion}
        />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <CustomerRecentBookings
          bookings={recent.data?.bookings ?? []}
          isLoading={recent.loading}
          error={recent.error}
          onRetry={() => retrySection("recent")}
          reducedMotion={reducedMotion}
        />
        <CustomerQuickActions reducedMotion={reducedMotion} />
      </div>

      <CustomerPromotionalBanner reducedMotion={reducedMotion} />
    </div>
  );
};

export default CustomerDashboardPage;
