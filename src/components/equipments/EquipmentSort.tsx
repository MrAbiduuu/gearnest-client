"use client";

import { ArrowUpDown } from "lucide-react";
import {
  SORT_OPTIONS,
  type SortOption,
} from "@/lib/equipment-filters";

type EquipmentSortProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

const EquipmentSort = ({ value, onChange }: EquipmentSortProps) => {
  return (
    <label className="flex h-11 shrink-0 items-center gap-2 rounded-md border border-[#e7ddcf] bg-background px-3 dark:border-green-900/70">
      <ArrowUpDown
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />

      <span className="sr-only">Sort equipment by</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SortOption)}
        className="w-full cursor-pointer bg-transparent text-sm font-medium text-foreground outline-none sm:w-44"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default EquipmentSort;
