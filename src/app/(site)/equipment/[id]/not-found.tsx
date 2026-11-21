import Link from "next/link";
import { ArrowLeft, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
          <PackageX className="size-6" aria-hidden="true" />
        </span>

        <h1 className="mt-5 text-xl font-bold text-foreground">
          Equipment not found
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This listing may have been removed or the link may be incorrect.
          Browse the collection to find similar equipment.
        </p>

        <Link href="/equipment">
          <Button
            type="button"
            className="mt-6 h-10 w-full bg-green-700 font-semibold text-white hover:bg-green-800 dark:bg-lime-500 dark:text-[#052e16] dark:hover:bg-lime-400"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Equipment
          </Button>
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
