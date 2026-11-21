"use client";

import Link from "next/link";
import { ArrowRight, Heart, RefreshCw } from "lucide-react";
import EquipmentCard from "@/components/equipments/EquipmentCard";
import EquipmentSkeleton from "@/components/equipments/EquipmentSkeleton";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
import { Button } from "@/components/ui/button";

const MyFavoritesPage = () => {
  const { items, isAuthenticated, isLoading, error, refresh } = useFavorites();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          My Favorites
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your saved equipment, all in one place. Find your next rental whenever
          you need it.
        </p>
      </div>

      {isLoading ? (
        <EquipmentSkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <p className="font-semibold text-red-800 dark:text-red-300">
            Could not load your favorites
          </p>
          <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/70">
            {error}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void refresh()}
            className="mt-5 rounded-md"
          >
            <RefreshCw aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : !isAuthenticated ? (
        <div className="rounded-2xl border border-dashed border-[#e0d3c2] bg-card px-6 py-16 text-center dark:border-green-900/60">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f4efe7] text-[#8b5a34] dark:bg-green-900/40 dark:text-lime-200">
            <Heart className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-4 font-semibold text-foreground">Please sign in</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to view and manage your saved equipment.
          </p>
          <Button
            render={
              <Link href="/signin?callbackUrl=/dashboard/customer/favorites" />
            }
            nativeButton={false}
            className="mt-5 rounded-md"
          >
            Sign in
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e0d3c2] bg-card px-6 py-16 text-center dark:border-green-900/60">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#f4efe7] text-[#8b5a34] dark:bg-green-900/40 dark:text-lime-200">
            <Heart className="size-7" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-bold text-foreground">
            Your Favorites List is Empty
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            You haven&apos;t saved any equipment yet. Explore our collection and
            save the equipment you love.
          </p>
          <Button
            render={<Link href="/equipment" />}
            nativeButton={false}
            size="lg"
            className="mt-6 rounded-md"
          >
            Explore Equipment
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {items.length} saved {items.length === 1 ? "item" : "items"}
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <EquipmentCard key={item._id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MyFavoritesPage;
