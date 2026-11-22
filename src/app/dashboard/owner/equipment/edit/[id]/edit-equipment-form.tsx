"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  ImagePlus,
  Loader2Icon,
  MapPin,
  Package,
  Save,
  Trash2,
} from "lucide-react";
import {
  fetchOwnerEquipmentById,
  updateOwnerEquipment,
  type Equipment,
  type EquipmentInput,
} from "@/lib/equipment";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

const FALLBACK_IMAGE = "/equipment-fallback.svg";

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

const rentalPeriods = ["Daily", "Weekly", "Monthly"];
const conditions = ["Brand New", "Excellent", "Good", "Fair"];

const emptyForm: EquipmentInput = {
  name: "",
  category: "",
  description: "",
  rentalRate: 0,
  rentalPeriod: "Daily",
  availableStock: 1,
  brand: "",
  model: "",
  condition: "Good",
  location: "",
  rentalTerms: "",
  imageUrls: [],
};

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50";

const labelClass = "mb-2 block text-sm font-semibold text-foreground";

const sectionClass = "rounded-2xl border border-border bg-card p-5 sm:p-7";

const toForm = (equipment: Equipment): EquipmentInput => ({
  name: equipment.name ?? "",
  category: equipment.category ?? "",
  description: equipment.description ?? equipment.shortDescription ?? "",
  rentalRate: Number(equipment.rentalRate ?? 0),
  rentalPeriod: equipment.rentalPeriod ?? "Daily",
  availableStock: Number(equipment.availableStock ?? 1),
  brand: equipment.brand ?? "",
  model: equipment.model ?? "",
  condition: equipment.condition ?? "Good",
  location: equipment.location ?? "",
  rentalTerms: equipment.rentalTerms ?? "",
  imageUrls: Array.isArray(equipment.images)
    ? equipment.images
    : equipment.image
      ? [equipment.image]
      : [],
});

const FormSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-40 rounded-2xl" />
    <Skeleton className="h-64 rounded-2xl" />
    <Skeleton className="h-56 rounded-2xl" />
    <Skeleton className="h-72 rounded-2xl" />
  </div>
);

const EditEquipmentForm = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [form, setForm] = useState<EquipmentInput>(emptyForm);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      queueMicrotask(() => {
        setLoadError("No equipment was specified.");
        setLoading(false);
      });
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      try {
        const item = await fetchOwnerEquipmentById(id, controller.signal);

        if (controller.signal.aborted) return;

        if (!item) {
          setLoadError("Equipment not found.");
          return;
        }

        const values = toForm(item);
        queueMicrotask(() => {
          setEquipment(item);
          setForm(values);
        });
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setLoadError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load this equipment.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void load();

    return () => controller.abort();
  }, [id]);

  const setField = <K extends keyof EquipmentInput>(
    field: K,
    value: EquipmentInput[K],
  ) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setError("");
  };

  const setText =
    (field: Exclude<keyof EquipmentInput, "imageUrls">) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setField(field, event.target.value as EquipmentInput[typeof field]);
    };

  const setNumber =
    (field: "rentalRate" | "availableStock") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setField(field, Number(event.target.value));
    };

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;

    if (form.imageUrls.length >= 6) {
      setError("You can add a maximum of 6 images.");
      return;
    }

    setForm((previous) => ({
      ...previous,
      imageUrls: [...previous.imageUrls, url],
    }));
    setNewImageUrl("");
    setError("");
  };

  const updateImageUrl = (index: number, value: string) => {
    setForm((previous) => ({
      ...previous,
      imageUrls: previous.imageUrls.map((url, i) =>
        i === index ? value : url,
      ),
    }));
    setError("");
  };

  const removeImageUrl = (index: number) => {
    setForm((previous) => ({
      ...previous,
      imageUrls: previous.imageUrls.filter((_, i) => i !== index),
    }));
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || saving) return;

    const imageUrls = form.imageUrls.map((url) => url.trim()).filter(Boolean);

    if (
      !form.name.trim() ||
      !form.category.trim() ||
      !form.description.trim() ||
      !form.rentalPeriod.trim() ||
      !form.location.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (
      !Number.isFinite(form.rentalRate) ||
      form.rentalRate <= 0 ||
      !Number.isInteger(form.availableStock) ||
      form.availableStock < 0
    ) {
      setError(
        "Rental price must be positive and available quantity cannot be negative.",
      );
      return;
    }

    if (imageUrls.length > 6) {
      setError("You can add a maximum of 6 images.");
      return;
    }

    const payload: EquipmentInput = {
      ...form,
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      rentalPeriod: form.rentalPeriod.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      condition: form.condition.trim(),
      location: form.location.trim(),
      rentalTerms: form.rentalTerms.trim(),
      imageUrls,
    };

    setSaving(true);
    setError("");

    try {
      await updateOwnerEquipment(id, payload);

      toast.add({
        type: "success",
        title: "Equipment updated successfully",
        description: `${payload.name} has been updated.`,
        timeout: 5000,
      });

      router.push("/dashboard/owner/equipment");
      router.refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Could not save your changes.";
      setError(message);
      toast.add({
        type: "error",
        title: "Could not update equipment",
        description: message,
        timeout: 6000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-6 h-5 w-40" />
        <Skeleton className="mb-8 h-10 w-72 max-w-full" />
        <FormSkeleton />
      </div>
    );
  }

  if (loadError || !equipment) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <AlertCircle className="size-7" />
        </div>
        <h1 className="text-xl font-bold text-foreground">
          Could not open this listing
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {loadError || "This equipment is no longer available."}
        </p>
        <Link
          href="/dashboard/owner/equipment"
          className={buttonVariants({ className: "mt-6" })}
        >
          <ArrowLeft />
          Back to My Equipment
        </Link>
      </div>
    );
  }

  const categoryOptions = categories.includes(form.category)
    ? categories
    : [form.category, ...categories];
  const periodOptions = rentalPeriods.includes(form.rentalPeriod)
    ? rentalPeriods
    : [form.rentalPeriod, ...rentalPeriods];
  const conditionOptions = conditions.includes(form.condition)
    ? conditions
    : [form.condition, ...conditions];

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/owner/equipment"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to My Equipment
      </Link>

      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
          <Package size={17} />
          EQUIPMENT MANAGEMENT
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Edit Equipment
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Update the details below. Changes are saved to your live GearNest
          listing and sent for admin review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={saving} className="space-y-6">
          <section className={sectionClass}>
            <h2 className="text-lg font-bold text-foreground">
              Basic Information
            </h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              The core details customers see first.
            </p>

            <div className="space-y-5">
              <div>
                <label className={labelClass} htmlFor="edit-name">
                  Equipment Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-name"
                  value={form.name}
                  onChange={setText("name")}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="edit-category">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="edit-category"
                  value={form.category}
                  onChange={setText("category")}
                  required
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select equipment category
                  </option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="edit-description">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="edit-description"
                  value={form.description}
                  onChange={setText("description")}
                  rows={5}
                  required
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-lg font-bold text-foreground">
              Pricing &amp; Availability
            </h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Set your current rental rate and stock quantity.
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="edit-rental-rate">
                  Rental Price (৳) <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-rental-rate"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.rentalRate}
                  onChange={setNumber("rentalRate")}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="edit-rental-period">
                  Rental Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="edit-rental-period"
                  value={form.rentalPeriod}
                  onChange={setText("rentalPeriod")}
                  required
                  className={inputClass}
                >
                  {periodOptions.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="edit-stock">
                  Available Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.availableStock}
                  onChange={setNumber("availableStock")}
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-lg font-bold text-foreground">Specifications</h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Technical details that help customers choose the right equipment.
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="edit-brand">
                  Brand
                </label>
                <input
                  id="edit-brand"
                  value={form.brand}
                  onChange={setText("brand")}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="edit-model">
                  Model
                </label>
                <input
                  id="edit-model"
                  value={form.model}
                  onChange={setText("model")}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="edit-condition">
                  Condition
                </label>
                <select
                  id="edit-condition"
                  value={form.condition}
                  onChange={setText("condition")}
                  className={inputClass}
                >
                  {conditionOptions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <MapPin size={18} className="text-primary" />
              Location
            </h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Where this equipment is available for rent.
            </p>

            <label className={labelClass} htmlFor="edit-location">
              Location (City, Area) <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-location"
              value={form.location}
              onChange={setText("location")}
              required
              className={inputClass}
            />
          </section>

          <section className={sectionClass}>
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Camera size={18} className="text-primary" />
              Image Gallery
            </h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Replace, remove, or add direct image URLs. The first image is used
              as the thumbnail.
            </p>

            {form.imageUrls.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-background px-4 py-6 text-center text-sm text-muted-foreground">
                No images on this listing yet.
              </p>
            ) : (
              <div className="space-y-3">
                {form.imageUrls.map((url, index) => (
                  <div
                    key={`${index}-${url}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
                  >
                    <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      <Image
                        src={url.trim() || FALLBACK_IMAGE}
                        alt={`Image ${index + 1}`}
                        width={56}
                        height={56}
                        unoptimized
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <input
                      value={url}
                      onChange={(event) =>
                        updateImageUrl(index, event.target.value)
                      }
                      placeholder="https://example.com/image.jpg"
                      aria-label={`Image ${index + 1} URL`}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      aria-label={`Remove image ${index + 1}`}
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                value={newImageUrl}
                onChange={(event) => setNewImageUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addImageUrl();
                  }
                }}
                placeholder="https://example.com/new-image.jpg"
                aria-label="New image URL"
                className={inputClass}
              />
              <Button type="button" variant="outline" onClick={addImageUrl}>
                <ImagePlus />
                Add Image
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Up to 6 images. Paste a direct URL and press Enter or Add Image.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="text-lg font-bold text-foreground">
              Rental Terms &amp; Conditions
            </h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Any rules or requirements renters should know.
            </p>
            <textarea
              value={form.rentalTerms}
              onChange={setText("rentalTerms")}
              rows={5}
              placeholder="e.g. Equipment must be returned in its original condition..."
              className={`${inputClass} resize-y`}
            />
          </section>
        </fieldset>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-border pt-6 sm:flex-row">
          <Link
            href="/dashboard/owner/equipment"
            className={buttonVariants({ variant: "outline" })}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <Save />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditEquipmentForm;
