"use client";

import { Skeleton } from "@/components/ui/skeleton";

const CustomerDashboardSkeleton = () => (
  <div
    aria-busy="true"
    aria-label="Loading customer dashboard"
    className="min-h-full space-y-6 rounded-2xl bg-[#FAF7F2] p-4 dark:bg-[#0B0D0B] sm:p-6 lg:p-7"
  >
    <Skeleton className="h-48 w-full rounded-2xl bg-[#EDE1D6] dark:bg-stone-800 sm:h-56" />

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton
          key={index}
          className="h-36 rounded-2xl bg-[#EDE1D6] dark:bg-stone-800"
        />
      ))}
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton
          key={index}
          className="h-24 rounded-2xl bg-[#EDE1D6] dark:bg-stone-800"
        />
      ))}
    </div>

    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <Skeleton className="h-[420px] rounded-2xl bg-[#EDE1D6] dark:bg-stone-800" />
      <Skeleton className="h-[420px] rounded-2xl bg-[#EDE1D6] dark:bg-stone-800" />
    </div>

    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <Skeleton className="h-80 rounded-2xl bg-[#EDE1D6] dark:bg-stone-800" />
      <Skeleton className="h-80 rounded-2xl bg-[#EDE1D6] dark:bg-stone-800" />
    </div>

    <Skeleton className="h-28 w-full rounded-2xl bg-[#EDE1D6] dark:bg-stone-800" />
  </div>
);

export default CustomerDashboardSkeleton;
