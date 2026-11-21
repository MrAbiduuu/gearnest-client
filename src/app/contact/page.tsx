"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  MessageCircle,
  Headphones,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  ShieldCheck,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

const contactOptions = [
  {
    icon: Mail,
    title: "Email Support",
    description:
      "Have a question? Send us a message and we'll be happy to help.",
    action: "Send an email",
    href: "mailto:your-email@example.com",
  },
  {
    icon: MessageCircle,
    title: "General Enquiries",
    description:
      "Questions about GearNest, rentals, or how our platform works?",
    action: "Contact our team",
    href: "mailto:your-email@example.com",
  },
  {
    icon: Headphones,
    title: "Customer Assistance",
    description: "Need help with a booking, payment, or equipment listing?",
    action: "Get assistance",
    href: "mailto:your-email@example.com",
  },
];

const faqs = [
  {
    question: "How can I rent equipment through GearNest?",
    answer:
      "Browse available equipment, open a listing to review its details, and follow the booking process to request a rental.",
  },
  {
    question: "How can I list my equipment?",
    answer:
      "Create an owner account, visit your owner dashboard, and use the Add Equipment section to publish your equipment listing.",
  },
  {
    question: "Can I modify or cancel a booking?",
    answer:
      "Booking changes depend on the booking status and applicable rental terms. Check your booking details or contact our support team.",
  },
  {
    question: "How do I report an issue?",
    answer:
      "Send us a message using the contact form with your account and booking details so our team can understand the issue.",
  },
];

const contactDetails = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Reach us through your registered support email.",
  },
  {
    icon: Clock,
    title: "Support Requests",
    description:
      "Include relevant booking or equipment information to help us understand your request.",
  },
  {
    icon: MapPin,
    title: "Our Platform",
    description: "Connecting equipment owners and renters through GearNest.",
  },
];

export default function ContactPage() {
  const shouldReduceMotion = useReducedMotion();

  const reveal = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 35,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.8,
        ease,
      },
    },
  };

  const stagger = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.13,
      },
    },
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* HERO */}
      <section className="relative px-5 pb-20 pt-16 sm:px-8 lg:px-12 lg:pb-28 lg:pt-24">
        {/* Decorative background */}
        <motion.div
          aria-hidden="true"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  scale: [1, 1.15, 1],
                  opacity: [0.35, 0.55, 0.35],
                }
          }
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-lime-300/20 blur-[100px] dark:bg-lime-500/10"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          {/* Hero content */}
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div
              variants={reveal}
              className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-green-800 dark:border-green-800 dark:bg-green-900/40 dark:text-lime-200"
            >
              <motion.span
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.55, 1],
                      }
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="h-2 w-2 rounded-full bg-green-700 dark:bg-lime-400"
              />
              Contact GearNest
            </motion.div>

            <motion.h1
              variants={reveal}
              className="mt-7 max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Let&apos;s Talk About
              <motion.span
                initial={{
                  opacity: 0,
                  x: shouldReduceMotion ? 0 : -25,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: shouldReduceMotion ? 0 : 0.45,
                  duration: shouldReduceMotion ? 0 : 0.8,
                  ease,
                }}
                className="block text-green-700 dark:text-lime-400"
              >
                Your Next Project.
              </motion.span>
            </motion.h1>

            <motion.p
              variants={reveal}
              className="mt-7 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg"
            >
              Whether you need help finding equipment, managing a rental, or
              listing your own machinery, we&apos;re here to make your GearNest
              experience easier.
            </motion.p>

            <motion.div variants={reveal} className="mt-9 flex flex-wrap gap-4">
              <motion.a
                href="#contact-form"
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -5,
                        scale: 1.025,
                      }
                }
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-green-900/15 transition-colors hover:bg-[#14532D]"
              >
                Send Us a Message
                <motion.span
                  animate={shouldReduceMotion ? undefined : { x: [0, 4, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <ArrowRight size={17} />
                </motion.span>
              </motion.a>

              <motion.div
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
              >
                <Link
                  href="/equipments"
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-7 py-4 text-sm font-bold text-foreground transition duration-300 hover:border-green-700 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/40 dark:hover:text-lime-300"
                >
                  Browse Equipment
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              variants={reveal}
              className="mt-10 flex items-center gap-3 border-t border-border pt-7"
            >
              <motion.div
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        rotate: 12,
                        scale: 1.1,
                      }
                }
                className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300"
              >
                <ShieldCheck size={21} />
              </motion.div>

              <div>
                <p className="text-sm font-bold text-foreground">
                  We&apos;re here to help.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your questions and feedback matter to us.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{
              opacity: 0,
              scale: shouldReduceMotion ? 1 : 0.88,
              x: shouldReduceMotion ? 0 : 45,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 1.1,
              delay: shouldReduceMotion ? 0 : 0.2,
              ease,
            }}
            className="relative"
          >
            <motion.div
              aria-hidden="true"
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      rotate: 360,
                    }
              }
              transition={{
                duration: 35,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-dashed border-lime-500/40"
            />

            <motion.div
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: [0, -10, 0],
                    }
              }
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative h-[390px] overflow-hidden rounded-[2rem] border-[8px] border-background shadow-2xl shadow-green-900/10 sm:h-[480px]"
            >
              <motion.div
                className="absolute inset-0"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.06 }}
                transition={{ duration: 0.8, ease }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=85"
                  alt="Team members communicating and working together"
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>

              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />

              <motion.div
                initial={{
                  opacity: 0,
                  y: shouldReduceMotion ? 0 : 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: shouldReduceMotion ? 0 : 0.8,
                  duration: shouldReduceMotion ? 0 : 0.7,
                  ease,
                }}
                className="absolute bottom-8 left-8 right-8"
              >
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
                  We&apos;re listening
                </span>
                <h2 className="mt-3 max-w-sm text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Every great connection starts with a conversation.
                </h2>
              </motion.div>
            </motion.div>

            {/* Floating support badge */}
            <motion.div
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: [0, -9, 0],
                      rotate: [0, 1.5, 0],
                    }
              }
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-6 -left-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl sm:-left-8"
            >
              <motion.div
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        rotate: [0, -8, 8, 0],
                      }
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300"
              >
                <MessageCircle size={24} />
              </motion.div>

              <div>
                <p className="text-sm font-bold text-foreground">
                  Let&apos;s Connect
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  GearNest Support
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CONTACT OPTIONS */}
      <section className="border-t border-border bg-card px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.span
              variants={reveal}
              className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-green-700 dark:text-lime-400"
            >
              Get in Touch
            </motion.span>

            <motion.h2
              variants={reveal}
              className="mt-4 text-3xl font-extrabold text-foreground sm:text-4xl"
            >
              How Can We Help You?
            </motion.h2>

            <motion.p
              variants={reveal}
              className="mt-4 leading-7 text-muted-foreground"
            >
              Choose the type of assistance you need and get in touch with our
              team.
            </motion.p>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {contactOptions.map((option, index) => {
              const Icon = option.icon;

              return (
                <motion.div
                  key={option.title}
                  initial={{
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 45,
                    rotateX: shouldReduceMotion ? 0 : 10,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                  }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.75,
                    delay: shouldReduceMotion ? 0 : index * 0.16,
                    ease,
                  }}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -10,
                          rotateY: 3,
                          scale: 1.015,
                        }
                  }
                  className="group rounded-3xl border border-border bg-background p-7 transition-colors duration-300 hover:border-green-400 hover:shadow-2xl hover:shadow-green-900/10 dark:hover:bg-green-950/30"
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
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100 text-green-700 transition-colors group-hover:bg-[#166534] group-hover:text-white dark:bg-green-900/40 dark:text-lime-300"
                  >
                    <Icon size={26} />
                  </motion.div>

                  <h3 className="mt-7 text-xl font-bold text-foreground">
                    {option.title}
                  </h3>

                  <p className="mt-3 min-h-14 text-sm leading-7 text-muted-foreground">
                    {option.description}
                  </p>

                  <a
                    href={option.href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-green-700 transition-all hover:gap-3 dark:text-lime-400"
                  >
                    {option.action}
                    <ArrowUpRight size={16} />
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section
        id="contact-form"
        className="relative bg-background px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
      >
        <motion.div
          aria-hidden="true"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }
          }
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-lime-300/20 blur-[110px] dark:bg-lime-500/10"
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          {/* LEFT INFORMATION */}
          <motion.div
            initial={{
              opacity: 0,
              x: shouldReduceMotion ? 0 : -55,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.9,
              ease,
            }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-green-700 dark:text-lime-400">
              Send a Message
            </span>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              We&apos;d Love to Hear From You.
            </h2>

            <p className="mt-5 max-w-md leading-8 text-muted-foreground">
              Tell us what&apos;s on your mind. Whether it&apos;s a question,
              suggestion, or an issue, send us a message and we&apos;ll get back
              to you.
            </p>

            <div className="mt-10 space-y-7">
              {contactDetails.map((detail, index) => {
                const Icon = detail.icon;

                return (
                  <motion.div
                    key={detail.title}
                    initial={{
                      opacity: 0,
                      x: shouldReduceMotion ? 0 : -25,
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.6,
                      delay: shouldReduceMotion ? 0 : index * 0.12,
                      ease,
                    }}
                    className="group flex items-start gap-4"
                  >
                    <motion.div
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : {
                              rotate: 10,
                              scale: 1.1,
                            }
                      }
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-green-700 transition-colors group-hover:bg-green-700 group-hover:text-white dark:bg-green-900/40 dark:text-lime-300"
                    >
                      <Icon size={22} />
                    </motion.div>

                    <div>
                      <h3 className="font-bold text-foreground">
                        {detail.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {detail.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : 25,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.8,
                delay: 0.2,
                ease,
              }}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.025 }}
              className="relative mt-10 h-52 overflow-hidden rounded-2xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&q=85"
                alt="Modern professional workspace"
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 35vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <p className="absolute bottom-5 left-5 text-sm font-bold text-white">
                Better connections. Better experiences.
              </p>
            </motion.div>
          </motion.div>

          {/* FORM */}
          <motion.div
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 55,
              scale: shouldReduceMotion ? 1 : 0.96,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.9,
              ease,
            }}
            className="relative"
          >
            {/* Animated accent border */}
            <motion.div
              aria-hidden="true"
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      opacity: [0.25, 0.7, 0.25],
                    }
              }
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -inset-px rounded-3xl bg-linear-to-br from-lime-400/50 via-transparent to-green-700/30 blur-sm"
            />

            <div className="relative rounded-3xl border border-border bg-card p-6 shadow-xl shadow-green-900/5 sm:p-9">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground">
                  Send Us a Message
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fill in the details below to get in touch.
                </p>
              </div>

              <form action="#" method="post" className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      className="mb-2 block text-sm font-semibold text-foreground"
                      htmlFor="firstName"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      placeholder="Enter your first name"
                      className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition duration-300 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/15"
                    />
                  </div>

                  <div>
                    <label
                      className="mb-2 block text-sm font-semibold text-foreground"
                      htmlFor="lastName"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      placeholder="Enter your last name"
                      className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition duration-300 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/15"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-foreground"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition duration-300 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/15"
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-foreground"
                    htmlFor="subject"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    defaultValue=""
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground transition duration-300 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/15"
                  >
                    <option value="" disabled>
                      Select a subject
                    </option>
                    <option value="general">General Enquiry</option>
                    <option value="booking">Booking Assistance</option>
                    <option value="payment">Payment Issue</option>
                    <option value="equipment">Equipment Listing</option>
                    <option value="technical">Technical Support</option>
                    <option value="feedback">Feedback &amp; Suggestions</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-foreground"
                    htmlFor="message"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    placeholder="Tell us how we can help you..."
                    className="min-h-36 w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground transition duration-300 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/15"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -4,
                          scale: 1.01,
                        }
                  }
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#166534] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-green-900/15 transition-colors hover:bg-[#14532D]"
                >
                  Send Message
                  <motion.span
                    whileHover={
                      shouldReduceMotion ? undefined : { x: 4, y: -3 }
                    }
                  >
                    <Send size={17} />
                  </motion.span>
                </motion.button>

                <p className="text-center text-xs leading-6 text-muted-foreground">
                  By submitting this form, you agree that GearNest may use your
                  information to respond to your enquiry.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-card px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{
              opacity: 0,
              scale: shouldReduceMotion ? 1 : 0.9,
              y: shouldReduceMotion ? 0 : 25,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            viewport={{ once: true }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.7,
              ease,
            }}
            className="text-center"
          >
            <motion.div
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      rotate: 12,
                      scale: 1.1,
                    }
              }
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300"
            >
              <HelpCircle size={27} />
            </motion.div>

            <h2 className="mt-5 text-3xl font-extrabold text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>

            <p className="mt-4 text-muted-foreground">
              Quick answers to some common questions about GearNest.
            </p>
          </motion.div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => (
              <motion.details
                key={faq.question}
                name="contact-faq"
                open={index === 0}
                initial={{
                  opacity: 0,
                  x: shouldReduceMotion ? 0 : index % 2 === 0 ? -25 : 25,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.65,
                  delay: shouldReduceMotion ? 0 : index * 0.1,
                  ease,
                }}
                className="group rounded-2xl border border-border bg-background transition-colors duration-300 open:border-green-400 open:shadow-lg open:shadow-green-900/5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-foreground marker:hidden sm:text-base [&::-webkit-details-marker]:hidden">
                  {faq.question}

                  <motion.span
                    whileHover={shouldReduceMotion ? undefined : { rotate: 90 }}
                    className="shrink-0 text-green-700 transition-transform group-open:rotate-45 dark:text-lime-400"
                  >
                    <Plus size={18} />
                  </motion.span>
                </summary>

                <motion.div
                  initial={false}
                  className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-open:grid-rows-[1fr]"
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-7 text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bg-background px-5 py-20 sm:px-8 lg:px-12">
        <motion.div
          initial={{
            opacity: 0,
            y: shouldReduceMotion ? 0 : 45,
            scale: shouldReduceMotion ? 1 : 0.97,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.9,
            ease,
          }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#166534] px-7 py-14 text-white sm:px-12 lg:px-16"
        >
          {/* Rotating decorative ring */}
          <motion.div
            aria-hidden="true"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    rotate: 360,
                  }
            }
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -right-16 -top-28 h-80 w-80 rounded-full border-[45px] border-lime-300/15"
          />

          <motion.div
            aria-hidden="true"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    scale: [1, 1.25, 1],
                    opacity: [0.35, 0.7, 0.35],
                  }
            }
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-32 right-40 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl"
          />

          <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <motion.div
              initial={{
                opacity: 0,
                x: shouldReduceMotion ? 0 : -35,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.8,
                delay: 0.15,
                ease,
              }}
              className="max-w-2xl"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
                Explore GearNest
              </span>

              <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
                Have a Project in Mind?
                <span className="block text-lime-300">
                  Find the Right Equipment.
                </span>
              </h2>

              <p className="mt-5 leading-8 text-green-100">
                Explore equipment listings and discover a smarter way to rent
                what you need.
              </p>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: shouldReduceMotion ? 0 : 35,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.8,
                delay: 0.3,
                ease,
              }}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: -6,
                      scale: 1.04,
                    }
              }
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/equipments"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#84CC16] px-7 py-4 text-sm font-bold text-[#17251C] transition-colors duration-300 hover:bg-lime-300"
              >
                Explore Equipment
                <motion.span
                  animate={shouldReduceMotion ? undefined : { x: [0, 5, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
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
