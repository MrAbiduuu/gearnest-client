"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";

type CustomerWelcomeBannerProps = {
  customerName: string;
  isLoading: boolean;
  reducedMotion: boolean;
};

const CustomerWelcomeBanner = ({
  customerName,
  isLoading,
  reducedMotion,
}: CustomerWelcomeBannerProps) => (
  <motion.section
    initial={reducedMotion ? false : { opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="relative isolate overflow-hidden rounded-2xl bg-[#2E2119] px-5 py-7 shadow-[0_18px_50px_-32px_rgba(46,33,25,0.9)] sm:px-8 sm:py-9 dark:border dark:border-stone-800"
  >
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_20%,rgba(249,115,22,0.32),transparent_45%)]"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-20 -bottom-32 -z-10 size-72 rounded-full bg-orange-500/15 blur-3xl"
    />

    <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      <div className="min-w-0">
        <p className="text-[11px] font-bold tracking-[0.18em] text-orange-300 uppercase">
          Customer dashboard
        </p>
        {isLoading ? (
          <Skeleton className="mt-4 h-9 w-2/3 max-w-sm bg-white/15" />
        ) : (
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Welcome back, {customerName}!
          </h1>
        )}
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#DCCBBB] sm:text-base">
          Rent the best equipment for your projects with ease and confidence.
        </p>
        <Link
          href="/equipment"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-900/25 transition hover:-translate-y-0.5 hover:bg-[#EA6A0F] focus-visible:ring-3 focus-visible:ring-orange-300/50"
        >
          Explore Equipment
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <div className="relative mx-auto h-40 w-full max-w-sm sm:h-48 lg:h-56">
        <Image
          src="/GearNestBanner.png"
          alt="GearNest rental equipment"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 384px, 420px"
          className="object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.35)]"
        />
      </div>
    </div>
  </motion.section>
);

export default CustomerWelcomeBanner;
