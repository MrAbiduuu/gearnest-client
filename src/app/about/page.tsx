"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Users,
  Leaf,
  Target,
  Eye,
  Search,
  CalendarCheck,
  Truck,
  Wrench,
  Lightbulb,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust & Reliability",
    description:
      "We believe every rental should be transparent, secure, and dependable. We aim to make every interaction trustworthy.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "We connect equipment owners with people who need the right tools, helping both sides create more opportunities.",
  },
  {
    icon: Leaf,
    title: "Smarter Resource Sharing",
    description:
      "We encourage equipment sharing to make better use of existing resources and reduce unnecessary purchases.",
  },
  {
    icon: Lightbulb,
    title: "Simple Experiences",
    description:
      "From discovering equipment to arranging a rental, we focus on making the entire process straightforward.",
  },
];

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover Equipment",
    description:
      "Explore a wide range of equipment and find the right solution for your project, business, or personal needs.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Book with Confidence",
    description:
      "Review equipment details, check availability, and arrange your rental through a simple booking experience.",
  },
  {
    number: "03",
    icon: Truck,
    title: "Get Ready to Work",
    description:
      "Coordinate the rental and get the equipment you need to bring your next project to life.",
  },
];

const highlights = [
  "Easy equipment discovery",
  "Transparent rental information",
  "A convenient booking experience",
  "Connections between owners and renters",
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function AboutPage() {
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroImageY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? ["0%", "0%"] : ["0%", "14%"],
  );

  const heroImageScale = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [1, 1] : [1, 1.12],
  );

  const fadeUp = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 35,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.75,
        ease,
      },
    },
  };

  const stagger = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.14,
      },
    },
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* ================= HERO SECTION ================= */}
      <section
        ref={heroRef}
        className="relative bg-background px-5 pb-20 pt-16 sm:px-8 lg:px-12 lg:pb-28 lg:pt-24"
      >
        {/* Decorative background */}
        <motion.div
          aria-hidden="true"
          animate={
            shouldReduceMotion
              ? undefined
              : { scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full bg-lime-400/20 blur-[110px]"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          {/* Hero Content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-green-800 dark:border-green-800 dark:bg-green-900/40 dark:text-lime-200"
            >
              <motion.span
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="h-2 w-2 rounded-full bg-green-700 dark:bg-lime-400"
              />
              About GearNest
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="mt-7 max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              The Right Equipment.
              <motion.span
                initial={shouldReduceMotion ? false : { opacity: 0, x: -35 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.9,
                  delay: shouldReduceMotion ? 0 : 0.35,
                  ease,
                }}
                className="mt-2 block text-green-700 dark:text-lime-400"
              >
                A Smarter Way to Rent.
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg"
            >
              At GearNest, we believe accessing the right equipment should be
              simple. We bring equipment owners and renters together through a
              convenient platform built around trust, accessibility, and smarter
              resource sharing.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-4">
              <motion.div
                whileHover={
                  shouldReduceMotion ? undefined : { y: -5, scale: 1.03 }
                }
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              >
                <Link
                  href="/equipments"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-green-900/15 transition hover:bg-[#14532D]"
                >
                  Explore Equipment
                  <ArrowRight size={17} />
                </Link>
              </motion.div>

              <motion.div
                whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-7 py-4 text-sm font-bold text-foreground transition hover:border-green-700 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/40 dark:hover:text-lime-300"
                >
                  Get in Touch
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-border pt-7"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CheckCircle2
                  size={17}
                  className="text-green-700 dark:text-lime-400"
                />
                Convenient Rentals
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CheckCircle2
                  size={17}
                  className="text-green-700 dark:text-lime-400"
                />
                Trusted Connections
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, scale: 0.88, x: 50, rotate: 2 }
            }
            animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 1.1,
              delay: shouldReduceMotion ? 0 : 0.2,
              ease,
            }}
            className="relative"
          >
            <motion.div
              aria-hidden="true"
              animate={shouldReduceMotion ? undefined : { rotate: 360 }}
              transition={{
                duration: 35,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -right-8 -top-8 h-52 w-52 rounded-full border border-dashed border-lime-500/30"
            />

            <div className="absolute -right-8 -top-8 h-52 w-52 rounded-full bg-lime-300/25 blur-3xl dark:bg-lime-500/10" />

            <motion.div
              style={{
                y: heroImageY,
                scale: heroImageScale,
              }}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.035 }}
              className="relative h-97.5 overflow-hidden rounded-4xl border-8 border-background shadow-2xl shadow-green-900/10 sm:h-125"
            >
              <Image
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=85"
                alt="Professional equipment and machinery workspace"
                fill
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-transparent" />

              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.7,
                  delay: shouldReduceMotion ? 0 : 0.9,
                }}
                className="absolute bottom-7 left-7 right-7"
              >
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
                  Built for every project
                </span>

                <h2 className="mt-2 max-w-sm text-3xl font-bold leading-tight text-white">
                  Making equipment access easier.
                </h2>
              </motion.div>
            </motion.div>

            {/* Floating Badge */}
            <motion.div
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: [0, -12, 0],
                      rotate: [0, 1.5, 0],
                    }
              }
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-7 -left-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl sm:-left-9"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
                <Wrench size={24} />
              </div>

              <div>
                <p className="text-sm font-bold text-foreground">
                  Rent. Use. Return.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  A smarter rental experience
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= WHO WE ARE ================= */}
      <section className="border-t border-border bg-card px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          {/* Image Collage */}
          <div className="relative grid grid-cols-2 gap-4">
            <motion.div
              initial={
                shouldReduceMotion ? false : { opacity: 0, x: -70, rotate: -5 }
              }
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.9,
                ease,
              }}
              whileHover={shouldReduceMotion ? undefined : { y: -8 }}
              className="relative mt-10 h-64 overflow-hidden rounded-2xl shadow-xl sm:h-80"
            >
              <Image
                src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=85"
                alt="Construction equipment at work"
                fill
                unoptimized
                sizes="(max-width: 1024px) 45vw, 25vw"
                className="object-cover transition-transform duration-700 hover:scale-110"
              />
            </motion.div>

            <motion.div
              initial={
                shouldReduceMotion ? false : { opacity: 0, x: 70, rotate: 5 }
              }
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.9,
                delay: shouldReduceMotion ? 0 : 0.15,
                ease,
              }}
              whileHover={shouldReduceMotion ? undefined : { y: -8 }}
              className="relative h-64 overflow-hidden rounded-2xl shadow-xl sm:h-80"
            >
              <Image
                src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&q=85"
                alt="Professional working with machinery"
                fill
                unoptimized
                sizes="(max-width: 1024px) 45vw, 25vw"
                className="object-cover transition-transform duration-700 hover:scale-110"
              />
            </motion.div>

            <motion.div
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 25, scale: 0.8 }
              }
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.7,
                delay: shouldReduceMotion ? 0 : 0.4,
                ease,
              }}
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-xl border border-border bg-background px-6 py-4 text-center shadow-lg"
            >
              <p className="text-sm font-extrabold text-green-700 dark:text-lime-400">
                GearNest
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your equipment rental partner
              </p>
            </motion.div>
          </div>

          {/* About Content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.span
              variants={fadeUp}
              className="text-xs font-bold uppercase tracking-[0.2em] text-green-700 dark:text-lime-400"
            >
              Who We Are
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            >
              More Than a Rental Platform.
              <span className="block text-green-700 dark:text-lime-400">
                A Better Way Forward.
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-base leading-8 text-muted-foreground"
            >
              GearNest is an equipment rental platform designed to make
              equipment more accessible to individuals, professionals, and
              businesses.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-4 text-base leading-8 text-muted-foreground"
            >
              Instead of purchasing expensive equipment for occasional use,
              renters can discover available equipment from owners. At the same
              time, equipment owners can make their resources available to
              people who need them.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-4 text-base leading-8 text-muted-foreground"
            >
              Our goal is to create a more connected rental experience where
              finding, booking, and managing equipment feels easier.
            </motion.p>

            <motion.div variants={stagger} className="mt-8 space-y-4">
              {highlights.map((item, index) => (
                <motion.div
                  key={item}
                  variants={fadeUp}
                  whileHover={shouldReduceMotion ? undefined : { x: 7 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    initial={shouldReduceMotion ? false : { scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      stiffness: 250,
                      delay: shouldReduceMotion ? 0 : index * 0.12,
                    }}
                  >
                    <CheckCircle2
                      size={19}
                      className="shrink-0 text-green-700 dark:text-lime-400"
                    />
                  </motion.div>

                  <span className="text-sm font-semibold text-foreground/80">
                    {item}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= MISSION AND VISION ================= */}
      <section className="relative overflow-hidden bg-[#166534] px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-24">
        {/* Animated Background Orbs */}
        <motion.div
          aria-hidden="true"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, 45, 0],
                  y: [0, 35, 0],
                  scale: [1, 1.2, 1],
                }
          }
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-lime-300/15 blur-3xl"
        />

        <motion.div
          aria-hidden="true"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, -35, 0],
                  y: [0, -30, 0],
                }
          }
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-lime-300/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={
              shouldReduceMotion ? false : { opacity: 0, y: 30, scale: 0.95 }
            }
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.8,
              ease,
            }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
              What Drives Us
            </span>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              Our Purpose, Our Direction.
            </h2>

            <p className="mt-5 leading-8 text-green-100">
              Everything we build is guided by one simple idea: make useful
              equipment easier to access.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {/* Mission Card */}
            <motion.div
              initial={
                shouldReduceMotion ? false : { opacity: 0, x: -65, rotateY: -8 }
              }
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.9,
                ease,
              }}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: -9,
                      borderColor: "rgba(190, 242, 100, 0.5)",
                    }
              }
              className="rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur-sm transition-colors sm:p-10"
            >
              <motion.div
                whileHover={
                  shouldReduceMotion ? undefined : { rotate: 360, scale: 1.1 }
                }
                transition={{ duration: 0.7 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#84CC16] text-[#17251C]"
              >
                <Target size={27} />
              </motion.div>

              <h3 className="mt-7 text-2xl font-bold text-white">
                Our Mission
              </h3>

              <p className="mt-4 leading-8 text-green-100">
                To simplify equipment rentals by connecting people who need
                equipment with those who have it, creating a convenient and
                accessible experience for everyone.
              </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={
                shouldReduceMotion ? false : { opacity: 0, x: 65, rotateY: 8 }
              }
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.9,
                delay: shouldReduceMotion ? 0 : 0.15,
                ease,
              }}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: -9,
                      borderColor: "rgba(190, 242, 100, 0.5)",
                    }
              }
              className="rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur-sm transition-colors sm:p-10"
            >
              <motion.div
                whileHover={
                  shouldReduceMotion ? undefined : { rotate: -15, scale: 1.1 }
                }
                transition={{ duration: 0.4 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#84CC16] text-[#17251C]"
              >
                <Eye size={27} />
              </motion.div>

              <h3 className="mt-7 text-2xl font-bold text-white">Our Vision</h3>

              <p className="mt-4 leading-8 text-green-100">
                To build a connected rental ecosystem where equipment sharing
                becomes a practical choice for individuals, professionals, and
                businesses.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-background px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.span
              variants={fadeUp}
              className="text-xs font-bold uppercase tracking-[0.2em] text-green-700 dark:text-lime-400"
            >
              The Process
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
            >
              Equipment Rental, Made Simple.
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-5 leading-8 text-muted-foreground"
            >
              Finding the equipment you need shouldn&apos;t be complicated.
              GearNest brings the essential steps together in one place.
            </motion.p>
          </motion.div>

          <div className="mt-16 grid gap-7 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  initial={
                    shouldReduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 55,
                          scale: 0.94,
                        }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.7,
                    delay: shouldReduceMotion ? 0 : index * 0.18,
                    ease,
                  }}
                  whileHover={
                    shouldReduceMotion ? undefined : { y: -10, scale: 1.02 }
                  }
                  className="group rounded-3xl border border-border bg-card p-8 transition-colors duration-300 hover:border-green-400 hover:shadow-xl hover:shadow-green-900/5 dark:hover:bg-green-950/30"
                >
                  <div className="flex items-center justify-between">
                    <motion.div
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : { rotate: 12, scale: 1.12 }
                      }
                      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100 text-green-700 transition-colors group-hover:bg-[#166534] group-hover:text-white dark:bg-green-900/40 dark:text-lime-300"
                    >
                      <Icon size={26} />
                    </motion.div>

                    <motion.span
                      initial={
                        shouldReduceMotion ? false : { opacity: 0, scale: 1.5 }
                      }
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.6,
                        delay: shouldReduceMotion ? 0 : index * 0.18,
                      }}
                      className="text-4xl font-black text-foreground/10"
                    >
                      {step.number}
                    </motion.span>
                  </div>

                  <h3 className="mt-8 text-xl font-bold text-foreground">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {step.description}
                  </p>

                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "35%" }}
                    viewport={{ once: true }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.7,
                      delay: shouldReduceMotion ? 0 : 0.25 + index * 0.18,
                    }}
                    className="mt-7 h-1 rounded-full bg-lime-500"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= OUR VALUES ================= */}
      <section className="border-t border-border bg-card px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.8,
              ease,
            }}
            className="flex flex-col justify-between gap-6 md:flex-row md:items-end"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-green-700 dark:text-lime-400">
                What Matters to Us
              </span>

              <h2 className="mt-4 max-w-xl text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                The Values Behind Everything We Do.
              </h2>
            </div>

            <p className="max-w-md leading-7 text-muted-foreground">
              We want to build more than a place to rent equipment. We want to
              build an experience people can rely on.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <motion.div
                  key={value.title}
                  initial={
                    shouldReduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 45,
                          rotate: index % 2 === 0 ? -2 : 2,
                        }
                  }
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    rotate: 0,
                  }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.7,
                    delay: shouldReduceMotion ? 0 : index * 0.13,
                    ease,
                  }}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -10,
                          transition: { duration: 0.25 },
                        }
                  }
                  className="group rounded-2xl border border-border bg-background p-7 transition-colors duration-300 hover:border-green-400 hover:shadow-xl hover:shadow-green-900/5 dark:hover:bg-green-950/30"
                >
                  <motion.div
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            rotate: [0, -10, 10, 0],
                            scale: 1.12,
                          }
                    }
                    transition={{ duration: 0.5 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100 text-green-700 transition-colors duration-300 group-hover:bg-[#166534] group-hover:text-white dark:bg-green-900/40 dark:text-lime-300"
                  >
                    <Icon size={23} />
                  </motion.div>

                  <h3 className="mt-6 text-lg font-bold text-foreground">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {value.description}
                  </p>

                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.8,
                      delay: shouldReduceMotion ? 0 : 0.3 + index * 0.13,
                    }}
                    className="mt-6 h-px bg-gradient-to-r from-lime-500/70 to-transparent"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="bg-background px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <motion.div
          initial={
            shouldReduceMotion ? false : { opacity: 0, y: 50, scale: 0.96 }
          }
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.9,
            ease,
          }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-4xl bg-[#166534] px-7 py-14 text-white sm:px-12 sm:py-16 lg:px-16"
        >
          {/* Rotating Decorative Ring */}
          <motion.div
            aria-hidden="true"
            animate={shouldReduceMotion ? undefined : { rotate: 360 }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
            className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border-[45px] border-lime-300/15"
          />

          <motion.div
            aria-hidden="true"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    scale: [1, 1.25, 1],
                    opacity: [0.1, 0.25, 0.1],
                  }
            }
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute -bottom-36 right-40 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl"
          />

          <div className="relative z-10 flex flex-col items-start justify-between gap-9 lg:flex-row lg:items-center">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, x: -35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.8,
                delay: shouldReduceMotion ? 0 : 0.2,
                ease,
              }}
              className="max-w-2xl"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
                Start with GearNest
              </span>

              <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                Your Next Project Deserves the Right Equipment.
              </h2>

              <p className="mt-5 max-w-xl leading-8 text-green-100">
                Discover equipment, explore rental opportunities, and find a
                smarter way to get things done.
              </p>
            </motion.div>

            <motion.div
              initial={
                shouldReduceMotion ? false : { opacity: 0, x: 35, scale: 0.9 }
              }
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.8,
                delay: shouldReduceMotion ? 0 : 0.35,
                ease,
              }}
              whileHover={
                shouldReduceMotion ? undefined : { y: -6, scale: 1.04 }
              }
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            >
              <Link
                href="/equipments"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-7 py-4 text-sm font-extrabold text-[#17251C] transition duration-300 hover:bg-lime-300"
              >
                Explore Equipment
                <motion.span
                  animate={shouldReduceMotion ? undefined : { x: [0, 5, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight size={18} />
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
