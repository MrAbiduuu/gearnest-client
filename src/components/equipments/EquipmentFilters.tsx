"use client";

import type { ReactNode } from "react";
import { MapPin } from "lucide-react";
import {
  RENTAL_PERIODS,
  type FilterState,
} from "@/lib/equipment-filters";

type EquipmentFiltersProps = {
  categories: string[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  hasLocationData: boolean;
};

const FilterSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="border-b border-[#eee6da] pb-5 last:border-b-0 last:pb-0 dark:border-green-900/50">
    <h3 className="mb-3 text-sm font-bold text-foreground">{title}</h3>
    {children}
  </div>
);

const checkboxClassName =
  "size-4 shrink-0 cursor-pointer accent-[#4a3020] dark:accent-lime-500";

const EquipmentFilters = ({
  categories,
  filters,
  onChange,
  onClear,
  hasLocationData,
}: EquipmentFiltersProps) => {
  const update = (patch: Partial<FilterState>) =>
    onChange({ ...filters, ...patch });

  const toggleCategory = (category: string) => {
    const next = filters.categories.includes(category)
      ? filters.categories.filter((item) => item !== category)
      : [...filters.categories, category];

    update({ categories: next });
  };

  const toggleRentalPeriod = (period: string) => {
    update({
      rentalPeriod: filters.rentalPeriod === period ? "" : period,
    });
  };

  return (
    <div className="space-y-5">
      <FilterSection title="Category">
        <div className="max-h-60 space-y-2.5 overflow-y-auto pr-1">
          {categories.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => toggleCategory(category)}
                className={`mt-0.5 ${checkboxClassName}`}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Location">
        <div className="relative">
          <MapPin
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />

          <input
            type="text"
            value={filters.location}
            onChange={(event) => update({ location: event.target.value })}
            placeholder="e.g. Dhaka, Sylhet..."
            aria-label="Filter by location"
            className="h-10 w-full rounded-md border border-[#e7ddcf] bg-background pr-3 pl-9 text-sm outline-none transition placeholder:text-muted-foreground focus:border-[#8b6b4a] dark:border-green-900/70"
          />
        </div>

        {!hasLocationData ? (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Location is not included in the current API response.
          </p>
        ) : null}
      </FilterSection>

      <FilterSection title="Rental Type">
        <div className="space-y-2.5">
          {RENTAL_PERIODS.map((period) => (
            <label
              key={period}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <input
                type="checkbox"
                checked={filters.rentalPeriod === period}
                onChange={() => toggleRentalPeriod(period)}
                className={checkboxClassName}
              />
              <span className="capitalize">{period}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={filters.minPrice}
            onChange={(event) => update({ minPrice: event.target.value })}
            placeholder="Min"
            aria-label="Minimum rental price"
            className="h-10 w-full min-w-0 rounded-md border border-[#e7ddcf] bg-background px-3 text-sm outline-none focus:border-[#8b6b4a] dark:border-green-900/70"
          />

          <span className="text-muted-foreground">-</span>

          <input
            type="number"
            min={0}
            value={filters.maxPrice}
            onChange={(event) => update({ maxPrice: event.target.value })}
            placeholder="Max"
            aria-label="Maximum rental price"
            className="h-10 w-full min-w-0 rounded-md border border-[#e7ddcf] bg-background px-3 text-sm outline-none focus:border-[#8b6b4a] dark:border-green-900/70"
          />
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground transition hover:text-foreground">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(event) => update({ availableOnly: event.target.checked })}
            className={checkboxClassName}
          />
          <span>Available Only</span>
        </label>
      </FilterSection>

      <button
        type="button"
        onClick={onClear}
        className="w-full rounded-md border border-[#e0d3c2] bg-[#faf6f0] px-4 py-2.5 text-sm font-semibold text-[#5c3d26] transition hover:bg-[#f3eadf] dark:border-green-900/60 dark:bg-green-950/40 dark:text-lime-200 dark:hover:bg-green-900/50"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default EquipmentFilters;
