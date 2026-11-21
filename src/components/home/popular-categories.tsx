"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  HardHat,
  Monitor,
  PartyPopper,
  SprayCan,
  Tractor,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

type Category = {
  name: string;
  description: string;
  itemCount: number;
  icon: LucideIcon;
};

const categories: Category[] = [
  {
    name: "Agriculture Equipment",
    description:
      "Farm tractors, combine harvesters, plows, seeders, and irrigation equipment.",
    itemCount: 1,
    icon: Tractor,
  },
  {
    name: "Cleaning Equipment",
    description:
      "Industrial pressure washers, floor scrubbers, steam cleaners, and commercial vacuums.",
    itemCount: 2,
    icon: SprayCan,
  },
  {
    name: "Construction Equipment",
    description:
      "Heavy machinery, excavators, bulldozers, rollers, and site equipment.",
    itemCount: 3,
    icon: HardHat,
  },
  {
    name: "Electronics",
    description:
      "Audio monitoring consoles, studio displays, broadcast equipment, and computing units.",
    itemCount: 1,
    icon: Monitor,
  },
  {
    name: "Event Equipment",
    description:
      "Stages, sound systems, outdoor event tents, LED projectors, and lighting rigs.",
    itemCount: 2,
    icon: PartyPopper,
  },
];

const PopularCategories = () => {
  const shouldReduceMotion = useReducedMotion();

  const headingVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.6 },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 35,
      scale: shouldReduceMotion ? 1 : 0.96,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.55,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="w-full bg-card py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-12">
        {/* Section Heading */}
        <motion.div
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.h2
            variants={headingVariants}
            className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
          >
            Popular Categories
          </motion.h2>

          <motion.p
            variants={headingVariants}
            className="mt-3 text-sm leading-6 text-muted-foreground sm:mt-4 sm:text-base sm:leading-7 lg:text-lg"
          >
            Explore verified equipment categories from our real-time database
          </motion.p>
        </motion.div>

        {/* Category Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            staggerChildren: shouldReduceMotion ? 0 : 0.12,
          }}
          className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          {categories.map(({ name, description, itemCount, icon: Icon }) => (
            <motion.div
              key={name}
              variants={cardVariants}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: -7,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      },
                    }
              }
            >
              <Link
                href={`/equipment?category=${encodeURIComponent(name)}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-background p-5 transition duration-300 hover:border-lime-400 hover:bg-card hover:shadow-[0_18px_40px_-24px_rgba(22,101,52,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 dark:hover:bg-green-950/40 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Category Icon */}
                  <motion.span
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : { rotate: -10, scale: 1.12 }
                    }
                    transition={{ type: "spring", stiffness: 350, damping: 15 }}
                    className="flex size-12 items-center justify-center rounded-xl bg-lime-100 text-green-700 transition-colors duration-300 group-hover:bg-green-700 group-hover:text-white dark:bg-green-900/40 dark:text-lime-300"
                  >
                    <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                  </motion.span>

                  {/* Arrow */}
                  <motion.span
                    whileHover={
                      shouldReduceMotion ? undefined : { x: 3, y: -3 }
                    }
                    className="flex size-9 items-center justify-center rounded-full border border-green-200 bg-card text-green-700 transition-colors duration-300 group-hover:border-green-700 group-hover:bg-green-700 group-hover:text-white dark:border-green-800 dark:text-lime-300"
                  >
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </motion.span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-foreground transition-colors duration-300 group-hover:text-green-700 dark:group-hover:text-lime-300 sm:mt-6 sm:text-xl">
                  {name}
                </h3>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {description}
                </p>

                <div className="mt-auto pt-6">
                  <span className="inline-flex items-center rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/40 dark:text-lime-200">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PopularCategories;
