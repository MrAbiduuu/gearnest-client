import type { Equipment } from "./equipment";

/** Categories requested for the filter panel. */
export const CATEGORY_OPTIONS = [
  "Agriculture Equipment",
  "Cleaning Equipment",
  "Construction Equipment",
  "Electronics",
  "Event Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
] as const;

export const RENTAL_PERIODS = ["daily", "weekly", "monthly"] as const;

export type SortOption =
  | "recent"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "name-asc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Recently Added" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "name-asc", label: "Name: A to Z" },
];

export type FilterState = {
  categories: string[];
  location: string;
  rentalPeriod: string;
  minPrice: string;
  maxPrice: string;
  availableOnly: boolean;
};

export const EMPTY_FILTERS: FilterState = {
  categories: [],
  location: "",
  rentalPeriod: "",
  minPrice: "",
  maxPrice: "",
  availableOnly: false,
};

/** Keep the requested categories, plus any extra ones the API actually uses. */
export function getCategoryOptions(items: Equipment[]): string[] {
  const fromApi = items.map((item) => item.category).filter(Boolean);

  return Array.from(new Set<string>([...CATEGORY_OPTIONS, ...fromApi])).sort(
    (a, b) => a.localeCompare(b),
  );
}

export function filterEquipments(
  items: Equipment[],
  filters: FilterState,
  searchTerm: string,
): Equipment[] {
  const query = searchTerm.trim().toLowerCase();
  const location = filters.location.trim().toLowerCase();
  const min = Number(filters.minPrice);
  const max = Number(filters.maxPrice);
  const hasMin = filters.minPrice.trim() !== "" && Number.isFinite(min);
  const hasMax = filters.maxPrice.trim() !== "" && Number.isFinite(max);

  return items.filter((item) => {
    if (query) {
      const searchableText = [item.name, item.category, item.brand, item.model]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(query)) return false;
    }

    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(item.category)
    ) {
      return false;
    }

    if (location && !(item.location ?? "").toLowerCase().includes(location)) {
      return false;
    }

    if (filters.rentalPeriod && item.rentalPeriod !== filters.rentalPeriod) {
      return false;
    }

    if (hasMin && item.rentalRate < min) return false;
    if (hasMax && item.rentalRate > max) return false;
    if (filters.availableOnly && item.availableStock <= 0) return false;

    return true;
  });
}

export function sortEquipments(
  items: Equipment[],
  sort: SortOption,
): Equipment[] {
  const sorted = [...items];

  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.rentalRate - b.rentalRate);
    case "price-desc":
      return sorted.sort((a, b) => b.rentalRate - a.rentalRate);
    case "rating":
      return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "recent": {
      return sorted.sort((a, b) => {
        const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bTime - aTime;
      });
    }
    default:
      return sorted;
  }
}

export function hasActiveFilters(
  filters: FilterState,
  searchTerm: string,
): boolean {
  return (
    searchTerm.trim() !== "" ||
    filters.categories.length > 0 ||
    filters.location.trim() !== "" ||
    filters.rentalPeriod !== "" ||
    filters.minPrice.trim() !== "" ||
    filters.maxPrice.trim() !== "" ||
    filters.availableOnly
  );
}

export function formatRentalRate(rate: number): string {
  return new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(
    rate,
  );
}
