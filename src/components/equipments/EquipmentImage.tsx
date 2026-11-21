"use client";

import { useState } from "react";
import { Folder } from "lucide-react";

const FALLBACK_IMAGE = "/equipment-fallback.svg";

type EquipmentImageProps = {
  name: string;
  image?: string;
  category: string;
  isAvailable: boolean;
};

const EquipmentImage = ({
  name,
  image,
  category,
  isAvailable,
}: EquipmentImageProps) => {
  const [imageSrc, setImageSrc] = useState(image || FALLBACK_IMAGE);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-muted shadow-[0_22px_55px_-38px_rgba(22,101,52,0.75)]">
      <div className="aspect-4/3 w-full sm:aspect-16/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={name}
          onError={() => setImageSrc(FALLBACK_IMAGE)}
          className="size-full object-cover transition-transform duration-700 hover:scale-[1.02]"
        />
      </div>

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
        <span className="inline-flex max-w-[70%] items-center gap-1.5 rounded-lg border border-white/20 bg-white/95 px-3 py-1.5 text-xs font-semibold text-green-800 shadow-sm backdrop-blur dark:border-green-800/60 dark:bg-zinc-950/85 dark:text-lime-200">
          <Folder className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{category}</span>
        </span>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm ${
            isAvailable
              ? "bg-green-700 dark:bg-green-600"
              : "bg-stone-600 dark:bg-stone-700"
          }`}
        >
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${
              isAvailable ? "bg-lime-300" : "bg-stone-300"
            }`}
          />
          {isAvailable ? "Available" : "Unavailable"}
        </span>
      </div>
    </div>
  );
};

export default EquipmentImage;
