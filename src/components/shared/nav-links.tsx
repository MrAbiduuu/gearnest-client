"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/equipment", label: "All Equipment" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/#how-it-works", label: "How It Works" },
];

type NavLinksProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

const subscribeToHashChanges = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);

  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
};

const getHashSnapshot = () => window.location.hash;
const getServerHashSnapshot = () => "";

const hashRoutes = navLinks
  .filter(({ href }) => href.includes("#"))
  .map(({ href }) => href.slice(href.indexOf("#")));

const linkClassName = (variant: "desktop" | "mobile", isActive: boolean) => {
  const base =
    variant === "mobile"
      ? "flex rounded-lg px-3 py-2.5 text-sm transition hover:bg-muted hover:text-green-700 dark:hover:bg-green-900/40 dark:hover:text-lime-300"
      : "text-sm transition hover:text-lime-700 dark:hover:text-lime-300";

  if (!isActive) {
    return `${base} font-medium text-muted-foreground`;
  }

  const activeSurface =
    variant === "mobile" ? " bg-lime-50 dark:bg-lime-400/10" : "";

  return `${base}${activeSurface} font-bold text-lime-700 dark:text-lime-300`;
};

export const NavLinksFallback = ({
  variant = "desktop",
  onNavigate,
}: NavLinksProps) => (
  <>
    {navLinks.map(({ href, label }) => (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        className={linkClassName(variant, false)}
      >
        {label}
      </Link>
    ))}
  </>
);

const NavLinks = ({ variant = "desktop", onNavigate }: NavLinksProps) => {
  const pathname = usePathname();
  const hash = useSyncExternalStore(
    subscribeToHashChanges,
    getHashSnapshot,
    getServerHashSnapshot,
  );

  const isActive = (href: string) => {
    const hashIndex = href.indexOf("#");
    const linkPath = hashIndex === -1 ? href : href.slice(0, hashIndex) || "/";

    if (hashIndex !== -1) {
      return pathname === linkPath && hash === href.slice(hashIndex);
    }

    if (linkPath === "/") {
      return pathname === "/" && !hashRoutes.includes(hash);
    }

    return pathname === linkPath || pathname.startsWith(`${linkPath}/`);
  };

  return (
    <>
      {navLinks.map(({ href, label }) => {
        const active = isActive(href);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={linkClassName(variant, active)}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
};

export default NavLinks;
