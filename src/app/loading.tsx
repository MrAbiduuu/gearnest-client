"use client";

import Image from "next/image";
import { HardHat } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const ORBIT_DOTS = [
  { left: "50%", top: "3%", className: "bg-accent" },
  { left: "97%", top: "50%", className: "bg-orange-500" },
  { left: "50%", top: "97%", className: "bg-primary" },
] as const;

type ShimmerBlockProps = {
  className: string;
  reduceMotion: boolean;
};

const ShimmerBlock = ({ className, reduceMotion }: ShimmerBlockProps) => (
  <div
    aria-hidden="true"
    className={`relative overflow-hidden bg-muted ${className}`}
  >
    <motion.div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent 0%, var(--secondary) 50%, transparent 100%)",
      }}
      animate={reduceMotion ? undefined : { x: ["-100%", "100%"] }}
      transition={{ duration: 1.7, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const Loading = () => {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] w-full items-center justify-center overflow-hidden bg-background px-4 py-10 sm:min-h-[calc(100svh-5rem)] sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(132, 204, 22, 0.14), transparent 55%)",
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(163, 230, 53, 0.10), transparent 55%)",
          }}
        />
        <div className="absolute -top-24 right-[-10%] size-72 rounded-full bg-orange-300/20 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute -bottom-28 left-[-10%] size-80 rounded-full bg-lime-300/25 blur-3xl dark:bg-lime-500/10" />
        <motion.div
          className="absolute top-1/4 left-[18%] size-2 rounded-full bg-primary/40"
          animate={
            reduceMotion
              ? undefined
              : { y: [0, -14, 0], opacity: [0.35, 0.7, 0.35] }
          }
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        role="status"
        aria-label="GearNest is loading your experience"
        aria-live="polite"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.5,
          ease: [0.22, 1, 0.36, 1] as const,
        }}
        className="flex w-full max-w-md flex-col items-center text-center"
      >
        <div className="relative flex size-36 items-center justify-center sm:size-44">
          <motion.div
            aria-hidden="true"
            className="absolute inset-4 rounded-full bg-primary/10 blur-2xl dark:bg-accent/10"
            animate={
              reduceMotion
                ? undefined
                : { scale: [0.9, 1.1, 0.9], opacity: [0.45, 0.8, 0.45] }
            }
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-full p-[3px]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, var(--primary) 80deg, var(--accent) 165deg, transparent 235deg, transparent 360deg)",
            }}
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
          >
            <div className="size-full rounded-full bg-background" />
          </motion.div>

          <div
            aria-hidden="true"
            className="absolute inset-2 rounded-full border border-border/80"
          />

          <motion.div
            initial={reduceMotion ? false : { scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: reduceMotion ? 0 : 0.55,
              delay: reduceMotion ? 0 : 0.05,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="relative z-10 flex size-24 items-center justify-center rounded-full border border-border bg-card shadow-[0_18px_45px_-24px_rgba(22,101,52,0.6)] dark:shadow-[0_18px_45px_-24px_rgba(163,230,53,0.3)] sm:size-32"
          >
            <Image
              src="/GearNestLogo.png"
              alt="GearNest"
              width={120}
              height={40}
              priority
              className="h-auto w-16 object-contain sm:w-20"
            />

            <motion.span
              aria-hidden="true"
              className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md"
              animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <HardHat className="size-4" />
            </motion.span>
          </motion.div>

          {ORBIT_DOTS.map((dot, index) => (
            <div
              key={dot.left + dot.top}
              aria-hidden="true"
              className="absolute z-20"
              style={{
                left: dot.left,
                top: dot.top,
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.span
                className={`block size-2 rounded-full shadow-[0_0_0_4px_rgba(132,204,22,0.12)] ${dot.className}`}
                animate={
                  reduceMotion
                    ? undefined
                    : { scale: [0.8, 1.25, 0.8], opacity: [0.35, 1, 0.35] }
                }
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.22,
                  ease: "easeInOut",
                }}
              />
            </div>
          ))}
        </div>

        <h1 className="mt-8 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          Preparing Your GearNest Experience
        </h1>

        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-muted-foreground">
          <span>Getting everything ready for you...</span>
          <span aria-hidden="true" className="inline-flex items-center gap-1">
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                className="size-1.5 rounded-full bg-primary dark:bg-accent"
                animate={
                  reduceMotion
                    ? undefined
                    : { opacity: [0.25, 1, 0.25], y: [0, -3, 0] }
                }
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  delay: index * 0.18,
                  ease: "easeInOut",
                }}
              />
            ))}
          </span>
        </p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.5,
            delay: reduceMotion ? 0 : 0.18,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="mt-8 w-full max-w-sm rounded-lg border border-[#e8ded0] bg-card/90 p-3.5 shadow-[0_16px_40px_-30px_rgba(74,48,32,0.8)] dark:border-green-900/60 dark:bg-card/80"
        >
          <div className="flex gap-3">
            <ShimmerBlock
              className="size-20 shrink-0 rounded-xl sm:size-24"
              reduceMotion={reduceMotion}
            />

            <div className="flex min-w-0 flex-1 flex-col gap-2.5 py-0.5">
              <ShimmerBlock
                className="h-3 w-16 rounded-full"
                reduceMotion={reduceMotion}
              />
              <ShimmerBlock
                className="h-4 w-4/5 rounded-md"
                reduceMotion={reduceMotion}
              />
              <ShimmerBlock
                className="h-3 w-2/3 rounded-md"
                reduceMotion={reduceMotion}
              />

              <div className="mt-auto flex items-end justify-between gap-3">
                <ShimmerBlock
                  className="h-5 w-14 rounded-md"
                  reduceMotion={reduceMotion}
                />
                <ShimmerBlock
                  className="h-8 w-20 rounded-md"
                  reduceMotion={reduceMotion}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Loading;
