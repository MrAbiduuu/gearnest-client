import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchEquipmentById, getAvailableStock } from "@/lib/equipment";
import { getRentalQuote } from "@/lib/rental-pricing";
import CheckoutPayment from "./checkout-payment";

// Checkout reads request-specific search params and live equipment data.
export const instant = false;

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const CheckoutProblem = ({
  title,
  description,
  showDisabledCheckout = false,
}: {
  title: string;
  description: string;
  showDisabledCheckout?: boolean;
}) => (
  <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-12">
    <div className="w-full max-w-md rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-sm">
      <PackageSearch
        className="mx-auto size-10 text-green-700 dark:text-lime-400"
        aria-hidden="true"
      />
      <h1 className="mt-5 text-xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-col gap-3">
        {showDisabledCheckout ? (
          <Button
            disabled
            className="cursor-not-allowed opacity-60"
          >
            Checkout unavailable
          </Button>
        ) : null}
        <Button
          render={<Link href="/equipment" />}
          nativeButton={false}
          className="bg-[#166534] text-white hover:bg-[#14532D]"
        >
          <ArrowLeft aria-hidden="true" />
          Browse equipment
        </Button>
      </div>
    </div>
  </main>
);

const CheckoutPage = async ({ searchParams }: CheckoutPageProps) => {
  const query = await searchParams;

  const equipmentId = firstValue(query.equipmentId) ?? "";
  const startDate = firstValue(query.startDate) ?? "";
  const endDate = firstValue(query.endDate) ?? "";
  const deliveryAddress = firstValue(query.deliveryAddress) ?? "";

  const rawQuantity = Number(firstValue(query.quantity) ?? 1);
  const quantity =
    Number.isInteger(rawQuantity) && rawQuantity > 0 ? rawQuantity : 1;

  if (!equipmentId || !startDate || !endDate) {
    return (
      <CheckoutProblem
        title="No rental details selected"
        description="Choose equipment and rental dates from the catalog to start a secure checkout."
      />
    );
  }

  const equipment = await fetchEquipmentById(equipmentId);
  if (!equipment) {
    return (
      <CheckoutProblem
        title="Equipment unavailable"
        description="This listing is no longer available. Please choose another item."
      />
    );
  }

  const stock = getAvailableStock(equipment);
  if (stock <= 0) {
    return (
      <CheckoutProblem
        title="Item out of stock"
        description="This equipment is currently out of stock, so checkout is disabled. Please browse other equipment."
        showDisabledCheckout
      />
    );
  }

  if (quantity > stock) {
    return (
      <CheckoutProblem
        title="Requested quantity unavailable"
        description={`Only ${stock} ${stock === 1 ? "unit is" : "units are"} available for this equipment. Please update your rental request.`}
        showDisabledCheckout
      />
    );
  }

  const quote = getRentalQuote({
    rentalRate: equipment.rentalRate,
    rentalPeriod: equipment.rentalPeriod,
    startDate,
    endDate,
    quantity,
  });

  if (!quote || quote.rentalCost <= 0) {
    return (
      <CheckoutProblem
        title="Invalid rental details"
        description="The selected dates or quantity could not be priced. Please try again."
      />
    );
  }

  return (
    <CheckoutPayment
      equipment={equipment}
      startDate={startDate}
      endDate={endDate}
      deliveryAddress={deliveryAddress}
      quote={quote}
    />
  );
};

export default CheckoutPage;
