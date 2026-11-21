import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchEquipmentById } from "@/lib/equipment";
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
}: {
  title: string;
  description: string;
}) => (
  <main className="flex min-h-[70vh] items-center justify-center bg-[#f6f9fc] px-4 py-12">
    <div className="w-full max-w-md rounded-2xl border border-[#e6e9ee] bg-white px-6 py-12 text-center shadow-sm">
      <PackageSearch
        className="mx-auto size-10 text-[#8792a2]"
        aria-hidden="true"
      />
      <h1 className="mt-5 text-xl font-bold text-[#0a2540]">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-[#425466]">{description}</p>
      <Button
        render={<Link href="/equipment" />}
        nativeButton={false}
        className="mt-6 bg-[#635bff] text-white hover:bg-[#5148e8]"
      >
        <ArrowLeft aria-hidden="true" />
        Browse equipment
      </Button>
    </div>
  </main>
);

const CheckoutPage = async ({ searchParams }: CheckoutPageProps) => {
  const query = await searchParams;

  const equipmentId = firstValue(query.equipmentId) ?? "";
  const startDate = firstValue(query.startDate) ?? "";
  const endDate = firstValue(query.endDate) ?? "";

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
      quote={quote}
    />
  );
};

export default CheckoutPage;
