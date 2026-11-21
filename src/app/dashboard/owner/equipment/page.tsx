"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Loader2Icon,
  MapPin,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  fetchOwnerEquipments,
  deleteOwnerEquipment,
  type Equipment,
  type EquipmentStatus,
} from "@/lib/equipment";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

const FALLBACK_IMAGE = "/equipment-fallback.svg";

const statusStyles: Record<EquipmentStatus, string> = {
  approved:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  rejected:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
};

const getStatus = (equipment: Equipment): EquipmentStatus => {
  const value = String(equipment.status ?? "approved").toLowerCase();
  return value === "pending" || value === "rejected" ? value : "approved";
};

const EquipmentThumbnail = ({
  equipment,
  className = "size-20 sm:size-28",
}: {
  equipment: Equipment;
  className?: string;
}) => (
  <div
    className={`${className} shrink-0 overflow-hidden rounded-xl border border-border bg-muted`}
  >
    <Image
      src={equipment.image || FALLBACK_IMAGE}
      alt={equipment.name}
      width={200}
      height={200}
      unoptimized
      className="h-full w-full object-cover"
      onError={(event) => {
        event.currentTarget.src = FALLBACK_IMAGE;
      }}
    />
  </div>
);

const CardSkeleton = () => (
  <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:p-5">
    <Skeleton className="size-20 rounded-xl sm:size-28" />
    <div className="flex-1 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
    <div className="flex gap-2 sm:w-64">
      <Skeleton className="h-8 flex-1" />
      <Skeleton className="h-8 flex-1" />
      <Skeleton className="h-8 flex-1" />
    </div>
  </div>
);

const MyEquipmentPage = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Equipment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadEquipments = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchOwnerEquipments(signal);
      setEquipments(data);
    } catch (loadError) {
      if (signal?.aborted) return;
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load your equipment.",
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

  const confirmDelete = async () => {
    if (!pendingDelete || deletingId) return;

    setDeletingId(pendingDelete._id);

    try {
      await deleteOwnerEquipment(pendingDelete._id);

      toast.add({
        type: "success",
        title: "Equipment deleted successfully",
        description: `${pendingDelete.name} has been removed from your listings.`,
        timeout: 5000,
      });

      setPendingDelete(null);
      await loadEquipments();
    } catch (deleteError) {
      toast.add({
        type: "error",
        title: "Could not delete equipment",
        description:
          deleteError instanceof Error
            ? deleteError.message
            : "Please try again.",
        timeout: 6000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Your Equipment Listings ({equipments.length})
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Update rental prices, stock inventory, and review admin approval
            status.
          </p>
        </div>

        <Link
          href="/dashboard/owner/add-equipment"
          className={buttonVariants({ className: "w-fit" })}
        >
          <Plus />
          Add Equipment
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50/60 px-6 py-12 text-center dark:border-red-900/60 dark:bg-red-950/20">
          <AlertCircle className="size-8 text-red-500" />
          <div>
            <p className="font-semibold text-foreground">
              Could not load your listings
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" onClick={() => void loadEquipments()}>
            <RefreshCw />
            Try again
          </Button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && equipments.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package className="size-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            No Equipment Listed Yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Start earning by listing your equipment on GearNest.
          </p>
          <Link
            href="/dashboard/owner/add-equipment"
            className={buttonVariants({ className: "mt-6" })}
          >
            Add Your First Equipment
            <ArrowRight />
          </Link>
        </div>
      )}

      {/* List */}
      {!loading && !error && equipments.length > 0 && (
        <div className="space-y-4">
          {equipments.map((equipment) => {
            const status = getStatus(equipment);

            return (
              <article
                key={equipment._id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-start sm:gap-5 sm:p-5"
              >
                <EquipmentThumbnail equipment={equipment} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-bold text-foreground">
                      {equipment.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className={statusStyles[status]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-muted-foreground">
                      {equipment.category}
                    </Badge>
                    {equipment.brand || equipment.model ? (
                      <span className="text-xs text-muted-foreground">
                        {[equipment.brand, equipment.model]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    ) : null}
                  </div>

                  {equipment.location ? (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">{equipment.location}</span>
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      <span className="text-primary">৳</span>
                      {Number(equipment.rentalRate).toLocaleString()}
                      <span className="font-normal text-muted-foreground">
                        / {String(equipment.rentalPeriod ?? "daily").toLowerCase()}
                      </span>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 ${
                        equipment.availableStock > 0
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      <Package className="size-4" />
                      {equipment.availableStock} available
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-wrap gap-2 border-t border-border pt-3 sm:w-64 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                  <Link
                    href={`/equipment/${equipment._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${equipment.name}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    <ExternalLink />
                    <span className="hidden lg:inline">View</span>
                  </Link>

                  <Link
                    href={`/dashboard/owner/equipment/edit/${equipment._id}`}
                    aria-label={`Edit ${equipment.name}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    <Pencil />
                    <span className="hidden lg:inline">Edit</span>
                  </Link>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setPendingDelete(equipment)}
                    aria-label={`Delete ${equipment.name}`}
                  >
                    <Trash2 />
                    <span className="hidden lg:inline">Delete</span>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletingId) setPendingDelete(null);
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Equipment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this equipment listing? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {pendingDelete && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
              <EquipmentThumbnail
                equipment={pendingDelete}
                className="size-14 shrink-0"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {pendingDelete.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {pendingDelete.category}
                </p>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deletingId !== null}
              onClick={() => void confirmDelete()}
            >
              {deletingId ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <Trash2 />
              )}
              {deletingId ? "Deleting..." : "Delete Equipment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyEquipmentPage;
