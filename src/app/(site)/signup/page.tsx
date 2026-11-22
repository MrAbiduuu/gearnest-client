"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Package,
  ShieldCheck,
  UserPlus,
  Camera,
  CheckCircle2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  getEmailError,
  getPasswordError,
  getPhotoUrlError,
} from "@/lib/auth-validation";
import { uploadImageToImgBb } from "@/lib/imgbb";
import { toast } from "@/components/ui/toast";
import Image from "next/image";

const inputClassName =
  "h-12 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-green-600 focus:ring-4 focus:ring-green-600/10";

const SignUpPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState<"customer" | "owner">("customer");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const showError = (message: string, title = "Registration failed") => {
    setFormError(message);
    toast.add({ type: "error", title, description: message, timeout: 6000 });
  };

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    setFormError(null);
    setIsUploading(true);

    try {
      const url = await uploadImageToImgBb(file);
      setPhotoUrl(url);
      toast.add({
        type: "success",
        title: "Photo uploaded",
        description: "Your profile image link is ready.",
        timeout: 4000,
      });
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Photo upload failed.",
        "Photo upload failed",
      );
    } finally {
      setIsUploading(false);
      input.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const emailError = getEmailError(email);
    const passwordError = getPasswordError(password);
    const photoError = getPhotoUrlError(photoUrl);

    if (!name.trim()) {
      showError("Full name is required.");
      return;
    }

    if (emailError || passwordError || photoError) {
      showError(emailError ?? passwordError ?? photoError!);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: photoUrl.trim(),
        role,
        callbackURL: "/",
      });

      if (result.error) {
        showError(result.error.message ?? "Unable to create your account.");
        return;
      }

      toast.add({
        type: "success",
        title: "Account created!",
        description: "Welcome to GearNest. You are signed in.",
        timeout: 5000,
      });

      router.push("/");
      router.refresh();
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Unable to register right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (result.error) {
        showError(
          result.error.message ?? "Google sign-up is not available right now.",
          "Google sign-up failed",
        );
      }
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Unable to continue with Google.",
        "Google sign-up failed",
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
              JOIN THE GEARNEST COMMUNITY
            </span>

            <h1 className="mt-8 text-4xl font-extrabold leading-[1.15] tracking-tight xl:text-5xl">
              Make room for
              <span className="mt-2 block text-[#A3E635]">
                bigger possibilities.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-8 text-green-100/75">
              Create your GearNest account and discover a smarter way to rent,
              share, and manage equipment for every project.
            </p>

            <div className="mt-10 space-y-5">
              {[
                "Discover equipment for every need",
                "Book rentals with flexible dates",
                "Manage your rentals in one place",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#84CC16]/15 text-[#A3E635]">
                    <CheckCircle2 size={17} />
                  </div>
                  <p className="text-sm font-medium text-green-50/90">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-green-100/50">
            <p>© GearNest. All rights reserved.</p>
            <p>Rent Smart. Work Better.</p>
          </div>
        </section>

        {/* RIGHT REGISTRATION FORM */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-10 xl:px-14">
          <div className="w-full max-w-110">
            <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#166534] text-white">
                <Package size={23} />
              </div>

              <span className="text-2xl font-extrabold tracking-tight text-foreground">
                Gear
                <span className="text-green-700 dark:text-lime-400">Nest</span>
              </span>
            </Link>

            <p className="text-sm font-bold uppercase tracking-[0.15em] text-green-700 dark:text-lime-400">
              Get Started Today
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Create your account
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Join GearNest and make your next project easier. It only takes a
              moment to get started.
            </p>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleSignUp}
              className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-semibold text-foreground transition hover:border-green-300 hover:bg-green-50/50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-green-900/30"
            >
              <Image
                src="/icons8-google-48.png"
                alt="Google"
                width={20}
                height={20}
                priority
                className="h-5 w-5 object-contain"
              />
              Sign up with Google
            </button>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">
                OR REGISTER WITH EMAIL
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className={inputClassName}
                />
              </div>

              <fieldset>
                <legend className="mb-2 block text-sm font-semibold text-foreground">
                  Register as
                </legend>

                <div className="grid grid-cols-2 gap-3">
                  <label
                    htmlFor="role-customer"
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      role === "customer"
                        ? "border-green-600 bg-green-50 text-green-800 ring-2 ring-green-600/10 dark:border-lime-500 dark:bg-green-900/30 dark:text-lime-200"
                        : "border-border bg-card text-muted-foreground hover:border-green-400"
                    }`}
                  >
                    <input
                      id="role-customer"
                      name="role"
                      type="radio"
                      value="customer"
                      checked={role === "customer"}
                      onChange={() => setRole("customer")}
                      className="accent-green-700"
                    />
                    Customer
                  </label>

                  <label
                    htmlFor="role-owner"
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      role === "owner"
                        ? "border-green-600 bg-green-50 text-green-800 ring-2 ring-green-600/10 dark:border-lime-500 dark:bg-green-900/30 dark:text-lime-200"
                        : "border-border bg-card text-muted-foreground hover:border-green-400"
                    }`}
                  >
                    <input
                      id="role-owner"
                      name="role"
                      type="radio"
                      value="owner"
                      checked={role === "owner"}
                      onChange={() => setRole("owner")}
                      className="accent-green-700"
                    />
                    Owner
                  </label>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Customers rent equipment. Owners list their equipment.
                </p>
              </fieldset>

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
                  htmlFor="photo-url"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Profile photo
                </label>

                <input
                  id="photo-url"
                  name="photo-url"
                  type="url"
                  value={photoUrl}
                  onChange={(event) => setPhotoUrl(event.target.value)}
                  placeholder="https://example.com/your-photo.jpg (optional)"
                  className={inputClassName}
                />

                <label
                  htmlFor="photo-file"
                  className="mt-3 flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-card px-4 py-3 transition hover:border-green-500 hover:bg-green-50/30 dark:hover:bg-green-900/20"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ECFCCB] text-[#166534] dark:bg-green-900/40 dark:text-lime-300">
                    <Camera size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {isUploading
                        ? "Uploading photo..."
                        : "Upload from your device"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      JPEG, PNG, WEBP or GIF · up to 10MB
                    </p>
                  </div>
                </label>

                <input
                  id="photo-file"
                  name="photo-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={isUploading}
                  className="hidden"
                  onChange={handlePhotoUpload}
                />

                {photoUrl && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50/60 p-3 dark:border-green-800 dark:bg-green-900/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt="Selected profile photo"
                      className="size-14 shrink-0 rounded-lg border border-border object-cover"
                      onError={(event) => {
                        event.currentTarget.src = "/equipment-fallback.svg";
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-green-800 dark:text-lime-300">
                        Photo link ready
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {photoUrl}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPhotoUrl("")}
                      className="shrink-0 text-xs font-bold text-red-600 transition hover:text-red-700 dark:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                )}
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
                    placeholder="Create a strong password"
                    autoComplete="new-password"
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

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  At least 6 characters, including uppercase and lowercase
                  letters.
                </p>
              </div>

              {formError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="group mt-3 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#166534] text-sm font-bold text-white shadow-lg shadow-green-900/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#14532D] hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-bold text-green-700 transition hover:text-green-900 dark:text-lime-400 dark:hover:text-lime-300"
              >
                Sign in
              </Link>
            </p>

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <div className="mt-0.5 text-green-700 dark:text-lime-400">
                <ShieldCheck size={19} />
              </div>

              <p className="text-xs leading-6 text-muted-foreground">
                New accounts are registered with the{" "}
                <span className="font-bold text-[#166534] dark:text-lime-300">
                  Customer
                </span>{" "}
                role by default. You can explore GearNest and manage your
                rentals after signing in.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <UserPlus size={15} />
              Join the GearNest community
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SignUpPage;
