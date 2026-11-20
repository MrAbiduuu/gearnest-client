import { Skeleton } from "@/components/ui/skeleton";

const EquipmentSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border border-[#e8ded0] bg-card dark:border-green-900/60"
        >
          <Skeleton className="aspect-4/3 w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-1/2 rounded-full" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex items-center justify-between border-t border-[#eee6da] pt-4 dark:border-green-900/50">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EquipmentSkeleton;
