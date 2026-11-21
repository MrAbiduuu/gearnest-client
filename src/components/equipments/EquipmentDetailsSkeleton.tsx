import { Skeleton } from "@/components/ui/skeleton";

const EquipmentDetailsSkeleton = () => {
  return (
    <main className="min-h-[70vh] bg-background">
      <div className="mx-auto w-full max-w-360 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-4 w-64 max-w-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-8">
            <Skeleton className="aspect-4/3 w-full rounded-xl sm:aspect-16/10" />

            <div className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-8 w-36" />
            </div>

            <div className="space-y-3 border-t border-border pt-7">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-3/4" />
            </div>

            <div className="space-y-4 border-t border-border pt-7">
              <Skeleton className="h-5 w-36" />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <Skeleton key={index} className="h-20 rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default EquipmentDetailsSkeleton;
