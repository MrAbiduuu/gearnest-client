"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Search,
  Compass,
  Wrench,
} from "lucide-react";

export default function NotFound() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-background px-5 py-16">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, -20, 0], x: [0, 12, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl"
        />

        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, 25, 0], x: [0, -15, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl"
        />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        transition={{
          staggerChildren: shouldReduceMotion ? 0 : 0.12,
        }}
        className="relative z-10 mx-auto w-full max-w-2xl text-center"
      >
        {/* Icon Illustration */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center"
        >
          <div className="absolute inset-0 rounded-full border border-orange-500/20" />

          <motion.div
            animate={shouldReduceMotion ? {} : { rotate: 360 }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-2 rounded-full border border-dashed border-orange-500/30"
          />

          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-orange-500/20 bg-orange-500/10 text-orange-600 shadow-xl shadow-orange-500/5">
            <Wrench size={38} strokeWidth={1.5} />
          </div>

          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, -7, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-1 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-orange-600 shadow-md"
          >
            <Search size={17} />
          </motion.div>
        </motion.div>

        {/* 404 Text */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mb-3"
        >
          <span className="text-sm font-bold tracking-[0.3em] text-orange-600">
            ERROR 404
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-7xl font-black tracking-tight text-foreground sm:text-8xl md:text-9xl"
        >
          4<span className="text-orange-600">0</span>4
        </motion.h1>

        <motion.h2
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          Oops! Page Not Found
        </motion.h2>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base"
        >
          Looks like this equipment has gone missing! The page you&apos;re
          looking for doesn&apos;t exist, may have been moved, or is temporarily
          unavailable.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-orange-700 hover:shadow-orange-600/30 sm:w-auto"
          >
            <Home size={17} />
            Back to Homepage
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:bg-orange-500/5 sm:w-auto"
          >
            <ArrowLeft size={17} />
            Go Back
          </button>
        </motion.div>

        {/* Bottom Information */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <Compass size={15} className="text-orange-600" />
          <span>Lost your way? Let&apos;s get you back to GearNest.</span>
        </motion.div>
      </motion.div>
    </main>
  );
}
