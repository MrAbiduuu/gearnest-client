"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Package } from "lucide-react";
import { motion } from "motion/react";

import CustomerSectionError from "@/components/customer/customer-section-error";
import {
  bookingStatusStyles,
  capitalize,
  DEFAULT_FALLBACK_IMAGE,
  formatDate,
  formatMoney,
} from "@/components/customer/customer-dashboard-utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CustomerRecentBooking } from "@/lib/customer-dashboard-api";

type CustomerRecentBookingsProps = {
  bookings: CustomerRecentBooking[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  reducedMotion: boolean;
};

const RecentBookingSkeleton = () => (
  <div className="flex items-center gap-3 rounded-xl border border-[#F1E9E0] bg-[#FCFAF7] p-3 dark:border-stone-800 dark:bg-stone-900/40">
    <Skeleton className="size-14 shrink-0 rounded-xl bg-[#F3E9DE] dark:bg-stone-800" />
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-4 w-2/3 bg-[#F3E9DE] dark:bg-stone-800" />
      <Skeleton className="h-3 w-1/2 bg-[#F3E9DE] dark:bg-stone-800" />
      <Skeleton className="h-3 w-1/3 bg-[#F3E9DE] dark:bg-stone-800" />
    </div>
    <Skeleton className="hidden h-8 w-20 rounded-lg bg-[#F3E9DE] sm:block dark:bg-stone-800" />
  </div>
);

const CustomerRecentBookings = ({
  bookings,
  isLoading,
  error,
  onRetry,
  reducedMotion,
}: CustomerRecentBookingsProps) => (
  <motion.section
    initial={reducedMotion ? false : { opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.12 }}
    transition={{ duration: reducedMotion ? 0 : 0.45 }}
    className="min-w-0 rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-[#111310] sm:p-6"
  >
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[#2E2119] dark:text-stone-100 sm:text-xl">
          Your Recent Bookings
        </h2>
        <p className="mt-1 text-xs text-[#8B7B6B] dark:text-stone-400 sm:text-sm">
          Your latest rental requests and equipment
        </p>
      </div>
      <Link
        href="/dashboard/customer/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C2561B] transition hover:text-[#9E410F] dark:text-orange-400 dark:hover:text-orange-300"
      >
        View All
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </Link>
    </div>

    <div className="mt-5 space-y-3">
      {isLoading ? (
        Array.from({ length: 3 }, (_, index) => (
          <RecentBookingSkeleton key={index} />
        ))
      ) : error ? (
        <CustomerSectionError
          message={error}
          onRetry={onRetry}
          title="Could not load your recent bookings"
        />
      ) : bookings.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-[#E6D8C8] px-6 text-center dark:border-stone-700">
          <Package
            aria-hidden="true"
            className="size-7 text-[#C2561B] dark:text-orange-400"
          />
          <p className="mt-3 text-sm font-bold text-[#2E2119] dark:text-stone-100">
            No bookings yet
          </p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-[#8B7B6B] dark:text-stone-400">
            Explore equipment and reserve what you need for your next project.
          </p>
          <Button
            render={<Link href="/equipment" />}
            nativeButton={false}
            size="sm"
            className="mt-4 rounded-lg bg-[#F97316] text-white hover:bg-[#EA6A0F]"
          >
            Explore Equipment
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      ) : (
        bookings.map((booking, index) => (
          <motion.article
            key={booking.id}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: reducedMotion ? 0 : 0.35,
              delay: reducedMotion ? 0 : index * 0.05,
            }}
            className="group flex flex-col gap-3 rounded-xl border border-[#F1E9E0] bg-[#FCFAF7] p-3 transition hover:border-[#E6D8C8] hover:shadow-sm dark:border-stone-800 dark:bg-stone-900/40 sm:flex-row sm:items-center"
          >
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-[#EDE1D6] bg-[#F3E9DE] dark:border-stone-800 dark:bg-stone-800">
              <Image
                src={booking.equipmentImage || DEFAULT_FALLBACK_IMAGE}
                alt={booking.equipmentName}
                fill
                unoptimized
                sizes="56px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(event) => {
                  if (!event.currentTarget.src.endsWith(DEFAULT_FALLBACK_IMAGE)) {
                    event.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                  }
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="truncate text-sm font-bold text-[#2E2119] dark:text-stone-100">
                  {booking.equipmentName}
                </h3>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${bookingStatusStyles[booking.status]}`}
                >
                  {capitalize(booking.status)}
                </span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#8B7B6B] dark:text-stone-400">
                <CalendarDays aria-hidden="true" className="size-3.5" />
                <span>{formatDate(booking.startDate)}</span>
                <span aria-hidden="true">→</span>
                <span>{formatDate(booking.endDate)}</span>
              </p>
              <p className="mt-1 text-[11px] text-[#9A8A79] dark:text-stone-500">
                {formatMoney(booking.totalAmount, booking.currency)} ·{" "}
                {booking.quantity} {booking.quantity === 1 ? "unit" : "units"} ·{" "}
                {booking.days} {booking.days === 1 ? "day" : "days"}
              </p>
            </div>

            <Button
              render={<Link href={`/equipment/${booking.equipmentId}`} />}
              nativeButton={false}
              variant="outline"
              size="sm"
              className="shrink-0 rounded-lg border-[#E6D8C8] bg-white text-[#6F5D4D] hover:border-[#D9601B] hover:text-[#C2561B] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
            >
              View Item
              <ArrowUpRight aria-hidden="true" />
            </Button>
          </motion.article>
        ))
      )}
    </div>
  </motion.section>
);

export default CustomerRecentBookings;
