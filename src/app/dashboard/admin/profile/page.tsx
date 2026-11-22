"use client";

import React, { useEffect, useState, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { authClient, useSession } from "@/lib/auth-client";
import { uploadImageToImgBb } from "@/lib/imgbb";
import { toast } from "@/components/ui/toast";

type ProfileForm = {
  name: string;
  phone: string;
  address: string;
  avatar: string;
};

const fallbackAvatar =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80";

const AdminProfilePage = () => {
  const { data: session, isPending, refetch } = useSession();
  const user = session?.user;

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    phone: "",
    address: "",
    avatar: "",
  });
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const values = {
      name: user.name ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
      avatar: user.image ?? "",
    };

    queueMicrotask(() => setForm(values));
  }, [user]);

  const setField =
    (field: keyof ProfileForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));
    };

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    setError("");
    setIsUploading(true);

    try {
      const url = await uploadImageToImgBb(file);

      queueMicrotask(() => {
        setForm((previous) => ({ ...previous, avatar: url }));
      });

      toast.add({
        type: "success",
        title: "Photo uploaded",
        description: "Your hosted avatar link is ready to save.",
        timeout: 4000,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Photo upload failed.";

      setError(message);
      toast.add({
        type: "error",
        title: "Photo upload failed",
        description: message,
        timeout: 6000,
      });
    } finally {
      setIsUploading(false);
      input.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");

    try {
      const result = await authClient.updateUser({
        name: form.name.trim(),
        image: form.avatar.trim() || null,
        phone: form.phone.trim(),
        address: form.address.trim(),
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Could not save your profile.");
      }

      await refetch();

      toast.add({
        type: "success",
        title: "Profile updated successfully",
        description: "Your changes have been saved.",
        timeout: 5000,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save your profile.";

      setError(message);
      toast.add({
        type: "error",
        title: "Could not save profile",
        description: message,
        timeout: 6000,
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60";

  const labelClass = "mb-2 block text-sm font-semibold text-foreground";

  const roleLabel =
    user?.role === "owner"
      ? "Owner Account"
      : user?.role === "admin"
        ? "Admin Account"
        : "Customer Account";

  const isDisabled = isPending || saving || isUploading || !user;
  const avatarSrc = form.avatar.trim() || fallbackAvatar;

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="mx-auto max-w-5xl">
        {/* Back Navigation */}
        <Link
          href="/dashboard/admin"
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <UserRound size={17} />
            Account Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Account &amp; Profile Settings
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Manage your personal information, delivery details, and avatar via
            ImgBB in one place.
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Overview */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="h-28 bg-linear-to-r from-primary/20 via-primary/10 to-transparent" />

            <div className="px-5 pb-6 sm:px-8">
              <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                {/* Avatar and Name */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <Image
                    src={avatarSrc}
                    alt={form.name || "Admin avatar"}
                    width={96}
                    height={96}
                    unoptimized
                    className="h-24 w-24 rounded-2xl border-4 border-card object-cover shadow-lg"
                  />

                  <div className="pb-1">
                    <h2 className="text-xl font-bold text-foreground">
                      {form.name || "GearNest Admin"}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {user?.email ?? "Loading account..."}
                    </p>
                  </div>
                </div>

                {/* Account Badge */}
                <div className="flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
                  <ShieldCheck size={15} />
                  {roleLabel}
                </div>
              </div>
            </div>
          </section>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-8">
              <div className="mb-7">
                <h2 className="text-lg font-bold text-foreground">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Your registered account and contact information.
                </p>
              </div>

              <fieldset disabled={isDisabled} className="space-y-6">
                {/* Name and Email */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="admin-name">
                      Full Name
                    </label>

                    <div className="relative">
                      <UserRound
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />

                      <input
                        id="admin-name"
                        value={form.name}
                        onChange={setField("name")}
                        required
                        placeholder="Your full name"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="admin-email">
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />

                      <input
                        id="admin-email"
                        type="email"
                        value={user?.email ?? ""}
                        readOnly
                        className={`${inputClass} cursor-not-allowed bg-muted/40 pl-11 text-muted-foreground`}
                      />
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Email changes require a separate verification flow.
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="admin-phone">
                      Phone Number
                    </label>

                    <div className="relative">
                      <Phone
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />

                      <input
                        id="admin-phone"
                        type="tel"
                        value={form.phone}
                        onChange={setField("phone")}
                        placeholder="e.g. +880 1711 000000"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  {/* Avatar URL + ImgBB Upload */}
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="admin-avatar">
                      Avatar Hosted URL
                    </label>

                    <input
                      id="admin-avatar"
                      value={form.avatar}
                      onChange={setField("avatar")}
                      placeholder="https://example.com/avatar.jpg"
                      className={inputClass}
                    />

                    <label
                      htmlFor="admin-avatar-file"
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
                      id="admin-avatar-file"
                      name="admin-avatar-file"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      disabled={isUploading || isPending || saving}
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />

                    <p className="mt-2 text-xs text-muted-foreground">
                      Hosted automatically via ImgBB upon uploading above. The
                      preview updates as you type.
                    </p>

                    {form.avatar.trim() ? (
                      <p className="mt-2 flex items-center gap-1.5 truncate text-xs text-green-700 dark:text-lime-400">
                        <CheckCircle2 size={14} className="shrink-0" />
                        Avatar link ready to save
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className={labelClass} htmlFor="admin-address">
                    Delivery / Physical Address
                  </label>

                  <div className="relative">
                    <MapPin
                      size={17}
                      className="absolute left-4 top-4 text-muted-foreground"
                    />

                    <textarea
                      id="admin-address"
                      value={form.address}
                      onChange={setField("address")}
                      rows={3}
                      placeholder="e.g. Road, Area, District"
                      className={`${inputClass} resize-none pl-11`}
                    />
                  </div>
                </div>
              </fieldset>

              {error && (
                <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Save Button */}
              <div className="mt-8 flex flex-col-reverse justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
                <p className="text-xs text-muted-foreground">
                  <ShieldCheck size={13} className="mr-1 inline" />
                  Changes are saved to your GearNest account.
                </p>

                <button
                  type="submit"
                  disabled={isDisabled}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={17} />
                  {saving ? "Saving..." : "Save Profile Changes"}
                </button>
              </div>
            </section>
          </form>

          {/* Account Information */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck size={21} />
              </div>

              <div>
                <h3 className="font-bold text-foreground">
                  Your Account is Protected
                </h3>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Profile details you save here are attached to your signed-in
                  GearNest account and used across your admin dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
