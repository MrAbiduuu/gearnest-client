"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Package,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getEmailError, getPasswordError } from "@/lib/auth-validation";
import { toast } from "@/components/ui/toast";
import Image from "next/image";

const inputClassName =
  "h-12 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-green-600 focus:ring-4 focus:ring-green-600/10";

/** Only allow local relative paths so the callback cannot be an open redirect. */
const getCallbackUrl = () => {
  const requested = new URLSearchParams(window.location.search).get(
    "callbackUrl",
  );

  return requested && requested.startsWith("/") && !requested.startsWith("//")
    ? requested
    : "/";
};

const SignInPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const showError = (message: string, title = "Sign in failed") => {
    setFormError(message);
    toast.add({ type: "error", title, description: message, timeout: 6000 });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const emailError = getEmailError(email);
    const passwordError = getPasswordError(password);

    if (emailError || passwordError) {
      showError(emailError ?? passwordError!);
      return;
    }

    setIsSubmitting(true);

    try {
      const callbackUrl = getCallbackUrl();
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe,
        callbackURL: callbackUrl,
      });

      if (result.error) {
        showError(result.error.message ?? "Invalid email or password.");
        return;
      }

      toast.add({
        type: "success",
        title: "Welcome back!",
        description: "You have signed in successfully.",
        timeout: 5000,
      });

      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Unable to sign in right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: getCallbackUrl(),
      });

      if (result.error) {
        showError(
          result.error.message ?? "Google sign-in is not available right now.",
          "Google sign-in failed",
        );
      }
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Unable to continue with Google.",
        "Google sign-in failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-[0_30px_90px_-45px_rgba(18,61,41,0.55)] lg:grid-cols-2">
        {/* LEFT BRAND PANEL */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#123D29] px-10 py-10 text-white lg:flex xl:px-14">
          <div className="absolute -right-40 -top-40 h-100 w-100 rounded-full border border-white/10" />
          <div className="absolute -right-20 -top-20 h-75 w-75 rounded-full border border-white/10" />
          <div className="absolute -bottom-48 -left-40 h-100 w-100 rounded-full bg-[#84CC16]/10 blur-3xl" />

          <Link href="/" className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#84CC16] text-[#123D29]">
              <Package size={26} strokeWidth={2.5} />
            </div>

            <span className="text-2xl font-extrabold tracking-tight">
              Gear<span className="text-[#A3E635]">Nest</span>
            </span>
          </Link>

          <div className="relative z-10 my-12 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wider text-[#D9F99D]">
              <span className="h-2 w-2 rounded-full bg-[#84CC16]" />
              YOUR EQUIPMENT RENTAL PARTNER
            </span>

            <h1 className="mt-8 text-4xl font-extrabold leading-[1.15] tracking-tight xl:text-5xl">
              Everything you need.
              <span className="mt-2 block text-[#A3E635]">Just rent it.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-8 text-green-100/75">
              Discover quality equipment, connect with trusted owners, and bring
              your next big idea to life. All in one place.
            </p>

            <div className="mt-10 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#A3E635]">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <p className="font-semibold">Reliable rental experience</p>
                  <p className="mt-1 text-sm text-green-100/60">
                    Rent with confidence and peace of mind.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#A3E635]">
                  <Clock3 size={22} />
                </div>
                <div>
                  <p className="font-semibold">Flexible booking</p>
                  <p className="mt-1 text-sm text-green-100/60">
                    Find equipment that fits your schedule.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#A3E635]">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <p className="font-semibold">Simple and convenient</p>
                  <p className="mt-1 text-sm text-green-100/60">
                    Browse, book, and get things done.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-green-100/50">
            <p>© GearNest. All rights reserved.</p>
            <p>Rent Smart. Work Better.</p>
          </div>
        </section>

        {/* RIGHT SIGN IN PANEL */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-10 xl:px-14">
          <div className="w-full max-w-110">
            <Link href="/" className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#166534] text-white">
                <Package size={23} />
              </div>

              <span className="text-2xl font-extrabold tracking-tight text-foreground">
                Gear
                <span className="text-green-700 dark:text-lime-400">Nest</span>
              </span>
            </Link>

            <p className="text-sm font-bold uppercase tracking-[0.15em] text-green-700 dark:text-lime-400">
              Welcome Back
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Sign in to your account
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Welcome back! Please enter your details to access your GearNest
              account.
            </p>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleSignIn}
              className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-semibold text-foreground transition hover:border-green-300 hover:bg-green-50/50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-green-900/30"
            >
              <Image
                src="/icons8-google-48.png"
                alt="Google"
                width={20}
                height={20}
                priority
                className="h-5 w-5 object-contain"
              />
              Continue with Google
            </button>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">
                OR CONTINUE WITH EMAIL
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`${inputClassName} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-green-700 dark:hover:text-lime-300"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-border accent-green-700"
                  />
                  Remember me
                </label>

                <span className="text-xs font-medium text-muted-foreground">
                  Forgot password?
                </span>
              </div>

              {formError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#166534] text-sm font-bold text-white shadow-lg shadow-green-900/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#14532D] hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-bold text-green-700 transition hover:text-green-900 dark:text-lime-400 dark:hover:text-lime-300"
              >
                Create an account
              </Link>
            </p>

            <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck size={15} />
              Your rental journey starts here.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SignInPage;
