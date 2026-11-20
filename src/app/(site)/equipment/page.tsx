import { Suspense } from "react";
import EquipmentBrowser from "@/components/equipments/EquipmentBrowser";
import EquipmentSkeleton from "@/components/equipments/EquipmentSkeleton";

const EquipmentsPage = () => {
  return (
    <main className="min-h-[70vh] bg-background">
      <div className="mx-auto w-full max-w-360 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <header className="mb-8">
          <p className="text-xs font-bold tracking-[0.2em] text-green-700 uppercase dark:text-lime-300">
            Browse collection
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            All Equipment
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Explore verified equipment from trusted owners and find the right
            gear for your next project.
          </p>
        </header>

        <Suspense fallback={<EquipmentSkeleton />}>
          <EquipmentBrowser />
        </Suspense>
      </div>
    </main>
  );
};

export default EquipmentsPage;
