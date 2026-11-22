"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type CustomerSectionErrorProps = {
  message: string;
  onRetry: () => void;
  title?: string;
  className?: string;
};

const CustomerSectionError = ({
  message,
  onRetry,
  title = "Could not load this section",
  className = "min-h-40",
}: CustomerSectionErrorProps) => (
  <div
    className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-red-200 bg-red-50/60 px-5 py-8 text-center dark:border-red-900/60 dark:bg-red-950/20 ${className}`}
  >
    <AlertCircle className="size-6 text-red-500" aria-hidden="true" />
    <p className="text-sm font-semibold text-red-800 dark:text-red-200">{title}</p>
    <p className="max-w-sm text-xs text-red-700/80 dark:text-red-300/80">
      {message}
    </p>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onRetry}
      className="rounded-lg border-red-200 bg-white text-red-700 dark:border-red-800 dark:bg-stone-900 dark:text-red-300"
    >
      <RefreshCw aria-hidden="true" />
      Retry
    </Button>
  </div>
);

export default CustomerSectionError;
