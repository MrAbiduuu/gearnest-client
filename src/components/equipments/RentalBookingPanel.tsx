"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Info,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useSession } from "@/lib/auth-client";
import { getAvailableStock, type Equipment } from "@/lib/equipment";
import { formatRentalRate } from "@/lib/equipment-filters";
import {
  addDays,
  getRentalQuote,
  periodLabel,
} from "@/lib/rental-pricing";

type RentalBookingPanelProps = {
  equipment: Equipment;
  defaultStartDate: string;
};

type FieldErrors = {
  dates?: string;
  quantity?: string;
  phone?: string;
  address?: string;
};

const currency = (amount: number) => `৳${formatRentalRate(amount)}`;

const SummaryRow = ({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span
      className={
        muted ? "text-muted-foreground" : "font-semibold text-foreground"
      }
    >
      {value}
    </span>
  </div>
);

const RentalBookingPanel = ({
  equipment,
  defaultStartDate,
}: RentalBookingPanelProps) => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const stock = getAvailableStock(equipment);
  const isAvailable = stock > 0;
  const maxQuantity = Math.max(1, stock);
  const rate = Number.isFinite(equipment.rentalRate) ? equipment.rentalRate : 0;
  const period = periodLabel(equipment.rentalPeriod);
  const periodUnit = period.toLowerCase();

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(() => addDays(defaultStartDate, 1));
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const quote = getRentalQuote({
    rentalRate: rate,
    rentalPeriod: equipment.rentalPeriod,
    startDate,
    endDate,
    quantity,
  });
  const days = quote?.days ?? 0;
  const billingUnits = quote?.billingUnits ?? 0;
  const rentalCost = quote?.rentalCost ?? 0;

  const updateQuantity = (next: number) => {
    setQuantity(Math.min(maxQuantity, Math.max(1, next)));
    setErrors((current) => ({ ...current, quantity: undefined }));
  };

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (!startDate || !endDate || endDate < startDate) {
      nextErrors.dates = "Select a valid start and end date.";
    }

    if (quantity < 1 || quantity > stock) {
      nextErrors.quantity = `Choose between 1 and ${stock} units.`;
    }

    if (!phone.trim()) {
      nextErrors.phone = "A contact phone number is required.";
    } else if (!/^[+\d][\d\s()-]{6,}$/.test(phone.trim())) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (!address.trim()) {
      nextErrors.address = "A delivery address is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAvailable || isPending) return;
    if (!validate()) return;

    if (!user) {
      router.push(
        `/signin?callbackUrl=${encodeURIComponent(`/equipment/${equipment._id}`)}`,
      );
      return;
    }

    const params = new URLSearchParams({
      equipmentId: equipment._id,
      startDate,
      endDate,
      quantity: String(quantity),
      deliveryAddress: address.trim(),
    });

    toast.add({
      type: "info",
      title: "Redirecting to secure checkout",
      description: `${currency(rentalCost)} for ${days} ${
        days === 1 ? "day" : "days"
      } and ${quantity} ${quantity === 1 ? "unit" : "units"}.`,
      timeout: 4000,
    });

    router.push(`/checkout?${params.toString()}`);
  };

  const fieldClass =
    "h-11 rounded-lg border-border bg-card px-3 text-sm shadow-sm";
  const labelClass = "mb-1.5 text-xs font-semibold text-foreground";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_60px_-42px_rgba(22,101,52,0.8)]">
      <div className="border-b border-border px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-green-700 dark:text-lime-400">
              Reserve now
            </p>
            <h2 className="mt-1.5 text-lg font-bold text-foreground">
              Rental booking
            </h2>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-lime-100 px-2.5 py-1 text-[11px] font-semibold text-green-800 dark:bg-green-900/40 dark:text-lime-200">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Instant checkout
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold tracking-tight text-green-700 dark:text-lime-300">
            {currency(rate)}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            / {periodUnit}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5 px-5 py-5">
          {!isAvailable ? (
            <div className="rounded-lg border border-border bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
              <p className="font-semibold text-foreground">
                Item out of stock
              </p>
              <p className="mt-1">
                This equipment cannot be booked right now.{" "}
                <Link
                  href="/equipment"
                  className="font-semibold text-green-700 hover:underline dark:text-lime-300"
                >
                  Browse similar equipment
                </Link>
              </p>
            </div>
          ) : null}

          {isPending ? (
            <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
              <span className="size-3.5 animate-pulse rounded-full bg-border" />
              Checking your session…
            </div>
          ) : user ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-xs leading-5 text-green-800 dark:border-green-800 dark:bg-green-900/25 dark:text-lime-200">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <p>
                Booking as {user.name || user.email}. You&apos;ll complete
                payment securely on Stripe.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
              <Info
                className="mt-0.5 size-4 shrink-0 text-green-700 dark:text-lime-300"
                aria-hidden="true"
              />
              <p>
                Sign in to continue with your rental request.{" "}
                <Link
                  href="/signin"
                  className="font-semibold text-green-700 hover:underline dark:text-lime-300"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}

          <div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rental-start-date" className={labelClass}>
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  Start date
                </Label>
                <Input
                  id="rental-start-date"
                  type="date"
                  value={startDate}
                  min={defaultStartDate}
                  disabled={!isAvailable}
                  aria-invalid={Boolean(errors.dates)}
                  aria-describedby={
                    errors.dates ? "rental-date-error" : undefined
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    setStartDate(value);
                    setErrors((current) => ({
                      ...current,
                      dates: undefined,
                    }));

                    if (value && endDate && endDate < value) {
                      setEndDate(value);
                    }
                  }}
                  className={fieldClass}
                />
              </div>

              <div>
                <Label htmlFor="rental-end-date" className={labelClass}>
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  End date
                </Label>
                <Input
                  id="rental-end-date"
                  type="date"
                  value={endDate}
                  min={startDate || defaultStartDate}
                  disabled={!isAvailable}
                  aria-invalid={Boolean(errors.dates)}
                  aria-describedby={
                    errors.dates ? "rental-date-error" : undefined
                  }
                  onChange={(event) => {
                    setEndDate(event.target.value);
                    setErrors((current) => ({
                      ...current,
                      dates: undefined,
                    }));
                  }}
                  className={fieldClass}
                />
              </div>
            </div>

            {errors.dates ? (
              <p
                id="rental-date-error"
                className="mt-1.5 text-xs text-destructive"
              >
                {errors.dates}
              </p>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="rental-quantity" className={labelClass}>
                Quantity
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Max {stock}
              </span>
            </div>

            <div className="flex h-11 items-center overflow-hidden rounded-lg border border-input bg-card shadow-sm">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={!isAvailable || quantity <= 1}
                onClick={() => updateQuantity(quantity - 1)}
                className="flex size-11 shrink-0 items-center justify-center text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>

              <Input
                id="rental-quantity"
                type="number"
                min={1}
                max={maxQuantity}
                value={quantity}
                disabled={!isAvailable}
                aria-invalid={Boolean(errors.quantity)}
                aria-describedby={
                  errors.quantity ? "quantity-error" : undefined
                }
                onChange={(event) => {
                  const next = Number.parseInt(event.target.value, 10);
                  updateQuantity(Number.isNaN(next) ? 1 : next);
                }}
                className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 text-center text-sm font-semibold shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />

              <button
                type="button"
                aria-label="Increase quantity"
                disabled={!isAvailable || quantity >= maxQuantity}
                onClick={() => updateQuantity(quantity + 1)}
                className="flex size-11 shrink-0 items-center justify-center text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>

            {errors.quantity ? (
              <p
                id="quantity-error"
                className="mt-1.5 text-xs text-destructive"
              >
                {errors.quantity}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="contact-phone" className={labelClass}>
              Contact phone
            </Label>
            <Input
              id="contact-phone"
              type="tel"
              name="phone"
              value={phone}
              disabled={!isAvailable}
              placeholder="+880 1XXX-XXXXXX"
              autoComplete="tel"
              required
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              onChange={(event) => {
                setPhone(event.target.value);
                setErrors((current) => ({ ...current, phone: undefined }));
              }}
              className={fieldClass}
            />
            {errors.phone ? (
              <p id="phone-error" className="mt-1.5 text-xs text-destructive">
                {errors.phone}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="delivery-address" className={labelClass}>
              Delivery address
            </Label>
            <Input
              id="delivery-address"
              type="text"
              name="address"
              value={address}
              disabled={!isAvailable}
              placeholder="Street, area, city"
              autoComplete="street-address"
              required
              aria-invalid={Boolean(errors.address)}
              aria-describedby={errors.address ? "address-error" : undefined}
              onChange={(event) => {
                setAddress(event.target.value);
                setErrors((current) => ({ ...current, address: undefined }));
              }}
              className={fieldClass}
            />
            {errors.address ? (
              <p id="address-error" className="mt-1.5 text-xs text-destructive">
                {errors.address}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="special-instructions" className={labelClass}>
              Special instructions{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="special-instructions"
              name="instructions"
              value={instructions}
              disabled={!isAvailable}
              placeholder="Delivery timing, operator needs, or anything else…"
              rows={3}
              onChange={(event) => setInstructions(event.target.value)}
              className="min-h-20 resize-none rounded-lg border-border bg-card px-3 py-2.5 text-sm shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2.5 border-t border-border bg-muted/30 px-5 py-5">
          <SummaryRow
            label="Rental duration"
            value={days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : "—"}
          />
          <SummaryRow
            label="Rental rate"
            value={`${currency(rate)} / ${periodUnit}`}
          />
          <SummaryRow
            label="Billing units"
            value={`${billingUnits} × ${period}`}
          />
          <SummaryRow label="Quantity" value={String(quantity)} />
          <SummaryRow label="Rental cost" value={currency(rentalCost)} />
          <SummaryRow label="Service fee" value={currency(0)} muted />

          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <div>
              <p className="text-sm font-bold text-foreground">Total payable</p>
              <p className="text-[11px] text-muted-foreground">
                Due at checkout
              </p>
            </div>
            <p className="text-2xl font-extrabold tracking-tight text-green-700 dark:text-lime-300">
              {currency(rentalCost)}
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!isAvailable || isPending}
            className="mt-4 h-12 w-full bg-green-700 font-semibold text-white shadow-md shadow-green-900/15 transition hover:bg-green-800 disabled:cursor-not-allowed dark:bg-lime-500 dark:text-[#052e16] dark:hover:bg-lime-400"
          >
            {!isAvailable ? (
              <>
                <AlertCircle className="size-4" aria-hidden="true" />
                Item out of stock
              </>
            ) : isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Checking your session…
              </>
            ) : (
              <>
                Continue to checkout
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>

          <p className="pt-1 text-center text-[11px] leading-4 text-muted-foreground">
            Payment is processed securely by Stripe.
          </p>
        </div>
      </form>
    </div>
  );
};

export default RentalBookingPanel;
