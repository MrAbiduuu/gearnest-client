"use client";

import { useMemo, type ReactNode } from "react";
import { AlertCircle, BarChart3, Info, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCompactCurrency,
  formatCount,
  formatCurrency,
  getChartScale,
} from "@/components/admin/analytics-utils";
type RevenueSeriesPoint = {
  month: string;
  revenue: number;
};

/** Structural subset shared by the admin and owner revenue API responses. */
type RevenueChartData = {
  year: number;
  monthlyRevenue: RevenueSeriesPoint[];
  currency: string;
  currencyBreakdown: unknown[];
};

const SKELETON_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type MonthlyRevenueChartProps = {
  data: RevenueChartData | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  reducedMotion: boolean;
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  accentColor?: string;
  eyebrowClassName?: string;
  summaryClassName?: string;
  summaryLabelClassName?: string;
  summaryValueClassName?: string;
  skeletonClassName?: string;
  tooltipName?: string;
  footnote?: ReactNode;
};

const ChartSkeleton = ({ className }: { className: string }) => (
  <div aria-hidden="true" className="h-[280px] w-full sm:h-[320px]">
    <div className="flex h-full items-end gap-1.5 border-b border-[#EDE1D6] px-3 sm:gap-3">
      {SKELETON_MONTHS.map((month, index) => (
        <div key={`${month}-${index}`} className="flex h-full flex-1 flex-col justify-end">
          <Skeleton className={`h-[35%] w-full rounded-t-md ${className}`} />
        </div>
      ))}
    </div>
    <div className="mt-3 flex justify-between px-3">
      {SKELETON_MONTHS.map((month, index) => (
        <Skeleton
          key={`${month}-label-${index}`}
          className={`h-3 w-6 ${className}`}
        />
      ))}
    </div>
  </div>
);

const MonthlyRevenueChart = ({
  data,
  isLoading,
  error,
  onRetry,
  reducedMotion,
  title = "Monthly Platform Revenue ($)",
  eyebrow = "Financial performance",
  subtitle = "Gross paid rental volume by payment date",
  accentColor = "#16A34A",
  eyebrowClassName = "text-green-700 dark:text-emerald-400",
  summaryClassName = "border-green-100 bg-green-50 dark:border-green-900/60 dark:bg-green-950/20",
  summaryLabelClassName = "text-green-700 dark:text-emerald-400",
  summaryValueClassName = "text-green-800 dark:text-emerald-300",
  skeletonClassName = "bg-[#EAF3EC] dark:bg-stone-800",
  tooltipName = "Paid rental volume",
  footnote,
}: MonthlyRevenueChartProps) => {
  const chartConfig = useMemo(
    () =>
      ({
        revenue: { label: "Revenue", color: accentColor },
      }) satisfies ChartConfig,
    [accentColor],
  );
  const monthlyRevenue = useMemo(
    () => data?.monthlyRevenue ?? [],
    [data?.monthlyRevenue],
  );
  const currency = data?.currency ?? "BDT";
  const totalRevenue = useMemo(
    () =>
      monthlyRevenue.reduce(
        (sum, item) => sum + (Number(item.revenue) || 0),
        0,
      ),
    [monthlyRevenue],
  );
  const maxValue = useMemo(
    () =>
      monthlyRevenue.reduce(
        (max, item) => Math.max(max, Number(item.revenue) || 0),
        0,
      ),
    [monthlyRevenue],
  );
  const { domainMax, ticks } = useMemo(() => getChartScale(maxValue), [maxValue]);

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reducedMotion ? 0 : 0.45 }}
      className="rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-[0_8px_28px_-20px_rgba(67,42,20,0.45)] dark:border-stone-800 dark:bg-[#111310] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div
            className={`flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] uppercase ${eyebrowClassName}`}
          >
            <BarChart3 aria-hidden="true" className="size-3.5" />
            {eyebrow}
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-[#2E2119] dark:text-stone-100 sm:text-xl">
            {title}
          </h2>
          <p className="mt-1 text-xs text-[#8B7B6B] dark:text-stone-400 sm:text-sm">
            {subtitle}
            {data ? ` · ${currency} · UTC` : ""}
          </p>
        </div>

        {data && totalRevenue > 0 ? (
          <div className={`rounded-xl border px-3 py-2 text-right ${summaryClassName}`}>
            <p
              className={`text-[10px] font-bold tracking-[0.12em] uppercase ${summaryLabelClassName}`}
            >
              Selected year
            </p>
            <p className={`mt-0.5 text-sm font-extrabold ${summaryValueClassName}`}>
              {formatCurrency(totalRevenue, currency)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <ChartSkeleton className={skeletonClassName} />
        ) : error ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-red-200 bg-red-50/60 px-6 text-center dark:border-red-900/60 dark:bg-red-950/20">
            <AlertCircle className="size-7 text-red-500" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                Could not load revenue for {data?.year ?? "this year"}.
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
            No revenue analytics are available yet.
          </div>
        ) : (
          <>
            {totalRevenue === 0 ? (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
                <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  No successful payments were recorded in {data.year}. Every
                  month is shown as zero — no sample data is used.
                </span>
              </div>
            ) : null}

            <motion.div
              key={`revenue-chart-${data.year}`}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.35 }}
            >
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[280px] w-full sm:h-[320px]"
              >
                <BarChart
                  data={monthlyRevenue}
                  margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
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
                    tickLine={false}
                    axisLine={false}
                    width={62}
                    tickFormatter={(value: number) =>
                      formatCompactCurrency(value, currency)
                    }
                    tick={{ fill: "#8B7B6B", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: accentColor, fillOpacity: 0.08 }}
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
                        formatCurrency(numericValue, currency),
                        tooltipName,
                      ];
                    }}
                  />
                  <Bar
                    key={`revenue-${data.year}-${totalRevenue}`}
                    dataKey="revenue"
                    name={tooltipName}
                    fill={accentColor}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={42}
                    isAnimationActive={!reducedMotion}
                    animationDuration={700}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ChartContainer>
            </motion.div>

            <p className="mt-4 text-[11px] leading-5 text-[#9A8A79] dark:text-stone-500">
              {footnote ?? (
                <>
                  {formatCount(data.currencyBreakdown.length)} actual payment{" "}
                  {data.currencyBreakdown.length === 1 ? "currency" : "currencies"}{" "}
                  found. Duplicate Stripe sessions are excluded. No platform
                  commission is recorded, so this is gross paid rental volume.
                </>
              )}
            </p>
          </>
        )}
      </div>
    </motion.section>
  );
};

export default MonthlyRevenueChart;
