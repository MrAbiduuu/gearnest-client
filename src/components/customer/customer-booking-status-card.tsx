"use client";

import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";

type CustomerBookingStatusCardProps = {
  title: string;
  value: string;
  support: string;
  icon: LucideIcon;
  iconClassName: string;
  href: string;
  index: number;
  reducedMotion: boolean;
  isLoading: boolean;
};

const CustomerBookingStatusCard = ({
  title,
  value,
  support,
  icon: Icon,
  iconClassName,
  href,
  index,
  reducedMotion,
  isLoading,
}: CustomerBookingStatusCardProps) => (
  <motion.article
    initial={reducedMotion ? false : { opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
      duration: reducedMotion ? 0 : 0.38,
      delay: reducedMotion ? 0 : 0.08 + index * 0.05,
    }}
    whileHover={reducedMotion ? undefined : { y: -3 }}
    className="group rounded-2xl border border-[#EDE1D6] bg-white shadow-sm dark:border-stone-800 dark:bg-[#111310]"
  >
    <Link
      href={href}
      className="flex h-full items-center gap-3 rounded-2xl p-4 outline-none focus-visible:ring-3 focus-visible:ring-[#F97316]/25"
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5 ${iconClassName}`}
      >
        <Icon aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-bold tracking-[0.12em] text-[#9A8A79] uppercase dark:text-stone-500">
          {title}
        </span>
        {isLoading ? (
          <Skeleton className="mt-1 h-6 w-12 bg-[#F3E9DE] dark:bg-stone-800" />
        ) : (
          <span className="mt-0.5 block text-xl font-extrabold text-[#2E2119] dark:text-stone-100">
            {value}
          </span>
        )}
        <span className="mt-0.5 block truncate text-[11px] text-[#8B7B6B] dark:text-stone-400">
          {support}
        </span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="size-4 shrink-0 text-[#C7B4A1] transition-transform group-hover:translate-x-1 dark:text-stone-600"
      />
    </Link>
  </motion.article>
);

export default CustomerBookingStatusCard;
