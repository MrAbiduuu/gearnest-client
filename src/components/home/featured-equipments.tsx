"use client";

import FavoriteButton from "@/components/favorites/FavoriteButton";
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

const FeaturedEquipments = () => {
  const [items, setItems] = useState<Equipment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);

      try {
        const data = await fetchEquipments(controller.signal);
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

  const featuredItems = items.slice(0, 4);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Section Heading */}
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Explore Our Collection
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

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="aspect-4/3 animate-pulse bg-muted" />
                <div className="space-y-4 p-5">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="h-10 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-5 py-16 text-center">
            <Package size={35} className="mb-4 text-muted-foreground" />

            <h3 className="text-lg font-semibold text-foreground">
              Unable to load equipment
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">{error}</p>

            <button
              onClick={() => setReloadCount((prev) => prev + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && featuredItems.length === 0 && (
          <div className="rounded-2xl border border-border bg-card py-16 text-center">
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredItems.map((equipment) => (
              <article
                key={equipment._id}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Equipment Image */}
                <div className="relative aspect-4/3 overflow-hidden bg-muted">
                  <Image
                    width={100}
                    height={100}
                    src={equipment.image || "/placeholder.svg"}
                    alt={equipment.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md">
                    {equipment.category}
                  </span>

                  <FavoriteButton
                    equipment={equipment}
                    className="top-auto bottom-3"
                  />

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-md ${
                      equipment.availableStock > 0
                        ? "bg-green-500/90 text-white"
                        : "bg-red-500/90 text-white"
                    }`}
                  >
                    {equipment.availableStock > 0 ? "Available" : "Unavailable"}
                  </span>
                </div>

                {/* Equipment Information */}
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {equipment.brand}
                    </span>

                    {equipment.owner?.isVerified && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                        <ShieldCheck size={14} />
                        Verified
                      </span>
                    )}
                  </div>

                  <h3 className="line-clamp-1 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                    {equipment.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                    {equipment.shortDescription}
                  </p>

                  {/* Condition and Stock */}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Star size={14} className="text-primary" />
                      {equipment.condition}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Package size={14} />
                      {equipment.availableStock} in stock
                    </span>
                  </div>

                  {/* Pricing and Details */}
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold text-primary">
                        {formatPrice(equipment.rentalRate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        / {equipment.rentalPeriod}
                      </p>
                    </div>

                    <Link
                      href={`/equipment/${equipment._id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      Details
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEquipments;
