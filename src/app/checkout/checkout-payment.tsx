"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CreditCard,
  CalendarDays,
  Loader2,
  LockKeyhole,
  Package,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useSession } from "@/lib/auth-client";
import type { Equipment } from "@/lib/equipment";
import { formatRentalRate } from "@/lib/equipment-filters";
import type { RentalQuote } from "@/lib/rental-pricing";

type CheckoutPaymentProps = {
  equipment: Equipment;
  startDate: string;
  endDate: string;
  quote: RentalQuote;
};

const FALLBACK_IMAGE = "/equipment-fallback.svg";

const formatMoney = (amount: number) => `৳${formatRentalRate(amount)}`;

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

const fieldClass =
  "h-11 rounded-lg border-[#e6e9ee] bg-white px-3 text-sm text-[#0a2540] shadow-none placeholder:text-[#a3acb9] focus-visible:border-[#635bff] focus-visible:ring-[#635bff]/20";

const SummaryRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="text-[#425466]">{label}</span>
    <span className="text-right font-semibold text-[#0a2540]">{value}</span>
  </div>
);

const CheckoutPayment = ({
  equipment,
  startDate,
  endDate,
  quote,
}: CheckoutPaymentProps) => {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();

  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [name, setName] = useState(session?.user?.name ?? "");
  const [imageSrc, setImageSrc] = useState(equipment.image || FALLBACK_IMAGE);
  const [submitting, setSubmitting] = useState(false);

  const total = formatMoney(quote.rentalCost);

  const handlePay = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.add({
        type: "error",
        title: "Check your email",
        description: "Enter a valid email address for your receipt.",
        timeout: 5000,
      });
      return;
    }

    if (!session?.user) {
      toast.add({
        type: "info",
        title: "Sign in to pay",
        description: "Sign in to continue to secure checkout.",
        timeout: 5000,
      });
      router.push(`/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: equipment._id,
          startDate,
          endDate,
          quantity: quote.quantity,
          email: email.trim(),
          name: name.trim(),
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        url?: string;
        message?: string;
      } | null;

      if (!response.ok || !data?.url) {
        throw new Error(data?.message ?? "Could not start Stripe checkout.");
      }

      window.location.assign(data.url);
    } catch (error) {
      toast.add({
        type: "error",
        title: "Checkout failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        timeout: 7000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[70vh] bg-[#f6f9fc] pb-14">
      <header className="border-b border-[#e6e9ee] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#635bff] text-white">
              <Package className="size-4" aria-hidden="true" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-[#0a2540]">
              Gear<span className="text-[#635bff]">Nest</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#425466]">
            <LockKeyhole className="size-3.5 text-[#0a2540]" aria-hidden="true" />
            Secure checkout
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8 lg:py-12">
        {/* Payment form */}
        <section className="overflow-hidden rounded-2xl border border-[#e6e9ee] bg-white shadow-[0_18px_50px_-35px_rgba(10,37,64,0.5)]">
          <div className="border-b border-[#e6e9ee] px-6 py-5 sm:px-8">
            <h1 className="text-xl font-bold tracking-tight text-[#0a2540]">
              Payment information
            </h1>
            <p className="mt-1 text-sm text-[#425466]">
              All transactions are secure and encrypted.
            </p>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8">
            <div className="overflow-hidden rounded-xl border border-[#e6e9ee]">
              <div className="flex items-center gap-3 border-b border-[#e6e9ee] bg-[#f8fafc] px-4 py-3">
                <CreditCard className="size-4 text-[#635bff]" aria-hidden="true" />
                <span className="text-sm font-semibold text-[#0a2540]">
                  Card
                </span>
                <span className="ml-auto text-[11px] font-medium text-[#8792a2]">
                  Visa · Mastercard · Amex
                </span>
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <Label htmlFor="checkout-email" className="mb-1.5 text-xs font-semibold text-[#0a2540]">
                    Email for receipt
                  </Label>
                  <Input
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <Label htmlFor="checkout-name" className="mb-1.5 text-xs font-semibold text-[#0a2540]">
                    Name on card
                  </Label>
                  <Input
                    id="checkout-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Full name"
                    autoComplete="name"
                    className={fieldClass}
                  />
                </div>

                <div className="rounded-lg border border-dashed border-[#d9e2ec] bg-[#f8fafc] p-3.5">
                  <p className="mb-3 text-xs leading-5 text-[#425466]">
                    Card details are entered on Stripe&apos;s secure checkout
                    page. Do not enter them here.
                  </p>

                  <div className="space-y-2.5" aria-hidden="true">
                    <div className="flex h-10 items-center rounded-md border border-[#e6e9ee] bg-white px-3 text-sm tracking-widest text-[#a3acb9]">
                      •••• •••• •••• ••••
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="flex h-10 items-center rounded-md border border-[#e6e9ee] bg-white px-3 text-sm text-[#a3acb9]">
                        MM / YY
                      </div>
                      <div className="flex h-10 items-center rounded-md border border-[#e6e9ee] bg-white px-3 text-sm text-[#a3acb9]">
                        CVC
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => void handlePay()}
              disabled={submitting || isSessionPending}
              className="h-12 w-full rounded-lg bg-[#635bff] text-sm font-bold text-white transition hover:bg-[#5148e8] disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LockKeyhole className="size-4" aria-hidden="true" />
              )}
              {submitting ? "Redirecting to Stripe…" : `Pay ${total}`}
              {!submitting ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
            </Button>

            <p className="text-center text-[11px] leading-5 text-[#8792a2]">
              You&apos;ll be redirected to Stripe to complete your payment.
            </p>
          </div>
        </section>

        {/* Order summary */}
        <aside className="rounded-2xl border border-[#e6e9ee] bg-white p-6 shadow-[0_18px_50px_-35px_rgba(10,37,64,0.5)]">
          <h2 className="text-base font-bold text-[#0a2540]">Order summary</h2>

          <div className="mt-5 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={equipment.name}
              onError={() => setImageSrc(FALLBACK_IMAGE)}
              className="size-16 shrink-0 rounded-lg border border-[#e6e9ee] object-cover"
            />
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-bold text-[#0a2540]">
                {equipment.name}
              </p>
              <p className="mt-1 text-xs text-[#425466]">{equipment.category}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3 border-t border-[#e6e9ee] pt-5">
            <SummaryRow
              label="Rental period"
              value={`${formatDate(startDate)} – ${formatDate(endDate)}`}
            />
            <SummaryRow
              label="Duration"
              value={`${quote.days} ${quote.days === 1 ? "day" : "days"}`}
            />
            <SummaryRow
              label="Billing"
              value={`${quote.billingUnits} × ${quote.period}`}
            />
            <SummaryRow label="Quantity" value={String(quote.quantity)} />
            <SummaryRow
              label="Rate"
              value={`${formatMoney(quote.rate)} / ${quote.periodUnit}`}
            />
            <SummaryRow label="Service fee" value={formatMoney(0)} />
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#e6e9ee] pt-5">
            <div>
              <p className="text-sm font-bold text-[#0a2540]">Total</p>
              <p className="text-[11px] text-[#8792a2]">Due today</p>
            </div>
            <p className="text-2xl font-extrabold tracking-tight text-[#0a2540]">
              {total}
            </p>
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-lg bg-[#f0fdf4] px-3 py-2.5 text-xs leading-5 text-[#166534]">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              Your payment is processed by Stripe. GearNest never stores your
              card details.
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2 text-[11px] text-[#8792a2]">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            Free cancellation before your rental start date.
          </div>
        </aside>
      </div>
    </main>
  );
};

export default CheckoutPayment;
