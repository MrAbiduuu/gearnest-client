"use client";

import Link from "next/link";
import {
  ShieldCheck,
  BadgeCheck,
  CalendarClock,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Affordable Pricing",
    description:
      "Get the equipment you need at competitive rates without unnecessary expenses.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted Owners",
    description:
      "Rent confidently from verified equipment owners and reliable providers.",
  },
  {
    icon: CalendarClock,
    title: "Flexible Rentals",
    description:
      "Choose rental periods that fit your schedule, project, and budget.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Enjoy a smooth and secure checkout experience for every rental.",
  },
];

const WhyChooseUs = () => {
  const shouldReduceMotion = useReducedMotion();

  const introVariants = {
    hidden: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : -45,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.75,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const cardVariants = {
    hidden: (index: number) => ({
      opacity: 0,
      x: shouldReduceMotion ? 0 : index % 2 === 0 ? -35 : 35,
      y: shouldReduceMotion ? 0 : 15,
    }),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.65,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="bg-background px-6 py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.5fr] lg:items-center lg:gap-16">
          {/* Section Introduction */}
          <motion.div
            variants={introVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-lg"
          >
            <motion.span
              initial={{
                opacity: 0,
                scale: shouldReduceMotion ? 1 : 0.8,
              }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
              className="mb-4 inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-green-800 dark:border-green-800 dark:bg-green-900/40 dark:text-lime-200"
            >
              The GearNest Advantage
            </motion.span>

            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[42px]">
              Why Choose{" "}
              <span className="text-green-700 dark:text-lime-400">
                GearNest?
              </span>
            </h2>

            {/* Accent Line */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "85px" }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.8,
                delay: 0.2,
              }}
              className="mt-5 h-1 rounded-full bg-lime-500"
            />

            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.6,
                delay: 0.25,
              }}
              className="mt-5 text-base leading-8 text-muted-foreground"
            >
              We make equipment rental simple, accessible, and reliable. Whether
              you are working on a project or planning an event, GearNest helps
              you get the right equipment without the hassle.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.6,
                delay: 0.4,
              }}
            >
              <Link
                href="/#how-it-works"
                className="group mt-8 inline-flex items-center gap-3 rounded-lg bg-[#166534] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-green-900/10 transition-all duration-300 hover:-translate-y-1 hover:bg-[#14532D]"
              >
                Discover How It Works
                <ArrowUpRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            </motion.div>
          </motion.div>

          {/* Benefit Cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              staggerChildren: shouldReduceMotion ? 0 : 0.15,
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <motion.div
                  key={benefit.title}
                  custom={index}
                  variants={cardVariants}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -6,
                          transition: {
                            type: "spring",
                            stiffness: 280,
                            damping: 20,
                          },
                        }
                  }
                  className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors duration-300 hover:border-green-400 hover:shadow-lg hover:shadow-green-900/5 sm:p-7"
                >
                  <motion.div
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : { rotate: 12, scale: 1.1 }
                    }
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFCCB] text-[#166534] transition-colors duration-300 group-hover:bg-[#166534] group-hover:text-white dark:bg-green-900/40 dark:text-lime-300"
                  >
                    <Icon size={23} strokeWidth={1.8} />
                  </motion.div>

                  <div className="mt-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">
                      {benefit.title}
                    </h3>

                    <span className="text-xs font-semibold text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
