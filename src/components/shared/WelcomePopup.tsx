"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ShieldCheck, Sparkles, Wrench, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const WELCOME_STORAGE_KEY = "gearnest-welcome-shown";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const WelcomePopup = () => {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = Boolean(shouldReduceMotion);

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Defer the client-only read so the server and first client render match.
    const timer = window.setTimeout(() => {
      setMounted(true);

      try {
        if (window.localStorage.getItem(WELCOME_STORAGE_KEY) !== "true") {
          setIsOpen(true);
        }
      } catch {
        // Storage can be unavailable in private browsing; show the welcome
        // once for this mount rather than breaking the experience.
        setIsOpen(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const saveWelcomeFlag = useCallback(() => {
    try {
      window.localStorage.setItem(WELCOME_STORAGE_KEY, "true");
    } catch {
      // Ignore storage failures; the popup has already been dismissed.
    }
  }, []);

  const closePopup = useCallback(() => {
    saveWelcomeFlag();
    setIsOpen(false);
  }, [saveWelcomeFlag]);

  const exploreEquipment = useCallback(() => {
    closePopup();
    router.push("/equipment");
  }, [closePopup, router]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePopup();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.getClientRects().length > 0);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === firstElement || activeElement === dialogRef.current)) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [closePopup, isOpen]);

  const overlayVariants = {
    hidden: {
      opacity: 0,
      transition: { duration: reduceMotion ? 0 : 0.2 },
    },
    visible: {
      opacity: 1,
      transition: { duration: reduceMotion ? 0 : 0.3 },
    },
  };

  const panelVariants = {
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : 18,
      scale: reduceMotion ? 1 : 0.94,
      transition: { duration: reduceMotion ? 0 : 0.18 },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: reduceMotion ? 0 : 0.45,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="gearnest-welcome-popup"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-[#1f140d]/50 backdrop-blur-md dark:bg-black/70"
            variants={overlayVariants}
            onClick={closePopup}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-popup-title"
            aria-describedby="welcome-popup-description"
            tabIndex={-1}
            variants={panelVariants}
            className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-[#eadcc8] bg-[#fffaf2] text-[#2d2118] shadow-[0_30px_90px_-35px_rgba(55,32,12,0.75)] outline-none dark:border-[#3d2c21] dark:bg-[#17100c] dark:text-[#f2f7f0] dark:shadow-[0_30px_90px_-35px_rgba(0,0,0,0.9)]"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closePopup}
              aria-label="Close welcome dialog"
              className="absolute top-4 right-4 z-20 flex size-10 items-center justify-center rounded-full border border-[#e7d8c4] bg-white/80 text-[#5b4534] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf2] dark:border-[#47352a] dark:bg-white/5 dark:text-[#d9c7ba] dark:focus-visible:ring-lime-400 dark:focus-visible:ring-offset-[#17100c]"
            >
              <X size={18} />
            </button>

            <div className="grid md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              {/* Illustration */}
              <div className="relative flex min-h-56 items-center justify-center overflow-hidden bg-linear-to-br from-[#f6e8d2] via-[#fff5e6] to-[#ecf7d5] p-6 sm:min-h-72 md:min-h-full dark:from-[#2a1d14] dark:via-[#1d150f] dark:to-[#1b2716]">
                <div
                  aria-hidden="true"
                  className="absolute -top-16 -left-16 size-48 rounded-full bg-orange-300/25 blur-2xl dark:bg-orange-700/15"
                />
                <div
                  aria-hidden="true"
                  className="absolute -right-14 -bottom-16 size-52 rounded-full bg-lime-300/30 blur-2xl dark:bg-lime-500/10"
                />

                <motion.div
                  animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative w-full max-w-72"
                >
                  <Image
                    src="/GearNestBanner.png"
                    alt="Shopping cart filled with rental equipment"
                    width={900}
                    height={500}
                    className="h-auto w-full object-contain drop-shadow-[0_18px_24px_rgba(76,47,20,0.18)] dark:drop-shadow-[0_18px_24px_rgba(0,0,0,0.5)]"
                  />

                  <div className="absolute -bottom-1 left-1 flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-2 text-[11px] font-bold text-[#4b3727] shadow-sm backdrop-blur-sm dark:border-[#4a3628] dark:bg-[#241811]/90 dark:text-[#e8d8c8]">
                    <ShieldCheck size={14} className="text-green-700 dark:text-lime-400" />
                    Quality gear, trusted owners
                  </div>
                </motion.div>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center px-6 py-10 sm:px-9 sm:py-12">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.18em] text-orange-700 uppercase dark:border-lime-400/25 dark:bg-lime-400/10 dark:text-lime-300">
                  <Sparkles size={13} />
                  Welcome to GearNest
                </div>

                <h2
                  id="welcome-popup-title"
                  className="mt-5 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl"
                >
                  Welcome to{" "}
                  <span className="text-orange-600 dark:text-lime-400">
                    GearNest!
                  </span>
                </h2>

                <p
                  id="welcome-popup-description"
                  className="mt-4 max-w-md text-sm leading-7 text-[#6b5848] dark:text-[#b9c9bb]"
                >
                  Your next project starts here. Discover quality equipment,
                  explore affordable rentals, and get the tools you need without
                  the hassle.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3eadc] px-3 py-1.5 text-xs font-semibold text-[#6a513c] dark:bg-white/5 dark:text-[#d1c1b2]">
                    <Wrench size={13} />
                    Tools for every project
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1.5 text-xs font-semibold text-green-800 dark:bg-lime-400/10 dark:text-lime-300">
                    <ShieldCheck size={13} />
                    Rent with confidence
                  </span>
                </div>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <motion.button
                    type="button"
                    onClick={exploreEquipment}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-900/20 transition-colors hover:bg-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf2] dark:bg-lime-400 dark:text-[#102014] dark:shadow-lime-900/20 dark:hover:bg-lime-300 dark:focus-visible:ring-lime-400 dark:focus-visible:ring-offset-[#17100c]"
                  >
                    Explore Equipment
                    <ArrowRight size={16} />
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={closePopup}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-[#dfd0bd] bg-white/70 px-5 py-3 text-sm font-bold text-[#5b4534] transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf2] dark:border-[#463327] dark:bg-white/5 dark:text-[#ded0c3] dark:hover:bg-white/10 dark:focus-visible:ring-lime-400 dark:focus-visible:ring-offset-[#17100c]"
                  >
                    Maybe Later
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default WelcomePopup;
