"use client";

import { useMemo } from "react";
import { Info, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getChartScale } from "@/components/admin/analytics-utils";
import CustomerSectionError from "@/components/customer/customer-section-error";
import { formatCount } from "@/components/customer/customer-dashboard-utils";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  CustomerBookingAnalyticsData,
  CustomerBookingPeriod,
} from "@/lib/customer-dashboard-api";

const chartConfig = {
  totalBookings: { label: "Bookings", color: "#F97316" },
} satisfies ChartConfig;

const PERIOD_LABELS: Record<CustomerBookingPeriod, string> = {
  "3months": "Last 3 months",
  "6months": "Last 6 months",
  "12months": "Last 12 months",
};

type CustomerBookingOverviewChartProps = {
  data: CustomerBookingAnalyticsData | null;
  period: CustomerBookingPeriod;
  onPeriodChange: (period: CustomerBookingPeriod) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  reducedMotion: boolean;
};

const ChartSkeleton = () => (
  <div aria-hidden="true" className="h-[260px] w-full sm:h-[300px]">
    <div className="flex h-full flex-col justify-end gap-5 border-b border-[#EDE1D6] px-3">
      <Skeleton className="h-3 w-3/4 bg-[#FCE9DA] dark:bg-stone-800" />
      <Skeleton className="h-3 w-1/2 bg-[#FCE9DA] dark:bg-stone-800" />
      <Skeleton className="h-3 w-2/3 bg-[#FCE9DA] dark:bg-stone-800" />
      <Skeleton className="h-3 w-2/5 bg-[#FCE9DA] dark:bg-stone-800" />
    </div>
    <div className="mt-4 flex justify-between px-3">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton
          key={index}
          className="h-3 w-7 bg-[#FCE9DA] dark:bg-stone-800"
        />
      ))}
    </div>
  </div>
);

const CustomerBookingOverviewChart = ({
  data,
  period,
  onPeriodChange,
  isLoading,
  error,
  onRetry,
  reducedMotion,
}: CustomerBookingOverviewChartProps) => {
  const monthlyBookings = useMemo(
    () => data?.monthlyBookings ?? [],
    [data?.monthlyBookings],
  );
  const totalBookings = useMemo(
    () =>
      monthlyBookings.reduce(
        (sum, item) => sum + (Number(item.totalBookings) || 0),
        0,
      ),
    [monthlyBookings],
  );
  const maxValue = useMemo(
    () =>
      monthlyBookings.reduce(
        (max, item) => Math.max(max, Number(item.totalBookings) || 0),
        0,
      ),
    [monthlyBookings],
  );
  const { domainMax, ticks } = useMemo(
    () => getChartScale(maxValue),
    [maxValue],
  );
  const availablePeriods = data?.availablePeriods ?? [
    "3months",
    "6months",
    "12months",
  ];

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reducedMotion ? 0 : 0.45 }}
      className="min-w-0 rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-[0_8px_28px_-20px_rgba(67,42,20,0.45)] dark:border-stone-800 dark:bg-[#111310] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-[#C2561B] uppercase dark:text-orange-400">
            <TrendingUp aria-hidden="true" className="size-3.5" />
            Rental activity
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-[#2E2119] dark:text-stone-100 sm:text-xl">
            Your Booking Overview
          </h2>
          <p className="mt-1 text-xs text-[#8B7B6B] dark:text-stone-400 sm:text-sm">
            Monthly booking activity grouped on the backend · UTC
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isLoading && !error && totalBookings > 0 ? (
            <div className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-right dark:border-orange-900/60 dark:bg-orange-950/20">
              <p className="text-[10px] font-bold tracking-[0.12em] text-[#C2561B] uppercase dark:text-orange-400">
                Period total
              </p>
              <p className="mt-0.5 text-sm font-extrabold text-[#A8470F] dark:text-orange-300">
                {formatCount(totalBookings)} bookings
              </p>
            </div>
          ) : null}

          <label
            htmlFor="customer-booking-period"
            className="sr-only"
          >
            Booking chart period
          </label>
          <NativeSelect
            id="customer-booking-period"
            value={period}
            onChange={(event) =>
              onPeriodChange(event.target.value as CustomerBookingPeriod)
            }
            className="w-36 [&_select]:border-[#E6D8C8] [&_select]:bg-[#FCFAF7] [&_select]:font-bold [&_select]:text-[#3B2F27] dark:[&_select]:border-stone-700 dark:[&_select]:bg-stone-900 dark:[&_select]:text-stone-100"
          >
            {availablePeriods.map((option) => (
              <NativeSelectOption key={option} value={option}>
                {PERIOD_LABELS[option] ?? option}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <ChartSkeleton />
        ) : error ? (
          <CustomerSectionError
            message={error}
            onRetry={onRetry}
            title={`Could not load ${PERIOD_LABELS[period].toLowerCase()} data`}
            className="min-h-[260px]"
          />
        ) : !data ? (
          <div className="flex min-h-[260px] items-center justify-center text-sm text-[#8B7B6B] dark:text-stone-400">
            No booking analytics are available yet.
          </div>
        ) : (
          <>
            {totalBookings === 0 ? (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
                <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  No bookings were recorded in this period. Every month is shown
                  as zero — no sample data is used.
                </span>
              </div>
            ) : null}

            <motion.div
              key={`customer-bookings-${period}-${data.generatedAt ?? totalBookings}`}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.35 }}
              className="min-w-0"
            >
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[260px] w-full min-w-0 sm:h-[300px]"
              >
                <LineChart
                  data={monthlyBookings}
                  margin={{ top: 12, right: 10, left: -14, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="#EDE1D6"
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    dy={8}
                    tick={{ fill: "#8B7B6B", fontSize: 11 }}
                  />
                  <YAxis
                    domain={[0, domainMax]}
                    ticks={ticks}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={42}
                    tick={{ fill: "#8B7B6B", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ stroke: "#F97316", strokeDasharray: "4 4" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #EDE1D6",
                      boxShadow: "0 12px 30px -18px rgba(67, 42, 20, 0.5)",
                      fontSize: 12,
                    }}
                    labelFormatter={(label) => {
                      const point = monthlyBookings.find(
                        (item) => item.month === label,
                      );
                      return point ? `${point.month} ${point.year}` : String(label);
                    }}
                    formatter={(value) => {
                      const numericValue =
                        typeof value === "number" ? value : Number(value);
                      return [
                        `${formatCount(numericValue)} ${
                          numericValue === 1 ? "booking" : "bookings"
                        }`,
                        "Booking volume",
                      ];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalBookings"
                    name="Booking volume"
                    stroke="#F97316"
                    strokeWidth={3}
                    dot={{
                      r: 3.5,
                      fill: "#F97316",
                      stroke: "#FFFFFF",
                      strokeWidth: 1.5,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#F97316",
                      stroke: "#FFFFFF",
                      strokeWidth: 2,
                    }}
                    isAnimationActive={!reducedMotion}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ChartContainer>
            </motion.div>

            <p className="mt-4 text-[11px] leading-5 text-[#9A8A79] dark:text-stone-500">
              Includes {data.bookingStatusesIncluded.join(", ")} bookings by
              creation date. Deleted and invalid records are excluded.
            </p>
          </>
        )}
      </div>
    </motion.section>
  );
};

export default CustomerBookingOverviewChart;
