"use client";

import { useMemo } from "react";
import { AlertCircle, Info, RefreshCw, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCount,
  getChartScale,
} from "@/components/admin/analytics-utils";
/** Structural subset shared by the admin and owner booking API responses. */
type MonthlyBookingsChartData = {
  year: number;
  monthlyBookings: Array<{ month: string; totalBookings: number }>;
  bookingStatusesIncluded: string[];
};

const chartConfig = {
  totalBookings: {
    label: "Bookings",
    color: "#F97316",
  },
} satisfies ChartConfig;

const SKELETON_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type MonthlyBookingVolumeChartProps = {
  data: MonthlyBookingsChartData | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  reducedMotion: boolean;
};

const ChartSkeleton = () => (
  <div aria-hidden="true" className="h-[280px] w-full sm:h-[320px]">
    <div className="flex h-full flex-col justify-end gap-3 border-b border-[#EDE1D6] px-3">
      <Skeleton className="h-3 w-4/5 bg-[#FCE9DA] dark:bg-stone-800" />
      <Skeleton className="h-3 w-2/3 bg-[#FCE9DA] dark:bg-stone-800" />
      <Skeleton className="h-3 w-3/4 bg-[#FCE9DA] dark:bg-stone-800" />
      <Skeleton className="h-3 w-1/2 bg-[#FCE9DA] dark:bg-stone-800" />
    </div>
    <div className="mt-3 flex justify-between px-3">
      {SKELETON_MONTHS.map((month) => (
        <Skeleton key={month} className="h-3 w-6 bg-[#FCE9DA] dark:bg-stone-800" />
      ))}
    </div>
  </div>
);

const MonthlyBookingVolumeChart = ({
  data,
  isLoading,
  error,
  onRetry,
  reducedMotion,
}: MonthlyBookingVolumeChartProps) => {
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
  const { domainMax, ticks } = useMemo(() => getChartScale(maxValue), [maxValue]);

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reducedMotion ? 0 : 0.45, delay: reducedMotion ? 0 : 0.08 }}
      className="rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-[0_8px_28px_-20px_rgba(67,42,20,0.45)] dark:border-stone-800 dark:bg-[#111310] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-[#C2561B] uppercase dark:text-orange-400">
            <TrendingUp aria-hidden="true" className="size-3.5" />
            Booking velocity
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-[#2E2119] dark:text-stone-100 sm:text-xl">
            Monthly Booking Volume
          </h2>
          <p className="mt-1 text-xs text-[#8B7B6B] dark:text-stone-400 sm:text-sm">
            Actual bookings grouped by creation month
            {data ? " · UTC" : ""}
          </p>
        </div>

        {data && totalBookings > 0 ? (
          <div className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-right dark:border-orange-900/60 dark:bg-orange-950/20">
            <p className="text-[10px] font-bold tracking-[0.12em] text-[#C2561B] uppercase dark:text-orange-400">
              Selected year
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-[#A8470F] dark:text-orange-300">
              {formatCount(totalBookings)} bookings
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <ChartSkeleton />
        ) : error ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-red-200 bg-red-50/60 px-6 text-center dark:border-red-900/60 dark:bg-red-950/20">
            <AlertCircle className="size-7 text-red-500" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                Could not load booking volume for {data?.year ?? "this year"}.
              </p>
              <p className="mt-1 text-xs text-red-700/80 dark:text-red-300/80">
                {error}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="rounded-lg border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-stone-900 dark:text-red-300"
            >
              <RefreshCw aria-hidden="true" />
              Retry
            </Button>
          </div>
        ) : !data ? (
          <div className="flex min-h-[280px] items-center justify-center text-sm text-[#8B7B6B] dark:text-stone-400">
            No booking analytics are available yet.
          </div>
        ) : (
          <>
            {totalBookings === 0 ? (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
                <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  No bookings were created in {data.year}. Every month is shown
                  as zero — no sample data is used.
                </span>
              </div>
            ) : null}

            <motion.div
              key={`booking-volume-chart-${data.year}`}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.35 }}
            >
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[280px] w-full sm:h-[320px]"
              >
                <LineChart
                  data={monthlyBookings}
                  margin={{ top: 12, right: 12, left: -12, bottom: 0 }}
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
                    width={46}
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
                    labelFormatter={(label) => `${label} ${data.year}`}
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
                    key={`booking-volume-${data.year}-${totalBookings}`}
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

export default MonthlyBookingVolumeChart;
