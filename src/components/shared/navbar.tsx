"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./themeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/equipment", label: "All Equipment" },
  { href: "/#about", label: "About Us" },
  { href: "/#contact", label: "Contact Us" },
  { href: "/#how-it-works", label: "How It Works" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md dark:border-green-900/60">
      <div className="mx-auto flex h-16 max-w-360 items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center"
          onClick={closeMenu}
        >
          <Image
            src="/GearNestLogo.png"
            alt="GearNest Logo"
            width={155}
            height={50}
            priority
            className="h-auto w-30 object-contain sm:w-36.25"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-5 lg:flex xl:gap-7"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition hover:text-lime-700 dark:hover:text-lime-300 ${
                href === "/"
                  ? "font-semibold text-green-800 dark:text-lime-300"
                  : "font-medium text-muted-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Demo Accounts */}
          <div className="hidden items-center gap-2 xl:flex">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
            >
              Demo Admin
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
            >
              Demo Owner
            </Button>
          </div>

          {/* Search */}
          <Link href="/equipment" aria-label="Search equipment">
            <Button variant="outline" size="icon" aria-label="Search equipment">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Login */}
          <Link href="/signin" className="hidden md:inline-flex">
            <Button variant="ghost" className="font-semibold">
              Login
            </Button>
          </Link>

          {/* Register */}
          <Link href="/signup" className="hidden md:inline-flex">
            <Button className="bg-green-700 font-semibold text-white hover:bg-green-800">
              Register
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            className="lg:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="lg:hidden"
        >
          <div className="mx-auto flex max-w-360 flex-col gap-1 border-t border-border bg-background px-4 pb-5 pt-3 shadow-lg dark:border-green-900/60 sm:px-6">
            {/* Navigation Links */}
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className={`rounded-lg px-3 py-2.5 text-sm transition hover:bg-muted hover:text-green-700 dark:hover:bg-green-900/40 dark:hover:text-lime-300 ${
                  href === "/"
                    ? "font-semibold text-green-800 dark:text-lime-300"
                    : "font-medium text-muted-foreground"
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Authentication Buttons */}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-4 dark:border-green-900/60 md:hidden">
              <Link href="/signin" onClick={closeMenu}>
                <Button variant="ghost" className="w-full font-semibold">
                  Login
                </Button>
              </Link>

              <Link href="/signup" onClick={closeMenu}>
                <Button className="w-full bg-green-700 font-semibold text-white hover:bg-green-800">
                  Register
                </Button>
              </Link>
            </div>

            {/* Demo Accounts */}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-4 dark:border-green-900/60 xl:hidden">
              <Link href="/" onClick={closeMenu}>
                <Button
                  variant="ghost"
                  className="w-full text-xs text-muted-foreground"
                >
                  Demo Admin
                </Button>
              </Link>

              <Link href="/" onClick={closeMenu}>
                <Button
                  variant="ghost"
                  className="w-full text-xs text-muted-foreground"
                >
                  Demo Owner
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
