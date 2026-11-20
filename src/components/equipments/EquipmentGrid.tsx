"use client";

import { PackageSearch, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Equipment } from "@/lib/equipment";
import EquipmentCard from "./EquipmentCard";
import EquipmentSkeleton from "./EquipmentSkeleton";

type EquipmentGridProps = {
  items: Equipment[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

const EquipmentGrid = ({
  items,
  loading,
  error,
  onRetry,
}: EquipmentGridProps) => {
  if (loading) return <EquipmentSkeleton />;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-900/50 dark:bg-red-950/20">
        <p className="font-semibold text-red-800 dark:text-red-300">
          Could not load equipment
        </p>
        <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/70">
          {error}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          className="mt-4 rounded-md"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#e0d3c2] bg-card px-6 py-16 text-center dark:border-green-900/60">
        <PackageSearch
          className="mx-auto size-9 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="mt-4 font-semibold text-foreground">
          No equipment found
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try changing your search or clearing a few filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <EquipmentCard key={item._id} item={item} />
      ))}
    </div>
  );
};

export default EquipmentGrid;
