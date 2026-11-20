import Image from "next/image";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaArrowRight } from "react-icons/fa";

const HomeBanner = () => {
  return (
    <section className="w-full overflow-hidden bg-background">
      <div className="mx-auto grid max-w-360 items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:gap-10 md:py-14 lg:px-12 lg:py-20">
        {/* Left Content */}
        <div className="space-y-5 sm:space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1.5 text-xs font-bold tracking-wide text-green-800 dark:bg-green-900/40 dark:text-lime-200 sm:px-4 sm:py-2 sm:text-sm">
            <Zap size={16} className="fill-green-700" />
            RENT WITH CONFIDENCE
          </div>

          <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Rent the Right
            <br />
            Equipment,
            <span className="text-green-700 dark:text-lime-400"> Anytime!</span>
          </h1>

          <p className="max-w-lg text-sm leading-7 text-muted-foreground sm:text-base lg:text-lg">
            Find and rent high-quality equipment for your projects, events, and
            more — quickly and easily.
          </p>

          <div className="pt-2">
            <Button
              size="lg"
              className="h-12 w-full rounded-lg bg-green-700 px-7 text-base font-semibold text-white shadow-lg shadow-green-900/15 transition hover:bg-green-800 sm:w-auto"
            >
              <Link
                className="flex w-full items-center justify-center gap-2 sm:w-auto"
                href="/equipment"
              >
                Browse All Equipment
                <FaArrowRight />
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Banner Image */}
        <div className="relative flex items-center justify-center">
          <Image
            src="/GearNestBanner.png"
            alt="Shopping cart filled with rental equipment"
            width={900}
            height={500}
            priority
            className="h-auto w-full max-w-105 object-contain sm:max-w-137.5 lg:max-w-162.5"
          />
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
