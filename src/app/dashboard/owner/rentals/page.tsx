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
  ArrowLeft,
  Boxes,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Pencil,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useSession } from "@/lib/auth-client";
import {
  fetchOwnerRentalStats,
  fetchOwnerRentals,
  updateOwnerRentalStatus,
  type OwnerRentalStatus,
  type OwnerRentalStatusFilter,
  type OwnerRentalEquipment,
  type OwnerRentalEquipmentStatus,
  type OwnerRentalsData,
  type RentalBooking,
  type RentalStatistics,
} from "@/lib/owner-rentals-api";
import { useDebouncedValue } from "@/lib/use-debounced-value";

const FALLBACK_IMAGE = "/equipment-fallback.svg";
const PAGE_SIZE = 10;

const filters: { key: OwnerRentalStatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const bookingStatusStyles: Record<OwnerRentalStatus, string> = {
  pending:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300",
  confirmed:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300",
  completed:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/30 dark:text-teal-300",
  cancelled:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
};

const paymentStatusStyles: Record<RentalBooking["payment"]["status"], string> = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
  unpaid:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  refunded:
    "border-stone-200 bg-stone-100 text-stone-600 dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-300",
};

const actionStatusStyles: Record<OwnerRentalStatus, string> = {
  pending: "text-orange-700 dark:text-orange-300",
  confirmed: "text-blue-700 dark:text-blue-300",
  completed: "text-teal-700 dark:text-teal-300",
  cancelled: "text-red-700 dark:text-red-300",
};

const equipmentStatusStyles: Record<OwnerRentalEquipmentStatus, string> = {
  approved:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  rejected:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
};

const equipmentStatusLabel: Record<OwnerRentalEquipmentStatus, string> = {
  approved: "Published",
  pending: "In review",
  rejected: "Needs attention",
};

const emptyCounts: RentalStatistics["statusCounts"] = {
  all: 0,
  pending: 0,
  confirmed: 0,
  completed: 0,
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

const getErrorMessage = (caught: unknown, fallback: string) =>
  caught instanceof Error ? caught.message : fallback;

const actionLabel = (status: OwnerRentalStatus) => {
  if (status === "pending") return "Pending Approval";
  if (status === "confirmed") return "Confirmed";
  if (status === "completed") return "Completed";
  return "Cancelled";
};

const ActionIcon = ({ status }: { status: OwnerRentalStatus }) => {
  if (status === "pending") {
    return <Clock3 aria-hidden="true" className="size-4" />;
  }
  if (status === "confirmed") {
    return <CheckCircle2 aria-hidden="true" className="size-4" />;
  }
  if (status === "completed") {
    return <CheckCircle2 aria-hidden="true" className="size-4" />;
  }
  return <XCircle aria-hidden="true" className="size-4" />;
};

type DetailProps = {
  icon: ReactNode;
  label: string;
  value?: string;
};

const Detail = ({ icon, label, value }: DetailProps) => (
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
        className="mt-1 text-xs font-semibold break-words text-[#4A3A2E] dark:text-stone-200"
        title={value || undefined}
      >
        {value || "—"}
      </p>
    </div>
  </div>
);

type EquipmentCardProps = {
  equipment: OwnerRentalEquipment;
  index: number;
  reducedMotion: boolean;
};

const EquipmentCard = ({
  equipment,
  index,
  reducedMotion,
}: EquipmentCardProps) => (
  <motion.article
    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{
      duration: reducedMotion ? 0 : 0.35,
      delay: reducedMotion ? 0 : Math.min(index, 5) * 0.04,
      ease: [0.22, 1, 0.36, 1],
    }}
    className="flex min-w-0 flex-col rounded-2xl border border-[#EDE1D6] bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-[#111310]"
  >
    <div className="flex min-w-0 gap-3">
      <motion.div
        whileHover={reducedMotion ? undefined : { scale: 1.05 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-[#EDE1D6] bg-[#F3E9DE] dark:border-stone-800 dark:bg-stone-800"
      >
        <Image
          src={equipment.image || FALLBACK_IMAGE}
          alt={equipment.name}
          fill
          unoptimized
          sizes="64px"
          className="object-cover"
          onError={(event) => {
            if (!event.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
              event.currentTarget.src = FALLBACK_IMAGE;
            }
          }}
        />
      </motion.div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <motion.span
            initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${equipmentStatusStyles[equipment.status]}`}
          >
            {equipmentStatusLabel[equipment.status]}
          </motion.span>
          {equipment.isOnRent ? (
            <motion.span
              initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: reducedMotion ? 0 : 0.3, delay: reducedMotion ? 0 : 0.05 }}
              className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300"
            >
              On rent
            </motion.span>
          ) : null}
        </div>

        <h3
          className="mt-1.5 text-sm font-bold break-words text-[#2E2119] dark:text-stone-100"
          title={equipment.name}
        >
          {equipment.name}
        </h3>
        <p className="mt-0.5 truncate text-[11px] text-[#8B7B6B] dark:text-stone-400">
          {equipment.category || "Equipment"} · {equipment.availableStock}{" "}
          {equipment.availableStock === 1 ? "unit" : "units"} available
        </p>
      </div>
    </div>

    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#F1E9E0] pt-3 text-[11px] font-semibold text-[#6F5D4D] dark:border-stone-800 dark:text-stone-300">
      <span className="inline-flex items-center gap-1.5">
        <CircleDollarSign aria-hidden="true" className="size-3.5 text-[#C2561B] dark:text-orange-400" />
        {formatCurrency(equipment.rentalRate)}
        {equipment.rentalPeriod ? ` / ${capitalize(equipment.rentalPeriod)}` : ""}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Boxes aria-hidden="true" className="size-3.5 text-[#C2561B] dark:text-orange-400" />
        {formatCount(equipment.requestCount)}{" "}
        {equipment.requestCount === 1 ? "request" : "requests"}
      </span>
    </div>

    <p className="mt-2 text-[11px] text-[#9A8A79] dark:text-stone-500">
      {equipment.requestCount === 0
        ? "No rental requests yet"
        : `${formatCount(equipment.pendingRequests)} pending · ${formatCount(equipment.confirmedRequests)} confirmed · ${formatCount(equipment.completedRequests)} completed · ${formatCount(equipment.cancelledRequests)} cancelled`}
    </p>

    <Link
      href={`/dashboard/owner/equipment/edit/${equipment.id}`}
      className="mt-3 inline-flex items-center gap-1.5 self-start text-[11px] font-bold text-[#C2561B] transition hover:text-[#9A3412] dark:text-orange-400 dark:hover:text-orange-300"
    >
      <Pencil aria-hidden="true" className="size-3" />
      Manage listing
    </Link>
  </motion.article>
);

const EquipmentCardSkeleton = () => (
  <div className="rounded-2xl border border-[#EDE1D6] bg-white p-4 dark:border-stone-800 dark:bg-[#111310]">
    <div className="flex gap-3">
      <Skeleton className="size-16 shrink-0 rounded-xl bg-[#F3E9DE] dark:bg-stone-800" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-24 bg-[#F3E9DE] dark:bg-stone-800" />
        <Skeleton className="h-4 w-3/4 bg-[#F3E9DE] dark:bg-stone-800" />
        <Skeleton className="h-3 w-1/2 bg-[#F3E9DE] dark:bg-stone-800" />
      </div>
    </div>
    <Skeleton className="mt-4 h-3 w-2/3 bg-[#F3E9DE] dark:bg-stone-800" />
    <Skeleton className="mt-3 h-3 w-24 bg-[#F3E9DE] dark:bg-stone-800" />
  </div>
);

const BookingSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-[#EDE1D6] bg-white p-4 dark:border-stone-800 dark:bg-[#111310] sm:p-5">
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex min-w-0 flex-1 gap-4">
        <Skeleton className="size-20 shrink-0 rounded-xl bg-[#F3E9DE] dark:bg-stone-800 sm:size-28" />
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-4 w-28 bg-[#F3E9DE] dark:bg-stone-800" />
          <Skeleton className="h-6 w-3/5 bg-[#F3E9DE] dark:bg-stone-800" />
          <Skeleton className="h-3 w-1/2 bg-[#F3E9DE] dark:bg-stone-800" />
          <div className="grid gap-2.5 pt-2 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton
                key={index}
                className="h-14 rounded-xl bg-[#F3E9DE] dark:bg-stone-800"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="w-full shrink-0 space-y-3 border-t border-[#F1E9E0] pt-4 lg:w-60 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5 dark:border-stone-800">
        <Skeleton className="h-4 w-24 bg-[#F3E9DE] dark:bg-stone-800" />
        <Skeleton className="h-8 w-32 bg-[#F3E9DE] dark:bg-stone-800" />
        <Skeleton className="h-10 w-full rounded-lg bg-[#F3E9DE] dark:bg-stone-800" />
      </div>
    </div>
  </div>
);

const PageSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-6 w-44 bg-[#F3E9DE] dark:bg-stone-800" />
    <div className="flex flex-col gap-5 rounded-2xl border border-[#EDE1D6] bg-white p-5 dark:border-stone-800 dark:bg-[#111310] sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-80 max-w-full bg-[#F3E9DE] dark:bg-stone-800" />
        <Skeleton className="h-4 w-96 max-w-full bg-[#F3E9DE] dark:bg-stone-800" />
      </div>
      <Skeleton className="h-10 w-80 max-w-full rounded-full bg-[#F3E9DE] dark:bg-stone-800" />
    </div>
    <Skeleton className="h-12 w-full rounded-xl bg-[#F3E9DE] dark:bg-stone-800" />
    <div className="space-y-5">
      <BookingSkeleton />
      <BookingSkeleton />
    </div>
  </div>
);

type RentalCardProps = {
  booking: RentalBooking;
  index: number;
  reducedMotion: boolean;
  updating: boolean;
  disabled: boolean;
  highlighted: boolean;
  onDecision: (
    booking: RentalBooking,
    nextStatus: OwnerRentalStatus,
  ) => void;
};

const RentalCard = ({
  booking,
  index,
  reducedMotion,
  updating,
  disabled,
  highlighted,
  onDecision,
}: RentalCardProps) => {
  const canApprove =
    booking.status === "pending" &&
    booking.allowedStatuses.includes("confirmed");
  const canReject =
    booking.status === "pending" &&
    booking.allowedStatuses.includes("cancelled");
  const canCancel =
    booking.status === "confirmed" &&
    booking.allowedStatuses.includes("cancelled");
  const duration =
    booking.days > 0
      ? `${booking.days} ${booking.days === 1 ? "day" : "days"}`
      : "—";
  const rentalPeriod =
    booking.startDate || booking.endDate
      ? `${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}`
      : undefined;

  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: reducedMotion ? 0 : 0.4,
        delay: reducedMotion ? 0 : Math.min(index, 5) * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group overflow-hidden rounded-2xl border bg-white shadow-[0_8px_28px_-22px_rgba(67,42,20,0.55)] transition-all duration-300 dark:bg-[#111310] ${
        highlighted
          ? "border-[#F97316] ring-3 ring-[#F97316]/20"
          : "border-[#EDE1D6] dark:border-stone-800"
      }`}
    >
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:gap-5">
        <div className="flex min-w-0 flex-1 gap-4">
          <motion.div
            whileHover={reducedMotion ? undefined : { scale: 1.04 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-[#EDE1D6] bg-[#F3E9DE] dark:border-stone-800 dark:bg-stone-800 sm:size-28"
          >
            <Image
              src={booking.equipment.image || FALLBACK_IMAGE}
              alt={booking.equipment.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 80px, 112px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(event) => {
                if (!event.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
                  event.currentTarget.src = FALLBACK_IMAGE;
                }
              }}
            />
          </motion.div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <motion.span
                initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: reducedMotion ? 0 : 0.3 }}
                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${bookingStatusStyles[booking.status]}`}
              >
                {capitalize(booking.status)}
              </motion.span>
              <motion.span
                initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: reducedMotion ? 0 : 0.3, delay: reducedMotion ? 0 : 0.05 }}
                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${paymentStatusStyles[booking.payment.status]}`}
              >
                {capitalize(booking.payment.status)} payment
              </motion.span>
            </div>

            <p className="mt-2 text-[10px] font-bold tracking-[0.16em] text-[#C2561B] uppercase dark:text-orange-400">
              {booking.equipment.category || "Equipment rental"}
            </p>
            <h2 className="mt-1 text-base font-bold break-words text-[#2E2119] dark:text-stone-100 sm:text-lg">
              {booking.equipment.name}
            </h2>
            <span className="mt-2 inline-flex max-w-full items-center rounded-md border border-[#EDE1D6] bg-[#FCFAF7] px-2 py-1 font-mono text-[10px] text-[#8B7B6B] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
              <span className="truncate">Booking {booking.id}</span>
            </span>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              <Detail
                icon={<UserRound aria-hidden="true" />}
                label="Renter"
                value={booking.renter.name}
              />
              <Detail
                icon={<UserRound aria-hidden="true" />}
                label="Renter email"
                value={booking.renter.email}
              />
              <Detail
                icon={<CalendarDays aria-hidden="true" />}
                label="Rental period"
                value={rentalPeriod}
              />
              <Detail
                icon={<Clock3 aria-hidden="true" />}
                label="Duration"
                value={duration}
              />
              <Detail
                icon={<Boxes aria-hidden="true" />}
                label="Quantity"
                value={`${booking.quantity} ${booking.quantity === 1 ? "unit" : "units"}`}
              />
              {booking.renter.phone ? (
                <Detail
                  icon={<Phone aria-hidden="true" />}
                  label="Renter phone"
                  value={booking.renter.phone}
                />
              ) : null}
              {booking.deliveryAddress ? (
                <Detail
                  icon={<MapPin aria-hidden="true" />}
                  label="Delivery address"
                  value={booking.deliveryAddress}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="w-full shrink-0 border-t border-[#F1E9E0] pt-4 lg:w-60 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5 dark:border-stone-800">
          <p className="text-[10px] font-bold tracking-[0.16em] text-[#9A8A79] uppercase dark:text-stone-500">
            Rental value
          </p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#C2561B] dark:text-orange-400">
            {formatCurrency(booking.payment.amount, booking.payment.currency)}
          </p>
          <p
            className={`mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold ${paymentStatusStyles[booking.payment.status]}`}
          >
            <CreditCard aria-hidden="true" className="size-3.5" />
            {capitalize(booking.payment.status)} payment
          </p>

          <div className="mt-4 border-t border-[#F1E9E0] pt-4 dark:border-stone-800">
            <p
              className={`inline-flex items-center gap-2 text-sm font-bold ${actionStatusStyles[booking.status]}`}
            >
              <ActionIcon status={booking.status} />
              {actionLabel(booking.status)}
            </p>
            <p className="mt-1 text-[11px] text-[#9A8A79] dark:text-stone-500">
              Requested {formatDate(booking.createdAt)}
            </p>

            <div className="mt-3 space-y-2">
              {canApprove ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={updating || disabled}
                  onClick={() => onDecision(booking, "confirmed")}
                  className="w-full rounded-lg bg-[#D9601B] font-bold text-white hover:bg-[#C2561B] disabled:opacity-60"
                >
                  {updating ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 aria-hidden="true" />
                  )}
                  Approve Request
                </Button>
              ) : null}

              {canReject ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={updating || disabled}
                  onClick={() => onDecision(booking, "cancelled")}
                  className="w-full rounded-lg border-red-200 bg-white font-bold text-red-700 hover:border-red-300 hover:bg-red-50 disabled:opacity-60 dark:border-red-900/60 dark:bg-stone-900 dark:text-red-300 dark:hover:bg-red-950/30"
                >
                  <XCircle aria-hidden="true" />
                  Reject Request
                </Button>
              ) : null}

              {canCancel ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={updating || disabled}
                  onClick={() => onDecision(booking, "cancelled")}
                  className="w-full rounded-lg border-[#E6D8C8] bg-white font-bold text-[#6F5D4D] hover:border-[#D9601B] hover:text-[#C2561B] disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                >
                  <XCircle aria-hidden="true" />
                  Cancel Rental
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

type DialogState = {
  booking: RentalBooking;
  nextStatus: OwnerRentalStatus;
};

const MyRentalsPage = () => {
  const { data: session, isPending: isSessionPending } = useSession();
  const reducedMotion = Boolean(useReducedMotion());
  const isOwner = session?.user?.role === "owner";

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [status, setStatus] = useState<OwnerRentalStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [data, setData] = useState<OwnerRentalsData | null>(null);
  const [stats, setStats] = useState<RentalStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const reload = useCallback(() => setReloadKey((value) => value + 1), []);

  useEffect(() => {
    if (isSessionPending || !isOwner) return;

    const controller = new AbortController();
    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      void (async () => {
        try {
          const result = await fetchOwnerRentalStats(controller.signal);
          if (!controller.signal.aborted) setStats(result);
        } catch {
          // The list endpoint also returns stats; a failed stats-only refresh
          // should not blank the page.
        }
      })();
    });

    return () => controller.abort();
  }, [isOwner, isSessionPending, reloadKey]);

  useEffect(() => {
    if (isSessionPending || !isOwner) return;

    const controller = new AbortController();
    const isFirstPage = page === 1;

    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      if (isFirstPage) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      void (async () => {
        try {
          const result = await fetchOwnerRentals(
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

          // A status filter can have fewer pages than the previous filter.
          // Keep the requested page where possible, then clamp when needed.
          if (page > result.totalPages) {
            setData({ ...result, currentPage: result.totalPages });
            setStats(result.stats);
            setPage(result.totalPages);
            return;
          }

          setData(result);
          setStats(result.stats);
          setBookings((current) => {
            const merged = isFirstPage
              ? result.bookings
              : [...current, ...result.bookings];
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
            getErrorMessage(caught, "Could not load your rental requests."),
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
  }, [debouncedQuery, isOwner, isSessionPending, page, reloadKey, status]);

  useEffect(() => {
    if (!highlightedId) return;
    const timer = setTimeout(() => setHighlightedId(null), 1400);
    return () => clearTimeout(timer);
  }, [highlightedId]);

  const clearFilters = useCallback(() => {
    setQuery("");
    setStatus("all");
    setPage(1);
  }, []);

  const performDecision = useCallback(
    async (booking: RentalBooking, nextStatus: OwnerRentalStatus) => {
      if (updatingId) return;

      setUpdatingId(booking.id);
      try {
        const updated = await updateOwnerRentalStatus(booking.id, nextStatus);
        const title =
          nextStatus === "confirmed"
            ? "Rental request approved"
            : booking.status === "pending"
              ? "Rental request rejected"
              : "Rental cancelled";

        toast.add({
          type: "success",
          title,
          description: `${updated.equipment.name} is now ${updated.status}.`,
          timeout: 5000,
        });

        setHighlightedId(updated.id);
        reload();
      } catch (caught) {
        toast.add({
          type: "error",
          title: "Could not update rental request",
          description: getErrorMessage(caught, "Please try again."),
          timeout: 6000,
        });
      } finally {
        setUpdatingId(null);
      }
    },
    [reload, updatingId],
  );

  const requestDecision = useCallback(
    (booking: RentalBooking, nextStatus: OwnerRentalStatus) => {
      if (nextStatus === "confirmed") {
        void performDecision(booking, nextStatus);
        return;
      }
      setDialog({ booking, nextStatus });
    },
    [performDecision],
  );

  const confirmDialog = useCallback(() => {
    if (!dialog) return;
    const target = dialog;
    setDialog(null);
    void performDecision(target.booking, target.nextStatus);
  }, [dialog, performDecision]);

  const counts = stats?.statusCounts ?? data?.stats.statusCounts ?? emptyCounts;
  const ownerEquipment = data?.equipment ?? [];
  const totalCount = stats?.totalBookings ?? data?.stats.totalBookings ?? 0;
  const matchedCount = data?.total ?? 0;
  const hasActiveFilters = status !== "all" || debouncedQuery.trim() !== "";
  const isInitialLoading = isSessionPending || (isOwner && isLoading);

  const headerSubtitle = useMemo(() => {
    if (isInitialLoading) return "Loading your rental requests…";
    if (hasActiveFilters) {
      return `Showing ${formatCount(matchedCount)} of ${formatCount(totalCount)} requests for the selected filters.`;
    }
    return "Review rental dates, approve customer requests, or mark fulfilled orders.";
  }, [hasActiveFilters, isInitialLoading, matchedCount, totalCount]);

  if (!isSessionPending && !isOwner) {
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
            Only registered equipment owners can review rental requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6 rounded-2xl bg-[#FAF7F2] p-4 dark:bg-[#0B0D0B] sm:p-6 lg:p-7">
      <Link
        href="/dashboard/owner"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B7B6B] transition-colors hover:text-[#C2561B] dark:text-stone-400 dark:hover:text-orange-400"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Owner Overview
      </Link>

      {isSessionPending ? (
        <PageSkeleton />
      ) : (
        <>
          <motion.section
            initial={reducedMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.45 }}
            className="flex flex-col gap-5 rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-[#111310] sm:p-6 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#C2561B] uppercase dark:text-orange-400">
                My rentals
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#2E2119] dark:text-stone-100 sm:text-3xl">
                Rental Requests Received (
                {isLoading && !data ? "…" : formatCount(totalCount)})
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8B7B6B] dark:text-stone-400">
                {headerSubtitle}
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Filter rental requests by status"
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:px-0"
            >
              {filters.map((filter) => {
                const isActive = status === filter.key;

                return (
                  <motion.button
                    key={filter.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                    onClick={() => setStatus(filter.key)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
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
                  </motion.button>
                );
              })}
            </div>
          </motion.section>

          <div className="rounded-2xl border border-[#EDE1D6] bg-white p-3 shadow-sm dark:border-stone-800 dark:bg-[#111310] sm:p-4">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#9A8A79] dark:text-stone-500"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                aria-label="Search rental requests"
                placeholder="Search by equipment, renter name, email, or booking ID..."
                className="h-11 w-full rounded-xl border border-[#E6D8C8] bg-[#FCFAF7] pr-11 pl-10 text-sm text-[#3B2F27] outline-none transition placeholder:text-[#A99887] focus:border-[#D9601B] focus:ring-3 focus:ring-[#F97316]/15 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-orange-500"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[#8B7B6B] transition hover:bg-[#F3E9DE] hover:text-[#C2561B] dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-orange-400"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>

          <motion.section
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.4 }}
            className="space-y-4"
            aria-label="Your equipment"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold text-[#2E2119] dark:text-stone-100">
                  Your equipment ({isInitialLoading ? "…" : formatCount(ownerEquipment.length)})
                </h2>
                <p className="mt-1 text-xs text-[#8B7B6B] dark:text-stone-400">
                  Published listings and their rental request totals. Listings
                  with no bookings are shown here too.
                </p>
              </div>
            </div>

            {isInitialLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <EquipmentCardSkeleton />
                <EquipmentCardSkeleton />
                <EquipmentCardSkeleton />
              </div>
            ) : ownerEquipment.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {ownerEquipment.map((equipment, index) => (
                  <EquipmentCard
                    key={equipment.id}
                    equipment={equipment}
                    index={index}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-[#E6D8C8] bg-white px-4 py-5 dark:border-stone-700 dark:bg-[#111310]">
                <p className="text-sm text-[#8B7B6B] dark:text-stone-400">
                  You have not published any equipment yet.
                </p>
                <Link
                  href="/dashboard/owner/add-equipment"
                  className={buttonVariants({
                    className:
                      "rounded-lg bg-[#D9601B] font-bold text-white hover:bg-[#C2561B]",
                  })}
                >
                  Add equipment
                </Link>
              </div>
            )}
          </motion.section>

          {error && bookings.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/60 dark:bg-red-950/20">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={reload}
                className="rounded-lg border-red-200 bg-white text-red-700 dark:border-red-800 dark:bg-stone-900 dark:text-red-300"
              >
                <RefreshCw aria-hidden="true" />
                Retry
              </Button>
            </div>
          ) : null}

          {isInitialLoading ? (
            <div className="space-y-5" aria-label="Loading rental requests">
              <BookingSkeleton />
              <BookingSkeleton />
            </div>
          ) : error && bookings.length === 0 ? (
            <div className="rounded-2xl border border-red-200 bg-white px-6 py-14 text-center dark:border-red-900/60 dark:bg-[#111310]">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                <AlertCircle className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-4 font-bold text-red-800 dark:text-red-200">
                Could not load rental requests
              </p>
              <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/70">
                {error}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={reload}
                className="mt-5 rounded-lg border-[#E6D8C8] bg-white text-[#6F5D4D] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
              >
                <RefreshCw aria-hidden="true" />
                Retry
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E6D8C8] bg-white px-6 py-16 text-center dark:border-stone-700 dark:bg-[#111310]">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#F6E7D8] text-[#C2561B] dark:bg-orange-950/40 dark:text-orange-300">
                <Package className="size-7" aria-hidden="true" />
              </span>
              <p className="mt-5 text-base font-bold text-[#2E2119] dark:text-stone-100">
                No Rental Requests Found
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8B7B6B] dark:text-stone-400">
                {hasActiveFilters
                  ? "No rental requests match the current status filter or search."
                  : "Rental requests for your equipment will appear here once customers book."}
              </p>
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-5 rounded-lg border-[#E6D8C8] bg-white text-[#6F5D4D] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
                >
                  <RefreshCw aria-hidden="true" />
                  Clear filters
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {bookings.map((booking, index) => (
                  <RentalCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                    reducedMotion={reducedMotion}
                    updating={updatingId === booking.id}
                    disabled={updatingId !== null}
                    highlighted={highlightedId === booking.id}
                    onDecision={requestDecision}
                  />
                ))}
              </div>

              {isLoadingMore ? (
                <div className="pt-2">
                  <BookingSkeleton />
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EDE1D6] bg-white px-4 py-3 text-sm dark:border-stone-800 dark:bg-[#111310]">
                <p className="text-[#8B7B6B] dark:text-stone-400">
                  Page {data?.currentPage ?? 1} of {data?.totalPages ?? 1} ·{" "}
                  {formatCount(matchedCount)} matching requests
                </p>
                {data?.hasMore ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoadingMore}
                    onClick={() => setPage((value) => value + 1)}
                    className="rounded-lg border-[#E6D8C8] bg-white font-bold text-[#6F5D4D] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
                  >
                    {isLoadingMore ? (
                      <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : null}
                    Load more
                  </Button>
                ) : null}
              </div>
            </>
          )}

          <p className="text-[11px] leading-5 text-[#9A8A79] dark:text-stone-500">
            Amounts shown are gross rental values recorded at checkout. GearNest
            does not store owner payouts or commission, so this is not money
            already received by the owner.
          </p>
        </>
      )}

      <Dialog
        open={Boolean(dialog)}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <DialogContent className="border-[#EDE1D6] bg-white dark:border-stone-700 dark:bg-[#111310]">
          <DialogHeader>
            <DialogTitle className="text-[#2E2119] dark:text-stone-100">
              {dialog?.booking.status === "pending"
                ? "Reject this rental request?"
                : "Cancel this confirmed rental?"}
            </DialogTitle>
            <DialogDescription>
              {dialog?.booking.status === "pending"
                ? "The renter's request will be marked cancelled. This action cannot be undone from the owner dashboard."
                : "The booking will be marked cancelled. GearNest does not record an automatic refund, so review payment details before continuing."}
            </DialogDescription>
          </DialogHeader>
          {dialog ? (
            <div className="rounded-xl border border-[#F1E9E0] bg-[#FCFAF7] px-3 py-2.5 text-sm text-[#4A3A2E] dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-200">
              <p className="font-bold">{dialog.booking.equipment.name}</p>
              <p className="mt-1 text-xs text-[#8B7B6B] dark:text-stone-400">
                {dialog.booking.renter.name} · {formatDate(dialog.booking.startDate)} –{" "}
                {formatDate(dialog.booking.endDate)}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialog(null)}
              className="rounded-lg border-[#E6D8C8] bg-white text-[#6F5D4D] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
            >
              Keep booking
            </Button>
            <Button
              type="button"
              disabled={updatingId !== null}
              onClick={confirmDialog}
              className="rounded-lg bg-[#C2410C] font-bold text-white hover:bg-[#9A3412]"
            >
              {updatingId ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : null}
              {dialog?.booking.status === "pending"
                ? "Reject request"
                : "Cancel rental"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyRentalsPage;
