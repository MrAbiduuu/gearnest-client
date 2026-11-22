"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
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

const PAGE_SIZE = 9;

type PageState = {
  items: Equipment[];
  filters: FilterState;
  searchTerm: string;
  sort: SortOption;
  page: number;
};

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
  const [pageState, setPageState] = useState<PageState | null>(null);

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

  // The stored page only applies to the exact result set that produced it.
  // Any filter, search, sort or data change falls back to page 1.
  const isCurrentResult =
    pageState?.items === items &&
    pageState.filters === filters &&
    pageState.searchTerm === searchTerm &&
    pageState.sort === sort;
  const page = isCurrentResult && pageState ? pageState.page : 1;

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedItems = useMemo(
    () => visibleItems.slice(startIndex, startIndex + PAGE_SIZE),
    [visibleItems, startIndex],
  );

  const goToPage = (nextPage: number) => {
    setPageState({ items, filters, searchTerm, sort, page: nextPage });
  };

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
            {visibleItems.length === 0 ? (
              <>Showing 0 equipment</>
            ) : (
              <>
                Showing{" "}
                <span className="font-bold text-foreground">
                  {startIndex + 1}–{startIndex + paginatedItems.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-foreground">
                  {visibleItems.length}
                </span>{" "}
                equipment
              </>
            )}
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
          items={paginatedItems}
          loading={loading}
          error={error}
          onRetry={retry}
        />

        {!loading && !error && totalPages > 1 ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page{" "}
              <span className="font-semibold text-foreground">
                {currentPage}
              </span>{" "}
              of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
                className="rounded-lg"
              >
                <ChevronLeft aria-hidden="true" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className="rounded-lg"
              >
                Next
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default EquipmentBrowser;
