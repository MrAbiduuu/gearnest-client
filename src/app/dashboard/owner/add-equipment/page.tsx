"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UploadCloud,
  ImagePlus,
  X,
  Package,
  MapPin,
  Camera,
  Info,
} from "lucide-react";
import Image from "next/image";
import DashboardPagePlaceholder from "@/app/component/DashboardPagePlaceholder";

interface AddEquipmentFormProps {
  isDemoAccount?: boolean;
  onSubmit?: (formData: FormData) => Promise<void> | void;
}

const categories = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
  "Cleaning Equipment",
  "Material Handling",
  "Power Equipment",
];

const AddEquipmentForm = ({
  isDemoAccount = false,
  onSubmit,
}: AddEquipmentFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImages = (files: FileList | null) => {
    if (!files) return;

    const selected = Array.from(files);

    if (images.length + selected.length > 6) {
      setError("You can upload a maximum of 6 images.");
      return;
    }

    const invalid = selected.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type,
        ) || file.size > 10 * 1024 * 1024,
    );

    if (invalid) {
      setError("Only JPEG, PNG, WEBP, and GIF images under 10MB are allowed.");
      return;
    }

    setError("");
    setImages((prev) => [...prev, ...selected]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isDemoAccount || !onSubmit) return;

    const formData = new FormData(e.currentTarget);

    images.forEach((image) => {
      formData.append("images", image);
    });

    const urls = imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    formData.append("imageUrls", JSON.stringify(urls));

    try {
      setLoading(true);
      setError("");
      await onSubmit(formData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to publish equipment.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50";

  const labelClass = "mb-2 block text-sm font-semibold text-foreground";

  const sectionClass = "rounded-2xl border border-border bg-card p-5 sm:p-7";

  return (
    <DashboardPagePlaceholder
      title="Add Equipment"
      description="List a new item and start earning from rentals."
    >
      <div className="min-h-screen bg-background pb-16">
        <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <Link
            href="/dashboard/owner/equipment"
            className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft size={16} />
            Back to My Equipment
          </Link>

          {/* Page Heading */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
              <Package size={17} />
              EQUIPMENT MANAGEMENT
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              List New Machinery or Gear
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Provide accurate specifications, quality images, and competitive
              rental rates to get your equipment verified and rented faster.
            </p>
          </div>

          {/* Demo Account Notice */}
          {isDemoAccount && (
            <div className="mb-7 flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              <Info className="mt-0.5 shrink-0 text-amber-600" size={20} />

              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Demo Owner Account – Read-Only Mode
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Creating new equipment listings is disabled for demo accounts.
                  You can explore the form, but publishing is unavailable.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset disabled={isDemoAccount || loading} className="space-y-6">
              {/* Basic Information */}
              <section className={sectionClass}>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground">
                    Basic Information
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start with the essential details of your equipment.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>
                      Equipment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      required
                      placeholder="e.g. Professional Hydraulic Excavator"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      required
                      defaultValue=""
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Select equipment category
                      </option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      required
                      rows={5}
                      placeholder="Describe your equipment, its features, capabilities, and ideal usage..."
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                </div>
              </section>

              {/* Pricing and Availability */}
              <section className={sectionClass}>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground">
                    Pricing & Availability
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Set your rental rate and available quantity.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Rental Price (৳ / $){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="rentalRate"
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      placeholder="e.g. 2500"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Rental Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="rentalPeriod"
                      required
                      defaultValue=""
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Select rental type
                      </option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      Available Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="availableStock"
                      type="number"
                      min="1"
                      required
                      placeholder="Number of available units"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              {/* Specifications */}
              <section className={sectionClass}>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground">
                    Equipment Specifications
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add technical information to help customers make decisions.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Brand</label>
                    <input
                      name="brand"
                      placeholder="e.g. Caterpillar"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Model</label>
                    <input
                      name="model"
                      placeholder="e.g. CAT 320D"
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Condition</label>
                    <select
                      name="condition"
                      defaultValue="Good"
                      className={inputClass}
                    >
                      <option value="Brand New">Brand New</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Location */}
              <section className={sectionClass}>
                <div className="mb-6">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <MapPin size={19} className="text-primary" />
                    Equipment Location
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Let customers know where your equipment is available.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>
                    Location (City, Area){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="location"
                    required
                    placeholder="e.g. Banasree, Dhaka"
                    className={inputClass}
                  />
                </div>
              </section>

              {/* Image Gallery */}
              <section className={sectionClass}>
                <div className="mb-6">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <Camera size={19} className="text-primary" />
                    Equipment Gallery
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload up to 6 high-quality photos of your equipment.
                  </p>
                </div>

                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleImages(e.dataTransfer.files);
                  }}
                  className="cursor-pointer rounded-2xl border-2 border-dashed border-border bg-background px-5 py-10 text-center transition hover:border-primary hover:bg-primary/5"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <UploadCloud size={27} />
                  </div>

                  <h3 className="font-semibold text-foreground">
                    Click to browse or drag and drop images
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Upload JPEG, PNG, WEBP, or GIF
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Maximum 10MB per image · Up to 6 photos
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                    <ImagePlus size={16} />
                    Browse Images
                  </span>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      handleImages(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">
                        Selected Images
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {images.length}/6 photos
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {images.map((image, index) => (
                        <div
                          key={`${image.name}-${index}`}
                          className="group relative overflow-hidden rounded-xl border border-border"
                        >
                          <Image
                            width={300}
                            height={100}
                            src={URL.createObjectURL(image)}
                            alt={image.name}
                            className="aspect-4/3 w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white opacity-100 transition hover:bg-red-500"
                          >
                            <X size={15} />
                          </button>

                          <p className="truncate bg-card px-2 py-2 text-xs text-muted-foreground">
                            {image.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Image URLs */}
                <div className="mt-7">
                  <label className={labelClass}>
                    Or Add Image URLs Manually
                  </label>
                  <textarea
                    value={imageUrls}
                    onChange={(e) => setImageUrls(e.target.value)}
                    rows={4}
                    placeholder={
                      "https://example.com/image-1.jpg\nhttps://example.com/image-2.jpg"
                    }
                    className={`${inputClass} resize-y`}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Add one image URL per line. These URLs will be included
                    alongside your uploaded images.
                  </p>
                </div>
              </section>

              {/* Rental Terms */}
              <section className={sectionClass}>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground">
                    Rental Terms & Conditions
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Specify any additional rules or requirements for renting.
                  </p>
                </div>

                <textarea
                  name="rentalTerms"
                  rows={5}
                  placeholder="e.g. Equipment must be returned in its original condition. Late returns may incur additional charges..."
                  className={`${inputClass} resize-y`}
                />
              </section>
            </fieldset>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col-reverse justify-end gap-3 border-t border-border pt-6 sm:flex-row">
              <Link
                href="/dashboard/owner/equipment"
                className="inline-flex items-center justify-center rounded-xl border border-border px-7 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isDemoAccount || loading || !onSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Publishing..." : "Publish Equipment"}
                {!loading && <ArrowLeft size={16} className="rotate-180" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardPagePlaceholder>
  );
};

export default AddEquipmentForm;
