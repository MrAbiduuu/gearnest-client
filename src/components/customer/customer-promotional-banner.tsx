"use client";

import Link from "next/link";
import { ArrowRight, HardHat } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

type CustomerPromotionalBannerProps = {
  reducedMotion: boolean;
};

const CustomerPromotionalBanner = ({
  reducedMotion,
}: CustomerPromotionalBannerProps) => (
  <motion.section
    initial={reducedMotion ? false : { opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: reducedMotion ? 0 : 0.45 }}
    className="relative isolate overflow-hidden rounded-2xl bg-[linear-gradient(110deg,#2E2119_0%,#5A2E1B_55%,#F97316_140%)] px-5 py-8 shadow-[0_18px_50px_-32px_rgba(46,33,25,0.9)] sm:px-8"
  >
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-24 right-10 -z-10 size-56 rounded-full bg-orange-300/20 blur-3xl"
    />
    <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-orange-200 ring-1 ring-white/20">
          <HardHat aria-hidden="true" className="size-6" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
            Make Your Work Easier with GearNest
          </h2>
          <p className="mt-1 text-sm font-medium text-[#F6D8C4]">
            Affordable • Reliable • Trusted
          </p>
        </div>
      </div>

      <Button
        render={<Link href="/equipment" />}
        nativeButton={false}
        className="shrink-0 rounded-xl bg-white text-[#2E2119] hover:bg-orange-50"
      >
        Rent Now
        <ArrowRight aria-hidden="true" />
      </Button>
    </div>
  </motion.section>
);

export default CustomerPromotionalBanner;
