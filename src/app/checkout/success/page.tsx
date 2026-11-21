import Link from "next/link";
import { headers } from "next/headers";
import { CheckCircle2, Package, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getSessionUserIdFromHeaders,
  isValidEquipmentId,
  recordCompletedPurchase,
} from "@/lib/purchases";

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

type Outcome = {
  success: boolean;
  title: string;
  description: string;
};

const parseOptionalNumber = (value: string | undefined) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const OutcomeCard = ({
  success,
  title,
  description,
}: {
  success: boolean;
  title: string;
  description: string;
}) => (
  <main className="flex min-h-[70vh] items-center justify-center bg-[#f6f9fc] px-4 py-12">
    <div className="w-full max-w-md rounded-2xl border border-[#e6e9ee] bg-white px-6 py-12 text-center shadow-[0_18px_50px_-35px_rgba(10,37,64,0.5)]">
      <span
        className={`mx-auto flex size-14 items-center justify-center rounded-full ${
          success ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        }`}
      >
        {success ? (
          <CheckCircle2 className="size-7" aria-hidden="true" />
        ) : (
          <XCircle className="size-7" aria-hidden="true" />
        )}
      </span>

      <div className="mt-5 flex items-center justify-center gap-2 text-lg font-extrabold tracking-tight text-[#0a2540]">
        <Package className="size-5 text-[#635bff]" aria-hidden="true" />
        Gear<span className="text-[#635bff]">Nest</span>
      </div>

      <h1 className="mt-4 text-xl font-bold text-[#0a2540]">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-[#425466]">{description}</p>

      <Button
        render={<Link href="/equipment" />}
        nativeButton={false}
        className="mt-6 bg-[#635bff] text-white hover:bg-[#5148e8]"
      >
        Browse more equipment
      </Button>
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

    if (
      currentUserId &&
      purchasedUserId === currentUserId &&
      equipmentId &&
      isValidEquipmentId(equipmentId)
    ) {
      try {
        await recordCompletedPurchase({
          userId: currentUserId,
          equipmentId,
          stripeSessionId: session.id || sessionId,
          amountTotal:
            typeof session.amount_total === "number"
              ? session.amount_total
              : undefined,
          currency: session.currency ?? undefined,
          startDate: metadata.startDate || undefined,
          endDate: metadata.endDate || undefined,
          quantity: parseOptionalNumber(metadata.quantity),
        });
      } catch (error) {
        // Payment succeeded; a failed bookkeeping write must not hide that.
        console.error("Could not record completed purchase", error);
      }
    }

    return {
      success: true,
      title: "Payment complete",
      description: `Thank you! Your payment was confirmed by Stripe${
        session.customer_email ? ` for ${session.customer_email}` : ""
      }. A receipt should arrive in your inbox shortly.`,
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
