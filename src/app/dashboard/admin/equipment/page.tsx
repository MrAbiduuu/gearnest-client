"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  ExternalLink,
  Factory,
  Hash,
  MapPin,
  Package,
  RefreshCw,
  Tag,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchEquipments,
  type Equipment,
  type EquipmentStatus,
} from "@/lib/equipment";

const FALLBACK_IMAGE = "/equipment-fallback.svg";

type CatalogFilter = "all" | EquipmentStatus;

const filters: { key: CatalogFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const statusStyles: Record<EquipmentStatus, string> = {
  approved:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  rejected:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
};

const statusAccents: Record<EquipmentStatus, string> = {
  approved: "bg-emerald-500",
  pending: "bg-amber-500",
  rejected: "bg-red-500",
};

/**
 * Legacy listings were created before the `status` field existed. Like the
 * public/owner equipment views, an absent or unknown value is treated as
 * approved so those live listings stay in the approved bucket.
 */
const getStatus = (equipment: Equipment): EquipmentStatus => {
  const value = String(equipment.status ?? "").toLowerCase();
  return value === "pending" || value === "rejected" ? value : "approved";
};

const coverImage = (equipment: Equipment) =>
  equipment.image?.trim() || equipment.images?.[0]?.trim() || FALLBACK_IMAGE;

const formatRate = (equipment: Equipment) => {
  if (typeof equipment.rentalRate !== "number") return "Price on request";
  const amount = new Intl.NumberFormat("en-US").format(equipment.rentalRate);
  const period = (equipment.rentalPeriod || "day").toLowerCase();
  return `৳${amount} / ${period}`;
};

const formatStock = (stock: number) =>
  `${stock} ${stock === 1 ? "unit" : "units"}`;

const ownerLabel = (equipment: Equipment) =>
  equipment.owner?.name?.trim() ||
  equipment.owner?.email?.trim() ||
  "Owner not listed";

const CardSkeleton = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
    <Skeleton className="aspect-[16/10] w-full rounded-none" />
    <div className="flex flex-1 flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-4/5" />
      <div className="space-y-2.5">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3.5 w-1/3" />
      </div>
      <Skeleton className="h-14 w-full rounded-xl" />
      <Skeleton className="mt-auto h-9 w-full rounded-lg" />
    </div>
  </div>
);

const EquipmentCard = ({ equipment }: { equipment: Equipment }) => {
  const status = getStatus(equipment);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-900/5 dark:hover:shadow-black/20">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <Image
          src={coverImage(equipment)}
          alt={equipment.name}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />

        <span
          className={`absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-sm backdrop-blur-sm ${statusStyles[status]}`}
        >
          <span className={`size-1.5 rounded-full ${statusAccents[status]}`} />
          <span className="capitalize">{status}</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-green-700 uppercase dark:text-lime-400">
          <Tag size={13} aria-hidden="true" />
          <span className="truncate">{equipment.category || "Uncategorized"}</span>
        </div>

        <h2 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-foreground">
          {equipment.name}
        </h2>

        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin
              size={15}
              className="mt-0.5 shrink-0 text-green-700 dark:text-lime-400"
              aria-hidden="true"
            />
            <dt className="sr-only">Location</dt>
            <dd className="line-clamp-1">
              {equipment.location?.trim() || "Location not specified"}
            </dd>
          </div>

          <div className="flex items-start gap-2 text-muted-foreground">
            <Factory
              size={15}
              className="mt-0.5 shrink-0 text-green-700 dark:text-lime-400"
              aria-hidden="true"
            />
            <dt className="sr-only">Brand and model</dt>
            <dd className="line-clamp-1">
              {[equipment.brand, equipment.model].filter(Boolean).join(" · ") ||
                "Brand / model not specified"}
            </dd>
          </div>

          <div className="flex items-start gap-2 text-muted-foreground">
            <UserRound
              size={15}
              className="mt-0.5 shrink-0 text-green-700 dark:text-lime-400"
              aria-hidden="true"
            />
            <dt className="sr-only">Owner</dt>
            <dd className="line-clamp-1">{ownerLabel(equipment)}</dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-green-200/70 bg-green-50/60 px-3 py-2.5 dark:border-green-800/50 dark:bg-green-900/15">
          <span className="text-sm font-bold text-green-800 dark:text-lime-200">
            {formatRate(equipment)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Boxes size={14} className="text-green-700 dark:text-lime-400" aria-hidden="true" />
            {formatStock(equipment.availableStock)}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Hash size={13} aria-hidden="true" />
            <span className="font-mono">
              {equipment._id?.slice(-8) || "N/A"}
            </span>
          </span>

          <Button
            render={
              <Link href={`/equipment/${encodeURIComponent(equipment._id)}`} />
            }
            nativeButton={false}
            size="sm"
            className="rounded-lg bg-[#166534] text-white hover:bg-[#14532D] dark:bg-lime-400 dark:text-[#17251C] dark:hover:bg-lime-300"
          >
            View Details
            <ExternalLink aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
};

const AllEquipmentPage = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<CatalogFilter>("all");

  const loadEquipments = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchEquipments(signal);
      setEquipments(data);
    } catch (loadError) {
      if (signal?.aborted) return;
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load the equipment catalog.",
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => void loadEquipments(controller.signal));
    return () => controller.abort();
  }, [loadEquipments]);

  const counts = useMemo(() => {
    const result: Record<CatalogFilter, number> = {
      all: equipments.length,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    for (const equipment of equipments) {
      result[getStatus(equipment)] += 1;
    }

    return result;
  }, [equipments]);

  const visibleEquipments = useMemo(() => {
    if (activeFilter === "all") return equipments;
    return equipments.filter((equipment) => getStatus(equipment) === activeFilter);
  }, [equipments, activeFilter]);

  const isEmpty = !loading && !error && visibleEquipments.length === 0;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-green-700 dark:hover:text-lime-300"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Admin Overview
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Platform Equipment Catalog
          </h1>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-bold text-green-700 dark:border-green-800/60 dark:bg-green-900/30 dark:text-lime-300">
            <Package size={14} aria-hidden="true" />
            {counts.all}
          </span>
        </div>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Review owner submissions, grant public approval, or reject invalid
          machinery listings.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Filter equipment by status"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;

          return (
            <button
              key={filter.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveFilter(filter.key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 ${
                isActive
                  ? "border-[#166534] bg-[#166534] text-white shadow-md shadow-green-900/15 dark:border-lime-400 dark:bg-lime-400 dark:text-[#17251C]"
                  : "border-border bg-card text-muted-foreground hover:border-green-500/60 hover:text-foreground"
              }`}
            >
              {filter.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white dark:bg-[#17251C]/15 dark:text-[#17251C]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {counts[filter.key]}
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
            <AlertTriangle className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-4 font-bold text-red-800 dark:text-red-200">
            Could not load the equipment catalog
          </p>
          <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/70">
            {error}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadEquipments()}
            className="mt-5 rounded-lg"
          >
            <RefreshCw aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-sm">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
            <Package className="size-7" aria-hidden="true" />
          </span>
          <p className="mt-5 text-base font-bold text-foreground">
            {counts.all === 0
              ? "No equipment listed yet"
              : `No ${activeFilter} equipment`}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            {counts.all === 0
              ? "Listings will appear here as soon as owners add their equipment."
              : `There are no ${activeFilter} listings right now. Try another status filter.`}
          </p>
          {counts.all > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveFilter("all")}
              className="mt-5 rounded-lg"
            >
              View all equipment
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleEquipments.map((equipment) => (
            <EquipmentCard key={equipment._id} equipment={equipment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllEquipmentPage;
