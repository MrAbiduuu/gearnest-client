"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
    <header className="sticky top-0 z-50 w-full border-b border-green-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-360 items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center" onClick={closeMenu}>
          <Image
            src="/GearNestLogo.png"
            alt="GearNest Logo"
            width={155}
            height={50}
            priority
            className="h-auto w-30 object-contain sm:w-36.25"
          />
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-5 lg:flex xl:gap-7"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition hover:text-lime-600 ${
                href === "/"
                  ? "font-semibold text-green-800"
                  : "font-medium text-gray-600"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 xl:flex">
            <Button variant="ghost" size="sm" className="text-xs text-gray-600">
              Demo Admin
            </Button>

            <Button variant="ghost" size="sm" className="text-xs text-gray-600">
              Demo Owner
            </Button>
          </div>

          <Link href="/equipment" aria-label="Search equipment">
            <Button variant="outline" size="icon" aria-label="Search equipment">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/signin" className="hidden md:inline-flex">
            <Button variant="ghost" className="font-semibold">
              Login
            </Button>
          </Link>

          <Link href="/signup" className="hidden md:inline-flex">
            <Button className="bg-green-700 font-semibold text-white hover:bg-green-800">
              Register
            </Button>
          </Link>

          <Button
            variant="outline"
            size="icon"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            className="lg:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="lg:hidden"
        >
          <div className="mx-auto flex max-w-360 flex-col gap-1 border-t border-green-100 bg-white px-4 pb-5 pt-3 shadow-lg sm:px-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className={`rounded-lg px-3 py-2.5 text-sm transition hover:bg-lime-50 hover:text-green-700 ${
                  href === "/"
                    ? "font-semibold text-green-800"
                    : "font-medium text-gray-600"
                }`}
              >
                {label}
              </Link>
            ))}

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-green-100 pt-4 md:hidden">
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

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-green-100 pt-4 xl:hidden">
              <Link href="/" onClick={closeMenu}>
                <Button variant="ghost" className="w-full text-xs text-gray-600">
                  Demo Admin
                </Button>
              </Link>

              <Link href="/" onClick={closeMenu}>
                <Button variant="ghost" className="w-full text-xs text-gray-600">
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
