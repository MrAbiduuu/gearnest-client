"use client";
import { MdAdminPanelSettings } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { signOut, useSession } from "@/lib/auth-client";
import ThemeToggle from "./themeToggle";
import { FaSuitcase } from "react-icons/fa";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/equipment", label: "All Equipment" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/#how-it-works", label: "How It Works" },
];

type NavbarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type DemoRole = "admin" | "owner";

const demoAccounts = [
  { role: "admin" as const, label: "Demo Admin", icon: MdAdminPanelSettings },
  { role: "owner" as const, label: "Demo Owner", icon: FaSuitcase },
];

const getInitials = (user: NavbarUser) => {
  const source = (user.name || user.email || "U").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  const initials =
    parts.length > 1
      ? parts
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
      : source.slice(0, 2);

  return initials.toUpperCase() || "U";
};

const UserAvatar = ({
  user,
  className = "size-8",
}: {
  user: NavbarUser;
  className?: string;
}) => {
  const label = user.name || user.email || "User";

  if (user.image) {
    return (
      // Avatar URLs come from the auth provider / ImgBB and can be on any host.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt={`${label}'s profile`}
        referrerPolicy="no-referrer"
        className={`${className} shrink-0 rounded-full object-cover ring-2 ring-green-700/20 dark:ring-lime-400/30`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800 ring-2 ring-green-700/20 dark:bg-green-900/40 dark:text-lime-200 dark:ring-lime-400/30`}
    >
      {getInitials(user)}
    </span>
  );
};

const Navbar = () => {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [demoSignInRole, setDemoSignInRole] = useState<DemoRole | null>(null);

  const user = session?.user;
  const closeMenu = () => setIsMenuOpen(false);

  const handleDemoSignIn = async (role: DemoRole) => {
    closeMenu();
    setDemoSignInRole(role);

    try {
      const response = await fetch("/api/demo/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = (await response.json()) as {
        redirect?: string;
        error?: string;
      };

      if (!response.ok || !data.redirect) {
        throw new Error(data.error ?? "Could not sign in to the demo account.");
      }

      await refetch();

      toast.add({
        type: "success",
        title: `Signed in as Demo ${role === "admin" ? "Admin" : "Owner"}`,
        description: "Opening the demo dashboard…",
        timeout: 4000,
      });

      router.push(data.redirect);
      router.refresh();
    } catch (error) {
      toast.add({
        type: "error",
        title: "Demo sign-in failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        timeout: 5000,
      });
    } finally {
      setDemoSignInRole(null);
    }
  };

  const handleLogout = async () => {
    closeMenu();

    try {
      const result = await signOut();

      if (result.error) {
        toast.add({
          type: "error",
          title: "Could not log out",
          description: result.error.message ?? "Please try again.",
          timeout: 5000,
        });
        return;
      }

      router.push("/signin");
      router.refresh();
    } catch (error) {
      toast.add({
        type: "error",
        title: "Could not log out",
        description:
          error instanceof Error ? error.message : "Please try again.",
        timeout: 5000,
      });
    }
  };

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
            {demoAccounts.map(({ role, label, icon: Icon }) => (
              <Button
                key={role}
                type="button"
                variant="ghost"
                size="sm"
                disabled={demoSignInRole !== null}
                onClick={() => handleDemoSignIn(role)}
                className="text-xs text-muted-foreground"
              >
                <Icon />
                {demoSignInRole === role ? "Signing in…" : label}
              </Button>
            ))}
          </div>

          {/* Search */}
          <Link href="/equipment" aria-label="Search equipment">
            <Button variant="outline" size="icon" aria-label="Search equipment">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Session Actions */}
          {isPending ? (
            <div
              aria-hidden="true"
              className="hidden size-8 animate-pulse rounded-full bg-muted md:block"
            />
          ) : user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/dashboard"
                title="Go to dashboard"
                className="flex items-center gap-2 rounded-lg px-1 py-1 transition hover:bg-muted dark:hover:bg-green-900/30"
              >
                <UserAvatar user={user} />
                <span className="hidden max-w-24 truncate text-sm font-semibold text-foreground xl:block">
                  {user.name || user.email}
                </span>
              </Link>

              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="font-semibold">
                  <LayoutDashboard className="size-4" />
                  <span className="hidden lg:inline">Dashboard</span>
                </Button>
              </Link>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                className="text-muted-foreground hover:text-red-700 dark:hover:text-red-300"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : (
            <>
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
            </>
          )}

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

            {/* Session Actions */}
            {isPending ? (
              <div className="mt-3 flex items-center gap-3 border-t border-border px-3 pt-4 dark:border-green-900/60 md:hidden">
                <div className="size-9 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
            ) : user ? (
              <div className="mt-3 border-t border-border pt-4 dark:border-green-900/60">
                <div className="flex items-center gap-3 px-3 py-2">
                  <UserAvatar user={user} className="size-9" />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name || "GearNest user"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Link href="/dashboard" onClick={closeMenu}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-semibold"
                  >
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Button>
                </Link>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start font-semibold text-muted-foreground hover:text-red-700 dark:hover:text-red-300"
                >
                  <LogOut className="size-4" />
                  Log out
                </Button>
              </div>
            ) : (
              /* Authentication Buttons */
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
            )}

            {/* Demo Accounts */}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-4 dark:border-green-900/60 xl:hidden">
              {demoAccounts.map(({ role, label, icon: Icon }) => (
                <Button
                  key={role}
                  type="button"
                  variant="ghost"
                  disabled={demoSignInRole !== null}
                  onClick={() => handleDemoSignIn(role)}
                  className="w-full text-xs text-muted-foreground"
                >
                  <Icon />
                  {demoSignInRole === role ? "Signing in…" : label}
                </Button>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
