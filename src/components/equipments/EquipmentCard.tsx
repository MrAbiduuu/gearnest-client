"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Folder,
  MapPin,
  ShieldCheck,
  Star,
  User,
  Wrench,
} from "lucide-react";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { formatRentalRate } from "@/lib/equipment-filters";
import type { Equipment } from "@/lib/equipment";

const FALLBACK_IMAGE = "/equipment-fallback.svg";

const EquipmentCard = ({ item }: { item: Equipment }) => {
  const [imageSrc, setImageSrc] = useState(item.image || FALLBACK_IMAGE);

  const isAvailable = item.availableStock > 0;
  const hasRating = typeof item.rating === "number";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-[#e8ded0] bg-card shadow-[0_10px_30px_-24px_rgba(74,48,32,0.7)] transition duration-300 hover:-translate-y-1 hover:border-[#d6c2a8] hover:shadow-[0_18px_36px_-22px_rgba(74,48,32,0.55)] dark:border-green-900/60 dark:hover:border-green-800">
      {/* Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={item.name}
          onError={() => setImageSrc(FALLBACK_IMAGE)}
          loading="lazy"
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />

        <FavoriteButton equipment={item} />

        <span
          className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide shadow-sm ${
            isAvailable
              ? "bg-green-600 text-white"
              : "bg-stone-500 text-white dark:bg-stone-700"
          }`}
        >
          {isAvailable ? "Available" : "Unavailable"}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base leading-6 font-bold text-foreground">
          {item.name}
        </h3>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f4efe7] px-2.5 py-1 text-[11px] font-semibold text-[#6b4b2f] dark:bg-green-900/40 dark:text-lime-200">
            <Folder className="size-3" aria-hidden="true" />
            {item.category}
          </span>

          {item.brand ? (
            <span className="text-[11px] font-medium text-muted-foreground">
              {item.brand}
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {hasRating ? (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
              <Star className="size-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
              {item.rating?.toFixed(1)}
              {typeof item.reviewCount === "number" ? (
                <span className="font-normal text-muted-foreground">
                  ({item.reviewCount})
                </span>
              ) : null}
            </span>
          ) : null}

          {item.condition ? (
            <span className="inline-flex items-center gap-1">
              <Wrench className="size-3.5" aria-hidden="true" />
              {item.condition} condition
            </span>
          ) : null}

          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.location ?? item.owner?.name ?? "Location on request"}</span>
          </span>
        </div>

        {item.owner?.isVerified ? (
          <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 dark:text-lime-300">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Verified owner
          </p>
        ) : null}

        {item.shortDescription ? (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {item.shortDescription}
          </p>
        ) : null}

        {/* Footer */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#eee6da] pt-4 dark:border-green-900/50">
          <div>
            <p className="text-lg font-extrabold text-[#b4461f] dark:text-orange-400">
              ৳{formatRentalRate(item.rentalRate)}
              <span className="text-xs font-medium text-muted-foreground">
                /{item.rentalPeriod}
              </span>
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <User className="size-3" aria-hidden="true" />
              {item.availableStock} in stock
            </p>
          </div>

          <Link
            href={`/equipment/${item._id}`}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-[#4a3020] px-3 text-xs font-semibold text-white transition hover:bg-[#3a2417] dark:bg-[#7a5335] dark:hover:bg-[#8d6240]"
          >
            View Details
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default EquipmentCard;
