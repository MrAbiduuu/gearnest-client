"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { fetchEquipments, type Equipment } from "@/lib/equipment";
import {
  EMPTY_FILTERS,
  filterEquipments,
  getCategoryOptions,
  hasActiveFilters,
  sortEquipments,
  type FilterState,
  type SortOption,
} from "@/lib/equipment-filters";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import EquipmentFilters from "./EquipmentFilters";
import EquipmentGrid from "./EquipmentGrid";
import EquipmentSearch from "./EquipmentSearch";
import EquipmentSort from "./EquipmentSort";

const EquipmentBrowser = () => {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category") ?? "";

  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const searchTerm = useDebouncedValue(searchInput, 300);

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...EMPTY_FILTERS,
    categories: categoryFromUrl ? [categoryFromUrl] : [],
  }));
  const [sort, setSort] = useState<SortOption>("recent");

  // Fetch once on mount, and again whenever the retry button is pressed.
  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const data = await fetchEquipments(controller.signal);
        setItems(data);
        setError(null);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Something went wrong while loading equipment.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void load();
    return () => controller.abort();
  }, [reloadCount]);

  const categoryOptions = useMemo(() => getCategoryOptions(items), [items]);

  const visibleItems = useMemo(
    () => sortEquipments(filterEquipments(items, filters, searchTerm), sort),
    [items, filters, searchTerm, sort],
  );

  const hasLocationData = useMemo(
    () => items.some((item) => Boolean(item.location)),
    [items],
  );

  const activeCount =
    filters.categories.length +
    (filters.location.trim() ? 1 : 0) +
    (filters.rentalPeriod ? 1 : 0) +
    (filters.minPrice.trim() ? 1 : 0) +
    (filters.maxPrice.trim() ? 1 : 0) +
    (filters.availableOnly ? 1 : 0) +
    (searchInput.trim() ? 1 : 0);

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setSearchInput("");
    setSort("recent");
  };

  const retry = () => {
    setLoading(true);
    setError(null);
    setReloadCount((count) => count + 1);
  };

  const filtersProps = {
    categories: categoryOptions,
    filters,
    onChange: setFilters,
    onClear: clearAll,
    hasLocationData,
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Desktop filters */}
      <aside className="hidden w-52 shrink-0 rounded-lg border border-[#e8ded0] bg-card p-4 shadow-sm lg:block dark:border-green-900/60">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Filters</h2>
          {hasActiveFilters(filters, searchTerm) ? (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-[#8b5a34] hover:underline dark:text-lime-300"
            >
              Reset
            </button>
          ) : null}
        </div>

        <EquipmentFilters {...filtersProps} />
      </aside>

      {/* Listing */}
      <section className="min-w-0 flex-1">
        <div className="rounded-lg border border-[#e8ded0] bg-card p-3 shadow-sm dark:border-green-900/60 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <EquipmentSearch
              value={searchInput}
              onChange={setSearchInput}
              onSearch={() => setSearchInput(searchInput)}
            />

            <EquipmentSort value={sort} onChange={setSort} />

            {/* Mobile filters drawer */}
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    className="h-11 shrink-0 rounded-md lg:hidden"
                  >
                    <SlidersHorizontal className="size-4" aria-hidden="true" />
                    Filters
                    {activeCount > 0 ? (
                      <span className="ml-1 rounded-full bg-[#4a3020] px-1.5 text-[10px] text-white dark:bg-lime-600 dark:text-zinc-950">
                        {activeCount}
                      </span>
                    ) : null}
                  </Button>
                }
              />

              <SheetContent
                side="left"
                className="w-[88vw] max-w-sm overflow-y-auto bg-card"
              >
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>

                <div className="px-4 pb-8">
                  <EquipmentFilters {...filtersProps} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="mt-5 mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-bold text-foreground">
              {visibleItems.length}
            </span>{" "}
            of {items.length} equipment
          </p>

          {hasActiveFilters(filters, searchTerm) ? (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-[#8b5a34] hover:underline dark:text-lime-300"
            >
              Clear all
            </button>
          ) : null}
        </div>

        <EquipmentGrid
          items={visibleItems}
          loading={loading}
          error={error}
          onRetry={retry}
        />
      </section>
    </div>
  );
};

export default EquipmentBrowser;
