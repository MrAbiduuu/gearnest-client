"use client";

import FavoriteButton from "@/components/favorites/FavoriteButton";
import { useSession } from "@/lib/auth-client";
import { Equipment, fetchEquipments } from "@/lib/equipment";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Package,
  RefreshCw,
  ShieldCheck,
  Star,
} from "lucide-react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const FEATURED_LIMIT = 6;

const FeaturedEquipments = () => {
  const [items, setItems] = useState<Equipment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);

  const { data: session, isPending: isSessionPending } = useSession();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);

      try {
        const data = await fetchEquipments(controller.signal, {
          limit: FEATURED_LIMIT,
        });
        setItems(data);
        setError(null);
      } catch (caught) {
        if (controller.signal.aborted) return;

        setError(
          caught instanceof Error
            ? caught.message
            : "Something went wrong while loading equipment.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void load();

    return () => controller.abort();
  }, [reloadCount]);

  const featuredItems = items;

  const detailsHref = (equipmentId: string) => {
    const detailsPath = `/equipment/${equipmentId}`;

    return session?.user
      ? detailsPath
      : `/signin?callbackUrl=${encodeURIComponent(detailsPath)}`;
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(price);

  const headingVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 25,
      filter: shouldReduceMotion ? "blur(0px)" : "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: shouldReduceMotion ? 0 : 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 35,
      rotateX: shouldReduceMotion ? 0 : 8,
      scale: shouldReduceMotion ? 1 : 0.96,
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.7,
        delay: shouldReduceMotion ? 0 : index * 0.13,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <section className="border-t border-border/60 bg-muted/20 py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Section Heading */}
        <motion.div
          className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Curated For You
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Featured Equipment
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
              Discover reliable equipment for your next project. Find the right
              tools, compare options, and rent with confidence.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase sm:inline-flex">
              06 picks
            </span>
            <Link
              href="/equipment"
              className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Explore All Equipment
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: FEATURED_LIMIT }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-border/70 bg-card"
              >
                <div className="aspect-16/11 animate-pulse bg-muted" />
                <div className="space-y-4 p-6">
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="h-9 w-full animate-pulse rounded-full bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card px-5 py-16 text-center">
            <Package size={35} className="mb-4 text-muted-foreground" />

            <h3 className="text-lg font-semibold text-foreground">
              Unable to load equipment
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">{error}</p>

            <button
              onClick={() => setReloadCount((prev) => prev + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && featuredItems.length === 0 && (
          <div className="rounded-3xl border border-border bg-card py-16 text-center">
            <Package size={38} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">
              No equipment available
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              New equipment will appear here soon.
            </p>
          </div>
        )}

        {/* Equipment Cards */}
        {!loading && !error && featuredItems.length > 0 && (
          <div
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
            style={{ perspective: "1200px" }}
          >
            {featuredItems.map((equipment, index) => (
              <motion.article
                key={equipment._id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -8,
                        rotateY: 1.5,
                        transition: {
                          type: "spring",
                          stiffness: 250,
                          damping: 20,
                        },
                      }
                }
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_18px_45px_-32px_rgba(15,23,42,0.55)]"
              >
                <span className="absolute inset-x-8 top-0 h-0.5 rounded-full bg-linear-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Equipment Image */}
                <div className="relative aspect-16/11 overflow-hidden bg-muted">
                  <motion.div
                    className="h-full w-full"
                    initial={
                      shouldReduceMotion ? false : { scale: 1.12, opacity: 0.7 }
                    }
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 1,
                      ease: "easeOut",
                    }}
                  >
                    <Image
                      width={100}
                      height={100}
                      src={equipment.image || "/placeholder.svg"}
                      alt={equipment.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </motion.div>

                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />

                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-slate-800 uppercase shadow-sm backdrop-blur-md dark:bg-slate-900/85 dark:text-slate-100">
                    {equipment.category}
                  </span>

                  <FavoriteButton
                    equipment={equipment}
                    className="top-auto bottom-4 left-4"
                  />

                  <span
                    className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] uppercase shadow-sm backdrop-blur-md ${
                      equipment.availableStock > 0
                        ? "bg-emerald-500/90 text-white"
                        : "bg-rose-500/90 text-white"
                    }`}
                  >
                    {equipment.availableStock > 0 ? "Available" : "Unavailable"}
                  </span>
                </div>

                {/* Equipment Information */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                      No. {String(index + 1).padStart(2, "0")} ·{" "}
                      {equipment.brand || "GearNest"}
                    </span>

                    {equipment.owner?.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                        <ShieldCheck size={12} />
                        Verified
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 line-clamp-1 text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {equipment.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-muted-foreground">
                    {equipment.shortDescription}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-y border-border/70 py-4">
                    <span className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Star size={14} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[9px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                          Condition
                        </span>
                        <span className="block truncate text-xs font-semibold text-foreground">
                          {equipment.condition}
                        </span>
                      </span>
                    </span>

                    <span className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Package size={14} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[9px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                          Stock
                        </span>
                        <span className="block truncate text-xs font-semibold text-foreground">
                          {equipment.availableStock} units
                        </span>
                      </span>
                    </span>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-4 pt-5">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                        Rental from
                      </p>
                      <p className="mt-1 truncate text-2xl font-extrabold tracking-tight text-foreground">
                        {formatPrice(equipment.rentalRate)}
                        <span className="ml-1 text-xs font-medium text-muted-foreground">
                          / {equipment.rentalPeriod}
                        </span>
                      </p>
                    </div>

                    {isSessionPending ? (
                      <span className="inline-flex shrink-0 cursor-wait items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary opacity-60">
                        View Details
                        <ArrowRight size={14} />
                      </span>
                    ) : (
                      <Link
                        href={detailsHref(equipment._id)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        View Details
                        <ArrowRight
                          size={14}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEquipments;
