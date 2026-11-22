"use client";

import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export type CustomerStatTone = "orange" | "green" | "blue" | "red";

const toneStyles: Record<CustomerStatTone, string> = {
  orange:
    "bg-[#FCE9DA] text-[#C2561B] dark:bg-orange-950/40 dark:text-orange-300",
  green:
    "bg-[#E8F4E4] text-[#166534] dark:bg-green-900/40 dark:text-lime-300",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  red: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

type CustomerStatCardProps = {
  title: string;
  value: string;
  support: string;
  icon: LucideIcon;
  tone: CustomerStatTone;
  index: number;
  reducedMotion: boolean;
  isLoading: boolean;
};

const CustomerStatCard = ({
  title,
  value,
  support,
  icon: Icon,
  tone,
  index,
  reducedMotion,
  isLoading,
}: CustomerStatCardProps) => (
  <motion.article
    initial={reducedMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      duration: reducedMotion ? 0 : 0.4,
      delay: reducedMotion ? 0 : index * 0.06,
      ease: [0.22, 1, 0.36, 1],
    }}
    whileHover={reducedMotion ? undefined : { y: -4 }}
    aria-busy={isLoading}
    className="rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-[0_8px_28px_-22px_rgba(67,42,20,0.55)] transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(67,42,20,0.55)] dark:border-stone-800 dark:bg-[#111310]"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-bold tracking-[0.14em] text-[#9A8A79] uppercase dark:text-stone-500">
          {title}
        </p>
        {isLoading ? (
          <Skeleton className="mt-3 h-9 w-28 bg-[#F3E9DE] dark:bg-stone-800" />
        ) : (
          <p className="mt-3 truncate text-2xl font-extrabold tracking-tight text-[#2E2119] dark:text-stone-100 sm:text-3xl">
            {value}
          </p>
        )}
      </div>
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5 ${toneStyles[tone]}`}
      >
        <Icon aria-hidden="true" />
      </span>
    </div>

    <div className="mt-4 flex min-h-5 items-center border-t border-[#F1E9E0] pt-3 text-xs text-[#8B7B6B] dark:border-stone-800 dark:text-stone-400">
      {isLoading ? (
        <Skeleton className="h-3 w-36 bg-[#F3E9DE] dark:bg-stone-800" />
      ) : (
        <span className="truncate">{support}</span>
      )}
    </div>
  </motion.article>
);

export default CustomerStatCard;
