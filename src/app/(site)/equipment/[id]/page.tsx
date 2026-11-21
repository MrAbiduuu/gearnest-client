import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Mail,
  MapPin,
  Package,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import EquipmentImage from "@/components/equipments/EquipmentImage";
import RentalBookingPanel from "@/components/equipments/RentalBookingPanel";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { fetchEquipmentById } from "@/lib/equipment";
import { formatRentalRate } from "@/lib/equipment-filters";

interface EquipmentDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const PERIOD_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const getInitials = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "GN";
};

const EquipmentDetailsPage = async ({ params }: EquipmentDetailsPageProps) => {
  const { id } = await params;
  const equipment = await fetchEquipmentById(id);

  if (!equipment) notFound();

  const isAvailable = equipment.availableStock > 0;
  const period =
    PERIOD_LABELS[equipment.rentalPeriod?.toLowerCase()] ??
    equipment.rentalPeriod ??
    "Daily";
  const owner = equipment.owner;
  const ownerName = owner?.name?.trim() || "GearNest supplier";
  const description =
    equipment.description?.trim() ||
    equipment.shortDescription?.trim() ||
    "No description has been provided for this equipment yet.";
  const today = new Date().toISOString().slice(0, 10);

  const specifications = [
    { label: "Brand", value: equipment.brand?.trim() || "—" },
    { label: "Model", value: equipment.model?.trim() || "—" },
    { label: "Condition", value: equipment.condition?.trim() || "—" },
    {
      label: "Available stock",
      value: `${equipment.availableStock} ${
        equipment.availableStock === 1 ? "unit" : "units"
      }`,
    },
    {
      label: "Rental rate",
      value: `৳${formatRentalRate(equipment.rentalRate)} / ${period.toLowerCase()}`,
    },
    { label: "Rental type", value: period },
  ];

  return (
    <main className="min-h-[70vh] bg-background">
      <div className="mx-auto w-full max-w-360 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/equipment" />}>
                  All Equipment
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate">
                  {equipment.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Link
            href="/equipment"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 transition hover:text-green-900 dark:text-lime-300 dark:hover:text-lime-200"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Equipment
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
          {/* Equipment information */}
          <div className="min-w-0 space-y-8">
            <EquipmentImage
              key={equipment._id}
              name={equipment.name}
              image={equipment.image}
              category={equipment.category}
              isAvailable={isAvailable}
            />

            <section>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/40 dark:text-lime-200">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  {period} rental
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isAvailable
                      ? "bg-green-700 text-white dark:bg-green-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isAvailable
                    ? `${equipment.availableStock} in stock`
                    : "Out of stock"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  {equipment.name}
                </h1>

                <FavoriteButton equipment={equipment} variant="inline" />
              </div>

              <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                {equipment.location?.trim() || "Location available on request"}
              </p>

              <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-3xl font-extrabold tracking-tight text-green-700 dark:text-lime-300">
                  ৳{formatRentalRate(equipment.rentalRate)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  / {period.toLowerCase()}
                </span>
              </div>
            </section>

            <section className="border-t border-border pt-7">
              <h2 className="text-lg font-bold text-foreground">
                About this equipment
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground whitespace-pre-line">
                {description}
              </p>
            </section>

            <section className="border-t border-border pt-7">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
                  <Wrench className="size-4" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-bold text-foreground">
                  Specifications
                </h2>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
                {specifications.map((spec) => (
                  <div key={spec.label} className="bg-card p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {spec.label}
                    </p>
                    <p className="mt-1.5 text-sm font-bold text-foreground">
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-t border-border pt-7">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
                  <Package className="size-4" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-bold text-foreground">
                  Owner &amp; supplier
                </h2>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800 ring-2 ring-green-700/15 dark:bg-green-900/40 dark:text-lime-200 dark:ring-lime-400/25"
                >
                  {getInitials(ownerName)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{ownerName}</p>
                    {owner?.isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-800 dark:bg-green-900/40 dark:text-lime-200">
                        <ShieldCheck className="size-3" aria-hidden="true" />
                        Verified owner
                      </span>
                    ) : null}
                  </div>
                  {owner?.email ? (
                    <a
                      href={`mailto:${owner.email}`}
                      className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm text-muted-foreground transition hover:text-green-700 dark:hover:text-lime-300"
                    >
                      <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{owner.email}</span>
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Contact details available on request
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="border-t border-border pt-7">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
                  <ClipboardList className="size-4" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-bold text-foreground">
                  Rental terms &amp; conditions
                </h2>
              </div>

              <div className="mt-4 flex gap-3 rounded-xl border border-border bg-muted/40 p-4">
                <ClipboardList
                  className="mt-0.5 size-4 shrink-0 text-green-700 dark:text-lime-300"
                  aria-hidden="true"
                />
                <p className="text-sm leading-7 text-muted-foreground whitespace-pre-line">
                  {equipment.rentalTerms?.trim() ||
                    "Please contact the owner for the rental terms associated with this equipment."}
                </p>
              </div>
            </section>
          </div>

          {/* Sticky rental panel */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <RentalBookingPanel
              equipment={equipment}
              defaultStartDate={today}
            />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default EquipmentDetailsPage;
