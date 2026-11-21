"use client";

import React from "react";
import Link from "next/link";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Camera,
  ShieldCheck,
  Save,
  LockKeyhole,
  ArrowLeft,
} from "lucide-react";
import DashboardPagePlaceholder from "@/app/component/DashboardPagePlaceholder";

const OwnerProfile = () => {
  const owner = {
    name: "Demo Owner",
    email: "owner@gmail.com",
    phone: "+880 1700-000000",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
    address: "Dhaka, Bangladesh",
    role: "Owner Account",
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground outline-none cursor-not-allowed";

  const labelClass = "mb-2 block text-sm font-semibold text-foreground";

  return (
    <DashboardPagePlaceholder
      title="Profile"
      description="Manage your owner account details."
    >
      <div className="min-h-screen bg-background pb-12">
        <div className="mx-auto max-w-5xl">
          {/* Back Navigation */}
          <Link
            href="/dashboard/owner"
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
              Account & Profile Settings
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Manage your personal information, delivery details, and profile
              avatar in one place.
            </p>
          </div>

          {/* Demo Notice */}
          <div className="mb-7 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <LockKeyhole size={20} className="mt-0.5 shrink-0 text-amber-600" />

            <div>
              <h3 className="text-sm font-bold text-foreground">
                Demo Account – Read-Only Mode
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Profile changes and photo uploads are disabled for demo
                accounts. You can explore your account information, but editing
                and saving are unavailable.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Profile Overview */}
            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />

              <div className="px-5 pb-6 sm:px-8">
                <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  {/* Avatar and Name */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="relative w-fit">
                      <img
                        src={owner.avatar}
                        alt={owner.name}
                        className="h-24 w-24 rounded-2xl border-4 border-card object-cover shadow-lg"
                      />

                      <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-muted-foreground">
                        <Camera size={14} />
                      </div>
                    </div>

                    <div className="pb-1">
                      <h2 className="text-xl font-bold text-foreground">
                        {owner.name}
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {owner.email}
                      </p>
                    </div>
                  </div>

                  {/* Account Badge */}
                  <div className="flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
                    <ShieldCheck size={15} />
                    {owner.role}
                  </div>
                </div>
              </div>
            </section>

            {/* Profile Form */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-8">
              <div className="mb-7">
                <h2 className="text-lg font-bold text-foreground">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Your registered account and contact information.
                </p>
              </div>

              <fieldset disabled className="space-y-6">
                {/* Name and Email */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Full Name</label>

                    <div className="relative">
                      <UserRound
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />

                      <input
                        value={owner.name}
                        readOnly
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Email Address</label>

                    <div className="relative">
                      <Mail
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />

                      <input
                        value={owner.email}
                        readOnly
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Phone Number</label>

                    <div className="relative">
                      <Phone
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />

                      <input
                        value={owner.phone}
                        readOnly
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  {/* Avatar URL */}
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Avatar Hosted URL</label>

                    <input
                      value={owner.avatar}
                      readOnly
                      className={inputClass}
                    />

                    <p className="mt-2 text-xs text-muted-foreground">
                      Your profile image is hosted automatically via ImgBB when
                      uploading in an editable account.
                    </p>
                  </div>
                </div>

                {/* Avatar Upload */}
                <div>
                  <label className={labelClass}>Profile Photo</label>

                  <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border bg-muted/20 p-5 sm:flex-row sm:items-center">
                    <img
                      src={owner.avatar}
                      alt="Profile avatar"
                      className="h-16 w-16 rounded-xl object-cover"
                    />

                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        Upload a new profile photo
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        JPG, PNG or WEBP. Maximum file size 5MB.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled
                      className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted px-4 py-2.5 text-sm font-semibold text-muted-foreground"
                    >
                      <Camera size={16} />
                      Upload Photo
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className={labelClass}>
                    Delivery / Physical Address
                  </label>

                  <div className="relative">
                    <MapPin
                      size={17}
                      className="absolute left-4 top-4 text-muted-foreground"
                    />

                    <textarea
                      value={owner.address}
                      readOnly
                      rows={3}
                      className={`${inputClass} resize-none pl-11`}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Save Button */}
              <div className="mt-8 flex flex-col-reverse justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
                <p className="text-xs text-muted-foreground">
                  <LockKeyhole size={13} className="mr-1 inline" />
                  Editing is restricted for demo accounts.
                </p>

                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-primary-foreground opacity-50"
                >
                  <Save size={17} />
                  Save Profile Changes
                </button>
              </div>
            </section>

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
                    This is a demonstration owner account. Your profile
                    information is available for preview purposes only. Changes
                    to personal information and profile images cannot be saved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardPagePlaceholder>
  );
};

export default OwnerProfile;
