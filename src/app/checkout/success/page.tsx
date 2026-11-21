import Link from "next/link";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Hash,
  Package,
  ShieldCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchEquipmentById } from "@/lib/equipment";
import {
  getSessionUserIdFromHeaders,
  isValidEquipmentId,
  recordCompletedPurchase,
} from "@/lib/purchases";
import { inclusiveDayCount } from "@/lib/rental-pricing";

// This page reads a Stripe session ID from the request and verifies it live.
export const instant = false;

type CheckoutSuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type StripeCheckoutSession = {
  id?: string;
  payment_status?: string;
  customer_email?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  metadata?: Record<string, string>;
};

type BookingDetails = {
  bookingId: string;
  equipmentName: string;
  startDate?: string;
  endDate?: string;
  days: number;
  quantity: number;
  paymentStatus: string;
  totalPaid?: string;
};

type Outcome = {
  success: boolean;
  title: string;
  description: string;
  booking?: BookingDetails;
};

const parseOptionalNumber = (value: string | undefined) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const currencySymbol = (currency?: string | null) => {
  switch ((currency || "bdt").toUpperCase()) {
    case "BDT":
      return "৳";
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    default:
      return `${(currency || "BDT").toUpperCase()} `;
  }
};

const formatAmount = (amountInCents: number, currency?: string | null) => {
  const amount = amountInCents / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currencySymbol(currency)}${formatted}`;
};

const DetailRow = ({
  icon: Icon,
  label,
  value,
  valueClassName = "",
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) => (
  <div className="flex flex-col gap-1 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon
        className="size-4 shrink-0 text-green-700 dark:text-lime-400"
        aria-hidden="true"
      />
      {label}
    </dt>
    <dd
      className={`text-right text-sm font-semibold text-foreground ${valueClassName}`}
    >
      {value}
    </dd>
  </div>
);

const OutcomeCard = ({ success, title, description, booking }: Outcome) => (
  <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-12">
    <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-lg shadow-green-900/5 sm:p-9">
      {success && booking ? (
        <>
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </span>

          <div className="mt-5 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-green-800 dark:border-green-800 dark:bg-green-900/40 dark:text-lime-200">
              Payment Confirmed
            </span>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-background p-5 sm:p-6">
            <h2 className="sr-only">Booking details</h2>

            <dl className="divide-y divide-border">
              <DetailRow
                icon={Hash}
                label="Booking ID"
                value={booking.bookingId}
                valueClassName="break-all font-mono text-xs sm:text-sm"
              />

              <DetailRow
                icon={Package}
                label="Equipment"
                value={booking.equipmentName}
              />

              <DetailRow
                icon={CalendarDays}
                label="Rental Duration"
                value={
                  booking.startDate && booking.endDate
                    ? `${booking.startDate} to ${booking.endDate} (${booking.days} ${
                        booking.days === 1 ? "day" : "days"
                      })`
                    : "See your Stripe receipt"
                }
              />

              <DetailRow
                icon={Package}
                label="Quantity Reserved"
                value={`${booking.quantity} ${
                  booking.quantity === 1 ? "unit" : "units"
                }`}
              />

              <DetailRow
                icon={CreditCard}
                label="Payment Status"
                value={
                  <span className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-green-800 dark:bg-green-900/40 dark:text-lime-200">
                    <span className="size-1.5 rounded-full bg-green-700 dark:bg-lime-400" />
                    {booking.paymentStatus}
                  </span>
                }
              />

              <DetailRow
                icon={CreditCard}
                label="Total Paid"
                value={booking.totalPaid ?? "See your Stripe receipt"}
                valueClassName="text-base font-extrabold text-green-700 dark:text-lime-400"
              />
            </dl>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
            <ShieldCheck
              size={18}
              className="mt-0.5 shrink-0 text-green-700 dark:text-lime-400"
              aria-hidden="true"
            />
            <p className="text-xs leading-6 text-green-800 dark:text-green-100">
              Guaranteed rental booking backed by GearNest customer protection.
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Button
              render={<Link href="/dashboard/customer/bookings" />}
              nativeButton={false}
              className="h-12 rounded-xl bg-[#166534] px-6 text-sm font-bold text-white hover:bg-[#14532D]"
            >
              Go to My Bookings
              <ArrowRight size={17} />
            </Button>

            <Button
              render={<Link href="/equipment" />}
              nativeButton={false}
              variant="outline"
              className="h-12 rounded-xl border-border bg-background px-6 text-sm font-bold text-foreground hover:border-green-700 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/40 dark:hover:text-lime-300"
            >
              Browse More Equipment
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <XCircle className="size-7" aria-hidden="true" />
          </span>

          <div className="mt-5 flex items-center justify-center gap-2 text-lg font-extrabold tracking-tight text-foreground">
            <Package
              className="size-5 text-green-700 dark:text-lime-400"
              aria-hidden="true"
            />
            Gear
            <span className="text-green-700 dark:text-lime-400">Nest</span>
          </div>

          <h1 className="mt-4 text-xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>

          <Button
            render={<Link href="/equipment" />}
            nativeButton={false}
            className="mt-6 h-12 rounded-xl bg-[#166534] px-6 text-sm font-bold text-white hover:bg-[#14532D]"
          >
            Browse More Equipment
            <ArrowRight size={17} />
          </Button>
        </div>
      )}
    </div>
  </main>
);

const verifyCheckoutSession = async (
  sessionId: string,
  secretKey: string,
  currentUserId: string | null,
): Promise<Outcome> => {
  try {
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
        cache: "no-store",
      },
    );

    const session = (await response.json().catch(() => null)) as
      | StripeCheckoutSession
      | null;

    if (!response.ok || !session) {
      return {
        success: false,
        title: "Could not verify payment",
        description:
          "We couldn't confirm this checkout session with Stripe. Please check your email for the receipt or contact support.",
      };
    }

    if (session.payment_status !== "paid") {
      return {
        success: false,
        title: "Payment not completed",
        description:
          "Stripe has not marked this payment as paid yet. You can return to the catalog and start another checkout.",
      };
    }

    const metadata = session.metadata ?? {};
    const purchasedUserId = metadata.userId;
    const equipmentId = metadata.equipmentId;
    const canRecordPurchase =
      Boolean(currentUserId) &&
      purchasedUserId === currentUserId &&
      Boolean(equipmentId) &&
      isValidEquipmentId(equipmentId);

    let bookingId: string | null = null;

    if (canRecordPurchase) {
      try {
        bookingId = await recordCompletedPurchase({
          userId: currentUserId as string,
          equipmentId: equipmentId as string,
          stripeSessionId: session.id || sessionId,
          amountTotal:
            typeof session.amount_total === "number"
              ? session.amount_total
              : undefined,
          currency: session.currency ?? undefined,
          startDate: metadata.startDate || undefined,
          endDate: metadata.endDate || undefined,
          quantity: parseOptionalNumber(metadata.quantity),
          deliveryAddress: metadata.deliveryAddress || undefined,
        });
      } catch (error) {
        // Payment succeeded; a failed bookkeeping write must not hide that.
        console.error("Could not record completed purchase", error);
      }
    }

    let equipmentName = "Equipment rental";
    if (equipmentId && isValidEquipmentId(equipmentId)) {
      try {
        const equipment = await fetchEquipmentById(equipmentId);
        if (equipment?.name) equipmentName = equipment.name;
      } catch (error) {
        console.error("Could not load equipment for the booking receipt", error);
      }
    }

    const startDate = metadata.startDate;
    const endDate = metadata.endDate;
    const parsedQuantity = parseOptionalNumber(metadata.quantity) ?? 1;
    const quantity =
      Number.isInteger(parsedQuantity) && parsedQuantity > 0
        ? parsedQuantity
        : 1;

    return {
      success: true,
      title: "Booking Reserved Successfully!",
      description:
        "Your payment has been processed and equipment reserved. The owner will prepare your order.",
      booking: {
        bookingId: bookingId ?? session.id ?? sessionId,
        equipmentName,
        startDate,
        endDate,
        days:
          startDate && endDate ? inclusiveDayCount(startDate, endDate) : 0,
        quantity,
        paymentStatus: "Paid via Stripe",
        totalPaid:
          typeof session.amount_total === "number"
            ? formatAmount(session.amount_total, session.currency)
            : undefined,
      },
    };
  } catch (error) {
    console.error("Could not verify Stripe checkout session", error);

    return {
      success: false,
      title: "Could not verify payment",
      description:
        "Something went wrong while confirming your payment. Please check your email for the Stripe receipt.",
    };
  }
};

const CheckoutSuccessPage = async ({
  searchParams,
}: CheckoutSuccessPageProps) => {
  const query = await searchParams;
  const rawSessionId = query.session_id;
  const sessionId = Array.isArray(rawSessionId)
    ? rawSessionId[0]
    : rawSessionId;

  const secretKey = process.env.STRIPE_SECRET_KEY;

  let outcome: Outcome;

  if (!sessionId) {
    outcome = {
      success: false,
      title: "No checkout session",
      description:
        "This page is reached after completing payment on Stripe. Browse our equipment to start a checkout.",
    };
  } else if (!secretKey) {
    outcome = {
      success: false,
      title: "Stripe is not configured",
      description: "Add STRIPE_SECRET_KEY to enable and verify payments.",
    };
  } else {
    const requestHeaders = await headers();
    const currentUserId = await getSessionUserIdFromHeaders(requestHeaders);
    outcome = await verifyCheckoutSession(sessionId, secretKey, currentUserId);
  }

  return <OutcomeCard {...outcome} />;
};

export default CheckoutSuccessPage;
