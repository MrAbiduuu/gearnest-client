"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { motion } from "motion/react";

import CustomerSectionError from "@/components/customer/customer-section-error";
import {
  bookingStatusColors,
  capitalize,
  formatCount,
} from "@/components/customer/customer-dashboard-utils";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  CustomerBookingStatus,
  CustomerBookingStatusData,
} from "@/lib/customer-dashboard-api";

const statusConfig = {
  confirmed: { label: "Confirmed", color: bookingStatusColors.confirmed },
  completed: { label: "Completed", color: bookingStatusColors.completed },
  pending: { label: "Pending", color: bookingStatusColors.pending },
  cancelled: { label: "Cancelled", color: bookingStatusColors.cancelled },
} satisfies ChartConfig;

const statusOrder: CustomerBookingStatus[] = [
  "confirmed",
  "completed",
  "pending",
  "cancelled",
];

type CustomerBookingStatusChartProps = {
  data: CustomerBookingStatusData | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  reducedMotion: boolean;
};

const DonutSkeleton = () => (
  <div aria-hidden="true" className="flex justify-center py-2">
    <div className="relative size-44 rounded-full border-[18px] border-[#F3E9DE] dark:border-stone-800">
      <Skeleton className="absolute inset-8 rounded-full bg-[#F3E9DE] dark:bg-stone-800" />
    </div>
  </div>
);

const CustomerBookingStatusChart = ({
  data,
  isLoading,
  error,
  onRetry,
  reducedMotion,
}: CustomerBookingStatusChartProps) => {
  const statusCounts = data?.statusCounts;
  const total = statusCounts?.all ?? 0;
  const confirmedCount = Number(statusCounts?.confirmed ?? 0);
  const confirmedPercentage = total
    ? Math.round((confirmedCount / total) * 100)
    : 0;

  const chartData = useMemo(
    () =>
      statusOrder
        .map((status) => ({
          status,
          label: capitalize(status),
          value: Number(statusCounts?.[status] ?? 0),
          color: bookingStatusColors[status],
        }))
        .filter((item) => item.value > 0),
    [statusCounts],
  );

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reducedMotion ? 0 : 0.45, delay: reducedMotion ? 0 : 0.06 }}
      className="min-w-0 rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-[0_8px_28px_-20px_rgba(67,42,20,0.45)] dark:border-stone-800 dark:bg-[#111310] sm:p-6"
    >
      <h2 className="text-lg font-bold tracking-tight text-[#2E2119] dark:text-stone-100 sm:text-xl">
        Booking Status
      </h2>
      <p className="mt-1 text-xs text-[#8B7B6B] dark:text-stone-400 sm:text-sm">
        Your rental requests by current status
      </p>

      <div className="mt-5">
        {isLoading ? (
          <>
            <DonutSkeleton />
            <div className="mt-5 space-y-3">
              {statusOrder.map((status) => (
                <Skeleton
                  key={status}
                  className="h-4 w-full bg-[#F3E9DE] dark:bg-stone-800"
                />
              ))}
            </div>
          </>
        ) : error ? (
          <CustomerSectionError
            message={error}
            onRetry={onRetry}
            title="Could not load booking status"
            className="min-h-[260px]"
          />
        ) : !data ? (
          <div className="flex min-h-[260px] items-center justify-center text-sm text-[#8B7B6B] dark:text-stone-400">
            No booking status data is available yet.
          </div>
        ) : (
          <>
            <div className="relative mx-auto h-44 w-full max-w-[220px] sm:h-48">
              {total > 0 ? (
                <ChartContainer
                  config={statusConfig}
                  className="aspect-auto h-full w-full min-w-0"
                >
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="label"
                      innerRadius="62%"
                      outerRadius="88%"
                      paddingAngle={3}
                      startAngle={90}
                      endAngle={-270}
                      isAnimationActive={!reducedMotion}
                      animationDuration={700}
                    >
                      {chartData.map((item) => (
                        <Cell key={item.status} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #EDE1D6",
                        boxShadow: "0 12px 30px -18px rgba(67, 42, 20, 0.5)",
                        fontSize: 12,
                      }}
                      formatter={(value) => {
                        const numericValue =
                          typeof value === "number" ? value : Number(value);
                        const percentage = total
                          ? Math.round((numericValue / total) * 100)
                          : 0;
                        return [
                          `${formatCount(numericValue)} (${percentage}%)`,
                          "Bookings",
                        ];
                      }}
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="size-36 rounded-full border-[18px] border-[#EDE1D6] dark:border-stone-700" />
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-[#2E2119] dark:text-stone-100">
                  {formatCount(total)}
                </span>
                <span className="text-[10px] font-bold tracking-[0.12em] text-[#9A8A79] uppercase dark:text-stone-500">
                  {total === 1 ? "Booking" : "Bookings"}
                </span>
                <span className="mt-1 text-[10px] font-extrabold text-[#C2561B] dark:text-orange-400">
                  {total > 0 ? `${confirmedPercentage}% confirmed` : "No activity"}
                </span>
              </div>
            </div>

            {total === 0 ? (
              <p className="mt-3 text-center text-xs text-[#8B7B6B] dark:text-stone-400">
                No bookings yet, so no status percentages are shown.
              </p>
            ) : null}

            <div className="mt-5 space-y-3">
              {statusOrder.map((status) => {
                const value = Number(statusCounts?.[status] ?? 0);
                const percentage = total
                  ? Math.round((value / total) * 100)
                  : 0;

                return (
                  <div
                    key={status}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#F1E9E0] bg-[#FCFAF7] px-3 py-2 dark:border-stone-800 dark:bg-stone-900/40"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: bookingStatusColors[status] }}
                      />
                      <span className="truncate text-sm font-semibold text-[#3B2F27] dark:text-stone-200">
                        {capitalize(status)}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-extrabold text-[#2E2119] dark:text-stone-100">
                      {formatCount(value)}
                      {total > 0 ? (
                        <span className="ml-2 text-xs font-medium text-[#9A8A79] dark:text-stone-500">
                          {percentage}%
                        </span>
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </motion.section>
  );
};

export default CustomerBookingStatusChart;
