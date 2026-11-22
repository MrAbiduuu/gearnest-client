"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, BarChart3, Info, RefreshCw } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchAdminMonthlyBookings,
  type AdminMonthlyBookingsData,
} from "@/lib/admin-analytics-api";

const chartConfig = {
  totalBookings: {
    label: "Total bookings",
    color: "#F97316",
  },
} satisfies ChartConfig;

const SKELETON_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type MonthlyBookingsChartProps = {
  isAdmin: boolean;
  refreshKey: number;
};

const getYAxisScale = (maxValue: number) => {
  const steps = [1, 2, 5, 10, 20, 50, 100, 250, 500, 1000];
  const step =
    steps.find((candidate) => candidate * 5 >= maxValue) ??
    (Math.ceil(maxValue / 5 / 100) * 100 || 1);
  const domainMax = Math.max(step * 4, Math.ceil(maxValue / step) * step);
  const ticks = Array.from(
    { length: Math.floor(domainMax / step) + 1 },
    (_, index) => index * step,
  );

  return { domainMax, ticks };
};

const ChartSkeleton = () => (
  <div aria-hidden="true" className="h-[280px] w-full sm:h-[320px]">
    <div className="flex h-full items-end gap-1.5 border-b border-[#EDE1D6] px-3 sm:gap-3">
      {SKELETON_MONTHS.map((month) => (
        <div key={month} className="flex h-full flex-1 flex-col justify-end">
          <Skeleton className="h-[45%] w-full rounded-t-md bg-[#F3E9DE]" />
        </div>
      ))}
    </div>
    <div className="mt-3 flex justify-between px-3">
      {SKELETON_MONTHS.map((month) => (
        <Skeleton key={month} className="h-3 w-6 bg-[#F3E9DE]" />
      ))}
    </div>
  </div>
);

const MonthlyBookingsChart = ({
  isAdmin,
  refreshKey,
}: MonthlyBookingsChartProps) => {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [data, setData] = useState<AdminMonthlyBookingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;

    const controller = new AbortController();

    void (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchAdminMonthlyBookings(
          selectedYear,
          controller.signal,
        );
        if (!controller.signal.aborted) setData(response.data);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not load monthly booking activity.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [isAdmin, refreshKey, retryKey, selectedYear]);

  const retry = useCallback(() => setRetryKey((value) => value + 1), []);

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
  const { domainMax, ticks } = useMemo(() => getYAxisScale(maxValue), [maxValue]);

  const availableYears = useMemo(() => {
    const years = new Set<number>(data?.availableYears ?? []);
    years.add(selectedYear);
    return [...years].sort((a, b) => b - a);
  }, [data?.availableYears, selectedYear]);

  return (
    <motion.section
      initial={
        shouldReduceMotion ? false : { opacity: 0, y: 18 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
      className="rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-[0_8px_28px_-20px_rgba(67,42,20,0.45)] dark:border-stone-800 dark:bg-[#111310] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-[#C2561B] uppercase dark:text-orange-400">
            <BarChart3 aria-hidden="true" className="size-3.5" />
            Booking velocity
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-[#2E2119] dark:text-stone-100 sm:text-xl">
            Monthly Platform Bookings &amp; Velocity
          </h2>
          <p className="mt-1 text-xs text-[#8B7B6B] dark:text-stone-400 sm:text-sm">
            Real booking activity grouped by creation month.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="admin-booking-year"
            className="text-[11px] font-bold tracking-[0.12em] text-[#8B7B6B] uppercase dark:text-stone-400"
          >
            Year
          </label>
          <NativeSelect
            id="admin-booking-year"
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="w-24 [&_select]:border-[#EDE1D6] [&_select]:bg-[#FCFAF7] [&_select]:font-semibold [&_select]:text-[#3B2F27] dark:[&_select]:border-stone-700 dark:[&_select]:bg-stone-900 dark:[&_select]:text-stone-100"
          >
            {availableYears.map((year) => (
              <NativeSelectOption key={year} value={year}>
                {year}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <ChartSkeleton />
        ) : error ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-red-200 bg-red-50/60 px-6 text-center dark:border-red-900/60 dark:bg-red-950/20">
            <AlertCircle className="size-7 text-red-500" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                Could not load booking activity for {selectedYear}.
              </p>
              <p className="mt-1 text-xs text-red-700/80 dark:text-red-300/80">
                {error}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={retry}
              className="border-red-200 bg-white text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-stone-900 dark:text-red-300"
            >
              <RefreshCw aria-hidden="true" />
              Retry
            </Button>
          </div>
        ) : !data ? (
          <div className="flex min-h-[280px] items-center justify-center text-sm text-[#8B7B6B] dark:text-stone-400">
            No analytics are available for this year yet.
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
              key={`booking-chart-${data.year}-${retryKey}`}
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
            >
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[280px] w-full sm:h-[320px]"
              >
                <BarChart
                  data={monthlyBookings}
                  margin={{ top: 12, right: 8, left: -16, bottom: 0 }}
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
                    cursor={{ fill: "#F97316", fillOpacity: 0.08 }}
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
                        `${numericValue.toLocaleString()} ${
                          numericValue === 1 ? "booking" : "bookings"
                        }`,
                        "Total bookings",
                      ];
                    }}
                  />
                  <Bar
                    key={`bookings-${data.year}-${retryKey}`}
                    dataKey="totalBookings"
                    name="Total bookings"
                    fill="#F97316"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={42}
                    isAnimationActive={!shouldReduceMotion}
                    animationDuration={650}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ChartContainer>
            </motion.div>

            <p className="mt-4 text-[11px] leading-5 text-[#9A8A79] dark:text-stone-500">
              Includes {data.bookingStatusesIncluded.join(", ")} bookings by
              creation date. Months with no bookings display zero.
            </p>
          </>
        )}
      </div>
    </motion.section>
  );
};

export default MonthlyBookingsChart;
