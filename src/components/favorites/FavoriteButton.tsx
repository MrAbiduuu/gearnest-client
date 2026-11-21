"use client";

import type { MouseEvent } from "react";
import { Heart } from "lucide-react";
import type { Equipment } from "@/lib/equipment";
import { cn } from "@/lib/utils";
import { useFavorites } from "./FavoritesProvider";

type FavoriteButtonProps = {
  equipment: Equipment;
  variant?: "overlay" | "inline";
  className?: string;
};

const FavoriteButton = ({
  equipment,
  variant = "overlay",
  className,
}: FavoriteButtonProps) => {
  const { isFavorite, isPending, isLoading, toggleFavorite } = useFavorites();

  const favorite = isFavorite(equipment._id);
  const busy = isPending(equipment._id) || isLoading;
  const label = favorite
    ? `Remove ${equipment.name} from favorites`
    : `Add ${equipment.name} to favorites`;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void toggleFavorite(equipment);
  };

  const heart = (
    <Heart
      aria-hidden="true"
      className={cn(
        "size-4 transition-all duration-200",
        favorite ? "fill-red-500 text-red-500" : "text-current",
      )}
    />
  );

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-label={label}
        aria-pressed={favorite}
        aria-busy={busy}
        title={label}
        className={cn(
          "inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-[#e8ded0] bg-card px-3 text-sm font-semibold text-[#4a3020] shadow-sm transition hover:border-[#d6c2a8] hover:bg-[#faf5ee] disabled:cursor-wait disabled:opacity-60 dark:border-green-900/60 dark:text-lime-200 dark:hover:bg-green-900/30",
          className,
        )}
      >
        {heart}
        {favorite ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={label}
      aria-pressed={favorite}
      aria-busy={busy}
      title={label}
      className={cn(
        "absolute top-3 left-3 flex size-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition duration-200 hover:scale-110 disabled:cursor-wait disabled:opacity-70 dark:bg-zinc-900/90",
        favorite
          ? "text-red-600 dark:text-red-400"
          : "text-[#7a5a3c] hover:text-red-600 dark:text-lime-200",
        className,
      )}
    >
      {heart}
    </button>
  );
};

export default FavoriteButton;
