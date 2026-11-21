"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaArrowRight } from "react-icons/fa";

const HomeBanner = () => {
  const shouldReduceMotion = useReducedMotion();

  const reveal = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 28,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.7,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="w-full overflow-hidden bg-background">
      <div className="mx-auto grid max-w-360 items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:gap-10 md:py-14 lg:px-12 lg:py-20">
        {/* Left Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="space-y-5 sm:space-y-7"
        >
          {/* Badge */}
          <motion.div
            variants={reveal}
            className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1.5 text-xs font-bold tracking-wide text-green-800 dark:bg-green-900/40 dark:text-lime-200 sm:px-4 sm:py-2 sm:text-sm"
          >
            <Zap size={16} className="fill-green-700" />
            RENT WITH CONFIDENCE
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={reveal}
            className="text-3xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
          >
            Rent the Right
            <br />
            Equipment,
            <span className="text-green-700 dark:text-lime-400"> Anytime!</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={reveal}
            className="max-w-lg text-sm leading-7 text-muted-foreground sm:text-base lg:text-lg"
          >
            Find and rent high-quality equipment for your projects, events, and
            more — quickly and easily.
          </motion.p>

          {/* CTA */}
          <motion.div variants={reveal} className="pt-2">
            <motion.div
              whileHover={
                shouldReduceMotion ? undefined : { y: -4, scale: 1.02 }
              }
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
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
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Banner Image */}
        <motion.div
          initial={{
            opacity: 0,
            scale: shouldReduceMotion ? 1 : 0.85,
            x: shouldReduceMotion ? 0 : 35,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 1,
            delay: shouldReduceMotion ? 0 : 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative flex items-center justify-center"
        >
          <motion.div
            animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full"
          >
            <Image
              src="/GearNestBanner.png"
              alt="Shopping cart filled with rental equipment"
              width={900}
              height={500}
              priority
              className="h-auto w-full max-w-105 object-contain sm:max-w-137.5 lg:max-w-162.5"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeBanner;
