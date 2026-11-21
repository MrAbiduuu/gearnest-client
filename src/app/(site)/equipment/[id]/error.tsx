"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const ErrorPage = ({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) => {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
          <TriangleAlert className="size-6" aria-hidden="true" />
        </span>

        <h1 className="mt-5 text-xl font-bold text-foreground">
          We couldn&apos;t load this equipment
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The listing may be temporarily unavailable. Please try again or go
          back to all equipment.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            onClick={retry}
            className="h-10 bg-green-700 font-semibold text-white hover:bg-green-800 dark:bg-lime-500 dark:text-[#052e16] dark:hover:bg-lime-400"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </Button>

          <Link href="/equipment">
            <Button type="button" variant="outline" className="h-10 w-full">
              <ArrowLeft className="size-4" aria-hidden="true" />
              All Equipment
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ErrorPage;
