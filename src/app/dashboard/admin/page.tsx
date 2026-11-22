"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  CircleDollarSign,
  Clock3,
  ClipboardList,
  Package,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import MonthlyBookingsChart from "@/components/admin/monthly-bookings-chart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchAdminAnalytics,
  type AdminAnalyticsData,
  type AdminLatestBooking,
  type BookingStatus,
  type PaymentStatus,
} from "@/lib/admin-analytics-api";
import { useSession } from "@/lib/auth-client";

const FALLBACK_IMAGE = "/equipment-fallback.svg";

const statusStyles: Record<BookingStatus, string> = {
  confirmed:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  completed:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  cancelled:
    "border-stone-200 bg-stone-100 text-stone-600 dark:border-stone-700 dark:bg-stone-800/50 dark:text-stone-300",
};

const paymentStyles: Record<PaymentStatus, string> = {
  paid: "text-emerald-700 dark:text-emerald-300",
  unpaid: "text-amber-700 dark:text-amber-300",
  refunded: "text-stone-500 dark:text-stone-400",
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
  const date = new Date(value);
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

const normalizeBookingStatus = (value: string): BookingStatus => {
  const normalized = value.toLowerCase();
  if (normalized === "pending") return "pending";
  if (normalized === "completed" || normalized === "complete") return "completed";
  if (normalized === "cancelled" || normalized === "canceled") return "cancelled";
  return "confirmed";
};

const normalizePaymentStatus = (value: string): PaymentStatus => {
  const normalized = value.toLowerCase();
  if (normalized === "unpaid" || normalized === "refunded") return normalized;
  return "paid";
};

type StatCardProps = {
  title: string;
  value: string;
  support: string;
  icon: LucideIcon;
  iconClassName: string;
  dotClassName: string;
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
  dotClassName,
  index,
  reducedMotion,
  isLoading,
}: StatCardProps) => (
  <motion.article
    initial={reducedMotion ? false : { opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: reducedMotion ? 0 : 0.45,
      delay: reducedMotion ? 0 : index * 0.07,
      ease: [0.22, 1, 0.36, 1],
    }}
    whileHover={reducedMotion ? undefined : { y: -4 }}
    className="group rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-[0_8px_28px_-22px_rgba(67,42,20,0.55)] transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(67,42,20,0.55)] dark:border-stone-800 dark:bg-[#111310]"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-bold tracking-[0.14em] text-[#9A8A79] uppercase dark:text-stone-500">
          {title}
        </p>
        {isLoading ? (
          <Skeleton className="mt-3 h-9 w-24 bg-[#F3E9DE] dark:bg-stone-800" />
        ) : (
          <p className="mt-3 truncate text-3xl font-extrabold tracking-tight text-[#2E2119] dark:text-stone-100">
            {value}
          </p>
        )}
      </div>
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${iconClassName}`}
      >
        <Icon aria-hidden="true" className="size-5" />
      </span>
    </div>

    <div className="mt-4 flex min-h-5 items-center gap-2 border-t border-[#F1E9E0] pt-3 text-xs text-[#8B7B6B] dark:border-stone-800 dark:text-stone-400">
      {isLoading ? (
        <Skeleton className="h-3 w-36 bg-[#F3E9DE] dark:bg-stone-800" />
      ) : (
        <>
          <span className={`size-1.5 shrink-0 rounded-full ${dotClassName}`} />
          <span className="truncate">{support}</span>
        </>
      )}
    </div>
  </motion.article>
);

type CompactStatProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  accentClassName: string;
  iconClassName: string;
  href?: string;
  linkLabel?: string;
  isLoading: boolean;
  index: number;
  reducedMotion: boolean;
};

const CompactStat = ({
  title,
  value,
  icon: Icon,
  accentClassName,
  iconClassName,
  href,
  linkLabel = "Manage",
  isLoading,
  index,
  reducedMotion,
}: CompactStatProps) => (
  <motion.div
    initial={reducedMotion ? false : { opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: reducedMotion ? 0 : 0.4,
      delay: reducedMotion ? 0 : 0.32 + index * 0.06,
    }}
    whileHover={reducedMotion ? undefined : { y: -3 }}
    className={`flex items-center justify-between gap-3 rounded-xl border border-[#EDE1D6] border-l-4 bg-white px-4 py-3.5 shadow-sm dark:border-stone-800 dark:bg-[#111310] ${accentClassName}`}
  >
    <div className="flex min-w-0 items-center gap-3">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold tracking-wide text-[#8B7B6B] uppercase dark:text-stone-500">
          {title}
        </p>
        {isLoading ? (
          <Skeleton className="mt-1.5 h-5 w-12 bg-[#F3E9DE] dark:bg-stone-800" />
        ) : (
          <p className="mt-0.5 text-lg font-extrabold text-[#2E2119] dark:text-stone-100">
            {value}
          </p>
        )}
      </div>
    </div>

    {href ? (
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#C2561B] transition hover:gap-1.5 hover:text-[#9A3F0E] dark:text-orange-400 dark:hover:text-orange-300"
      >
        {linkLabel}
        <ArrowUpRight aria-hidden="true" className="size-3.5" />
      </Link>
    ) : null}
  </motion.div>
);

type QuickActionProps = {
  title: string;
  count: string;
  countLabel: string;
  buttonLabel: string;
  href: string;
  icon: LucideIcon;
  iconClassName: string;
  isLoading: boolean;
  index: number;
  reducedMotion: boolean;
};

const QuickAction = ({
  title,
  count,
  countLabel,
  buttonLabel,
  href,
  icon: Icon,
  iconClassName,
  isLoading,
  index,
  reducedMotion,
}: QuickActionProps) => (
  <motion.div
    initial={reducedMotion ? false : { opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{
      duration: reducedMotion ? 0 : 0.4,
      delay: reducedMotion ? 0 : index * 0.08,
    }}
    whileHover={reducedMotion ? undefined : { y: -4 }}
    className="group rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-sm transition-shadow hover:border-[#E7B68C] hover:shadow-[0_16px_34px_-24px_rgba(67,42,20,0.6)] dark:border-stone-800 dark:bg-[#111310] dark:hover:border-orange-900/60"
  >
    <div className="flex items-start justify-between gap-4">
      <span
        className={`flex size-10 items-center justify-center rounded-xl ${iconClassName}`}
      >
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="text-[10px] font-bold tracking-[0.14em] text-[#9A8A79] uppercase dark:text-stone-500">
        {countLabel}
      </span>
    </div>

    {isLoading ? (
      <Skeleton className="mt-5 h-8 w-16 bg-[#F3E9DE] dark:bg-stone-800" />
    ) : (
      <p className="mt-5 text-2xl font-extrabold text-[#2E2119] dark:text-stone-100">
        {count}
      </p>
    )}
    <h3 className="mt-1 text-sm font-semibold text-[#6F5D4D] dark:text-stone-300">
      {title}
    </h3>

    <Button
      render={<Link href={href} />}
      nativeButton={false}
      size="sm"
      className="mt-4 w-full rounded-lg bg-[#F6E7D8] text-xs font-bold text-[#A8470F] hover:bg-[#F97316] hover:text-white dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-600 dark:hover:text-white"
    >
      {buttonLabel}
      <ArrowRight aria-hidden="true" />
    </Button>
  </motion.div>
);

const BookingRowsSkeleton = () => (
  <div className="divide-y divide-[#F1E9E0] dark:divide-stone-800">
    {Array.from({ length: 5 }, (_, index) => (
      <div
        key={index}
        className="grid min-w-[900px] grid-cols-[minmax(220px,2fr)_minmax(200px,1.6fr)_120px_140px_140px_100px] items-center gap-4 px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-lg bg-[#F3E9DE] dark:bg-stone-800" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 bg-[#F3E9DE] dark:bg-stone-800" />
            <Skeleton className="h-3 w-24 bg-[#F3E9DE] dark:bg-stone-800" />
          </div>
        </div>
        <Skeleton className="h-4 w-40 bg-[#F3E9DE] dark:bg-stone-800" />
        <Skeleton className="h-4 w-20 bg-[#F3E9DE] dark:bg-stone-800" />
        <Skeleton className="h-6 w-20 rounded-full bg-[#F3E9DE] dark:bg-stone-800" />
        <Skeleton className="h-4 w-24 bg-[#F3E9DE] dark:bg-stone-800" />
        <Skeleton className="h-8 w-20 rounded-lg bg-[#F3E9DE] dark:bg-stone-800" />
      </div>
    ))}
  </div>
);

const BookingRow = ({
  booking,
  index,
  reducedMotion,
}: {
  booking: AdminLatestBooking;
  index: number;
  reducedMotion: boolean;
}) => {
  const status = normalizeBookingStatus(booking.status);
  const paymentStatus = normalizePaymentStatus(booking.paymentStatus);
  const equipmentName = booking.equipmentName?.trim() || "Equipment unavailable";

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: reducedMotion ? 0 : 0.35,
        delay: reducedMotion ? 0 : index * 0.05,
      }}
      className="grid min-w-[900px] grid-cols-[minmax(220px,2fr)_minmax(200px,1.6fr)_120px_140px_140px_100px] items-center gap-4 border-t border-[#F1E9E0] px-5 py-4 first:border-t-0 dark:border-stone-800"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-[#F3E9DE] dark:bg-stone-800">
          {booking.equipmentImage ? (
            <Image
              src={booking.equipmentImage}
              alt=""
              fill
              unoptimized
              sizes="44px"
              className="object-cover"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          ) : (
            <Package
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-[#B49B82]"
            />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#2E2119] dark:text-stone-100">
            {equipmentName}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-[#9A8A79] dark:text-stone-500">
            {booking.id || "ID unavailable"}
          </p>
        </div>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#4A3A2E] dark:text-stone-200">
          {booking.renterName || "Renter unavailable"}
        </p>
        <p className="mt-0.5 truncate text-xs text-[#9A8A79] dark:text-stone-500">
          {booking.renterEmail || "Email unavailable"}
        </p>
      </div>

      <p className="text-sm font-extrabold text-[#C2561B] dark:text-orange-400">
        {formatCurrency(booking.totalAmount, booking.currency)}
      </p>

      <div className="min-w-0">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusStyles[status]}`}
        >
          {capitalize(status)}
        </span>
        <p className={`mt-1 text-[10px] font-semibold ${paymentStyles[paymentStatus]}`}>
          {capitalize(paymentStatus)} payment
        </p>
      </div>

      <p className="text-xs font-semibold text-[#8B7B6B] dark:text-stone-400">
        {formatDate(booking.createdAt)}
      </p>

      <Button
        render={
          <Link
            href={`/dashboard/admin/rentals?booking=${encodeURIComponent(booking.id)}`}
          />
        }
        nativeButton={false}
        variant="outline"
        size="sm"
        className="justify-center rounded-lg border-[#EDE1D6] bg-white text-[11px] font-bold text-[#6F5D4D] hover:border-[#F97316] hover:text-[#C2561B] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
      >
        Details
        <ArrowUpRight aria-hidden="true" />
      </Button>
    </motion.div>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-44 w-full rounded-2xl bg-[#F3E9DE] dark:bg-stone-800" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton
          key={index}
          className="h-36 rounded-2xl bg-[#F3E9DE] dark:bg-stone-800"
        />
      ))}
    </div>
    <Skeleton className="h-96 w-full rounded-2xl bg-[#F3E9DE] dark:bg-stone-800" />
  </div>
);

const AdminDashboardPage = () => {
  const { data: session, isPending: isSessionPending } = useSession();
  const shouldReduceMotion = Boolean(useReducedMotion());
  const isAdmin = session?.user?.role === "admin";

  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);

  useEffect(() => {
    if (isSessionPending || !isAdmin) return;

    const controller = new AbortController();

    void (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchAdminAnalytics(controller.signal);
        if (!controller.signal.aborted) setData(response.data);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not load platform analytics.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [isAdmin, isSessionPending, refreshKey]);

  if (isSessionPending) return <DashboardSkeleton />;

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

  const hasData = Boolean(data) && !error;
  const displayCount = (value?: number) =>
    hasData ? formatCount(value ?? 0) : "—";

  const primaryCards = [
    {
      title: "Total Users",
      value: displayCount(data?.totalUsers),
      support: hasData
        ? `${formatCount(data?.totalOwners ?? 0)} owners · ${formatCount(
            data?.totalRenters ?? 0,
          )} renters`
        : "Unavailable",
      icon: Users,
      iconClassName: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
      dotClassName: "bg-blue-500",
    },
    {
      title: "Total Equipment",
      value: displayCount(data?.totalEquipment),
      support: hasData
        ? `${formatCount(data?.approvedEquipment ?? 0)} approved · ${formatCount(
            data?.pendingEquipment ?? 0,
          )} pending`
        : "Unavailable",
      icon: Package,
      iconClassName:
        "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
      dotClassName: "bg-violet-500",
    },
    {
      title: "Total Bookings",
      value: displayCount(data?.totalBookings),
      support: hasData
        ? `${formatCount(data?.confirmedBookings ?? 0)} confirmed · ${formatCount(
            data?.pendingBookings ?? 0,
          )} pending · ${formatCount(data?.completedBookings ?? 0)} completed`
        : "Unavailable",
      icon: CalendarCheck2,
      iconClassName:
        "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
      dotClassName: "bg-orange-500",
    },
    {
      title: "Total Platform Revenue",
      value:
        hasData && data
          ? formatCurrency(data.totalRevenue, data.currency)
          : "—",
      support: hasData
        ? `${formatCount(data?.paidTransactions ?? 0)} successful payments`
        : "Unavailable",
      icon: CircleDollarSign,
      iconClassName:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      dotClassName: "bg-amber-500",
    },
  ];

  const compactStats: CompactStatProps[] = [
    {
      title: "Total Owners",
      value: displayCount(data?.totalOwners),
      icon: UserRound,
      accentClassName: "border-l-blue-400",
      iconClassName: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
      href: "/dashboard/admin/users",
      linkLabel: "Users",
      isLoading,
      index: 0,
      reducedMotion: shouldReduceMotion,
    },
    {
      title: "Total Renters",
      value: displayCount(data?.totalRenters),
      icon: Users,
      accentClassName: "border-l-violet-400",
      iconClassName:
        "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
      href: "/dashboard/admin/users",
      linkLabel: "Users",
      isLoading,
      index: 1,
      reducedMotion: shouldReduceMotion,
    },
    {
      title: "Pending Equipment",
      value: displayCount(data?.pendingEquipment),
      icon: Package,
      accentClassName: "border-l-amber-400",
      iconClassName:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      href: "/dashboard/admin/equipment",
      linkLabel: "Review",
      isLoading,
      index: 2,
      reducedMotion: shouldReduceMotion,
    },
    {
      title: "Pending Bookings",
      value: displayCount(data?.pendingBookings),
      icon: Clock3,
      accentClassName: "border-l-orange-400",
      iconClassName:
        "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
      href: "/dashboard/admin/rentals",
      linkLabel: "Rentals",
      isLoading,
      index: 3,
      reducedMotion: shouldReduceMotion,
    },
  ];

  const quickActions: QuickActionProps[] = [
    {
      title: "Pending Equipment Queue",
      count: displayCount(data?.pendingEquipment),
      countLabel: "Awaiting review",
      buttonLabel: "Review",
      href: "/dashboard/admin/equipment",
      icon: Package,
      iconClassName:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      isLoading,
      index: 0,
      reducedMotion: shouldReduceMotion,
    },
    {
      title: "Manage User Roles",
      count: displayCount(data?.totalUsers),
      countLabel: "Registered users",
      buttonLabel: "Users",
      href: "/dashboard/admin/users",
      icon: Users,
      iconClassName:
        "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
      isLoading,
      index: 1,
      reducedMotion: shouldReduceMotion,
    },
    {
      title: "All Platform Bookings",
      count: displayCount(data?.totalBookings),
      countLabel: "Lifetime rentals",
      buttonLabel: "Rentals",
      href: "/dashboard/admin/rentals",
      icon: ClipboardList,
      iconClassName:
        "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
      isLoading,
      index: 2,
      reducedMotion: shouldReduceMotion,
    },
  ];

  const latestBookings = data?.latestBookings ?? [];

  return (
    <div className="min-h-full space-y-6 rounded-2xl bg-[#FAF7F2] p-4 dark:bg-[#0B0D0B] sm:p-6 lg:p-7">
      <motion.section
        initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
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
            <motion.span
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-orange-300/40 bg-orange-100/15 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.2em] text-orange-300 uppercase"
            >
              <span className="size-1.5 rounded-full bg-orange-400" />
              Platform Control Center
            </motion.span>

            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.08 }}
              className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-[#FFF8EF] sm:text-3xl lg:text-[34px]"
            >
              RentalHub Global System Analytics
            </motion.h1>

            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.16 }}
              className="mt-3 max-w-2xl text-sm leading-7 text-[#E4D2C2]/80 sm:text-base"
            >
              Full administrative oversight over users, equipment approval
              queue, bookings, and revenue.
            </motion.p>
          </div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: 0.22 }}
            className="flex flex-wrap items-center gap-3"
          >
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-bold tracking-[0.14em] text-[#E4D2C2]/70 uppercase">
                Pending approvals
              </p>
              {isLoading ? (
                <Skeleton className="mt-1 h-7 w-12 bg-white/20" />
              ) : (
                <p className="mt-1 text-2xl font-extrabold text-white">
                  {hasData ? formatCount(data?.pendingEquipment ?? 0) : "—"}
                </p>
              )}
            </div>

            <motion.div
              whileHover={shouldReduceMotion ? undefined : { y: -3 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            >
              <Button
                render={<Link href="/dashboard/admin/equipment" />}
                nativeButton={false}
                className="h-11 rounded-xl bg-[#F97316] px-5 text-sm font-bold text-white shadow-lg shadow-orange-950/30 hover:bg-[#EA580C]"
              >
                Review Pending Approvals
                {hasData ? (
                  <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-extrabold">
                    {formatCount(data?.pendingEquipment ?? 0)}
                  </span>
                ) : null}
                <ArrowRight aria-hidden="true" />
              </Button>
            </motion.div>

            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              onClick={refresh}
              aria-label="Refresh dashboard analytics"
              title="Refresh dashboard analytics"
              className="size-11 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <RefreshCw
                aria-hidden="true"
                className={isLoading ? "animate-spin" : ""}
              />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-200">
          <span>{error}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refresh}
            className="border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-stone-900 dark:text-red-300"
          >
            <RefreshCw aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : null}

      <section aria-label="Primary platform statistics">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {primaryCards.map((card, index) => (
            <StatCard
              key={card.title}
              {...card}
              index={index}
              reducedMotion={shouldReduceMotion}
              isLoading={isLoading}
            />
          ))}
        </div>
      </section>

      <section aria-label="Secondary platform statistics">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {compactStats.map((stat) => (
            <CompactStat key={stat.title} {...stat} />
          ))}
        </div>
      </section>

      <MonthlyBookingsChart isAdmin={isAdmin} refreshKey={refreshKey} />

      <motion.section
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
      >
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#2E2119] dark:text-stone-100 sm:text-xl">
              Quick Management Shortcuts
            </h2>
            <p className="mt-1 text-xs text-[#8B7B6B] dark:text-stone-400 sm:text-sm">
              Jump straight into the queues that need attention.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <QuickAction key={action.title} {...action} />
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
        className="overflow-hidden rounded-2xl border border-[#EDE1D6] bg-white shadow-[0_8px_28px_-22px_rgba(67,42,20,0.55)] dark:border-stone-800 dark:bg-[#111310]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1E9E0] px-5 py-4 dark:border-stone-800">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#2E2119] dark:text-stone-100 sm:text-xl">
              Latest Platform Bookings
            </h2>
            <p className="mt-1 text-xs text-[#8B7B6B] dark:text-stone-400 sm:text-sm">
              The newest rental activity across GearNest.
            </p>
          </div>

          <Button
            render={<Link href="/dashboard/admin/rentals" />}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="rounded-lg border-[#EDE1D6] bg-white text-xs font-bold text-[#6F5D4D] hover:border-[#F97316] hover:text-[#C2561B] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
          >
            View All Rentals
            <ArrowUpRight aria-hidden="true" />
          </Button>
        </div>

        {isLoading ? (
          <div className="overflow-x-auto">
            <BookingRowsSkeleton />
          </div>
        ) : error ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-[#6F5D4D] dark:text-stone-300">
              Latest bookings could not be loaded.
            </p>
            <p className="text-xs text-[#9A8A79] dark:text-stone-500">{error}</p>
          </div>
        ) : latestBookings.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <ClipboardList
              aria-hidden="true"
              className="size-8 text-[#C8B8A8] dark:text-stone-600"
            />
            <p className="text-sm font-semibold text-[#6F5D4D] dark:text-stone-300">
              No bookings have been recorded yet.
            </p>
            <p className="text-xs text-[#9A8A79] dark:text-stone-500">
              New rentals will appear here as soon as they are created.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {latestBookings.map((booking, index) => (
              <BookingRow
                key={booking.id || `${booking.createdAt}-${index}`}
                booking={booking}
                index={index}
                reducedMotion={shouldReduceMotion}
              />
            ))}
          </div>
        )}
      </motion.section>

      <p className="pb-2 text-center text-[11px] text-[#A69482] dark:text-stone-600">
        All figures are aggregated live from GearNest&apos;s database.
      </p>
    </div>
  );
};

export default AdminDashboardPage;
