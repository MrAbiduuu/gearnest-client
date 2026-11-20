import Image from "next/image";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaArrowRight } from "react-icons/fa";

const HomeBanner = () => {
  return (
    <section className="overflow-hidden bg-[#F8FAF8]">
      <div className="container mx-auto grid max-w-360 items-center gap-10 px-2 py-12 md:grid-cols-2 lg:px-12 lg:py-20">
        {/* Left Content */}
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-4 py-2 text-sm font-bold tracking-wide text-green-800">
            <Zap size={16} className="fill-green-700" />
            RENT WITH CONFIDENCE
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-[#17251C] sm:text-5xl lg:text-6xl">
            Rent the Right
            <br />
            Equipment,
            <span className="text-green-700"> Anytime!</span>
          </h1>

          <p className="max-w-lg text-base leading-8 text-gray-600 sm:text-lg">
            Find and rent high-quality equipment for your projects, events, and
            more — quickly and easily.
          </p>

          <div className="pt-2">
            <Button
              size="lg"
              className="h-12 rounded-lg bg-green-700 px-7 text-base font-semibold text-white shadow-lg shadow-green-900/15 transition hover:bg-green-800"
            >
              <Link className="flex gap-2 items-center" href="/equipment">
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
            className="h-auto w-full max-w-[650px] object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
