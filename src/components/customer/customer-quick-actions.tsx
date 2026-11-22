"use client";

import Link from "next/link";
import {
  CalendarDays,
  Heart,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

type QuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const actions: QuickAction[] = [
  { label: "Browse Equipment", href: "/equipment", icon: Search },
  {
    label: "My Favorites",
    href: "/dashboard/customer/favorites",
    icon: Heart,
  },
  {
    label: "My Bookings",
    href: "/dashboard/customer/bookings",
    icon: CalendarDays,
  },
];

type CustomerQuickActionsProps = {
  reducedMotion: boolean;
};

const CustomerQuickActions = ({ reducedMotion }: CustomerQuickActionsProps) => (
  <motion.section
    initial={reducedMotion ? false : { opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.12 }}
    transition={{ duration: reducedMotion ? 0 : 0.45, delay: reducedMotion ? 0 : 0.08 }}
    className="min-w-0 rounded-2xl border border-[#EDE1D6] bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-[#111310] sm:p-6"
  >
    <h2 className="text-lg font-bold tracking-tight text-[#2E2119] dark:text-stone-100 sm:text-xl">
      Quick Actions
    </h2>
    <p className="mt-1 text-xs text-[#8B7B6B] dark:text-stone-400 sm:text-sm">
      Jump back into the parts of your account you use most
    </p>

    <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
      {actions.map(({ label, href, icon: Icon }, index) => (
        <motion.div
          key={label}
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{
            duration: reducedMotion ? 0 : 0.35,
            delay: reducedMotion ? 0 : 0.1 + index * 0.05,
          }}
          whileHover={reducedMotion ? undefined : { y: -3 }}
        >
          <Button
            render={<Link href={href} />}
            nativeButton={false}
            variant="outline"
            className="h-auto min-h-20 w-full flex-col gap-2 rounded-xl border-[#EDE1D6] bg-[#FCFAF7] px-3 py-4 text-[#6F5D4D] hover:border-[#D9601B] hover:bg-orange-50 hover:text-[#C2561B] dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-200 dark:hover:border-orange-800 dark:hover:bg-orange-950/20"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#FCE9DA] text-[#C2561B] dark:bg-orange-950/40 dark:text-orange-300">
              <Icon aria-hidden="true" className="size-4" />
            </span>
            <span className="text-xs font-bold">{label}</span>
          </Button>
        </motion.div>
      ))}
    </div>

    <Button
      render={<Link href="/dashboard/customer/profile" />}
      nativeButton={false}
      className="mt-3 h-11 w-full rounded-xl bg-[#2E2119] text-white hover:bg-[#3B2B21] dark:bg-[#F97316] dark:hover:bg-[#EA6A0F]"
    >
      <UserRound aria-hidden="true" />
      Update Profile
    </Button>
  </motion.section>
);

export default CustomerQuickActions;
