"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImagePlus,
  LoaderCircle,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { Header } from "@/components/layout/header";
import { api, useAuth } from "@/lib/auth-context";

const CATEGORIES = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
] as const;

const RENTAL_TYPES = ["Daily", "Weekly", "Monthly"] as const;

type EquipmentFormValues = {
  name: string;
  description: string;
  category: string;
  location: string;
  rentalPrice: string;
  rentalType: string;
  availableQuantity: string;
  condition: string;
  brand: string;
  model: string;
  image: string;
  rentalTerms: string;
};

type EquipmentRecord = Omit<
  EquipmentFormValues,
  "rentalPrice" | "availableQuantity"
> & {
  rentalPrice: number;
  availableQuantity: number;
};

const INITIAL_VALUES: EquipmentFormValues = {
  name: "",
  description: "",
  category: "",
  location: "",
  rentalPrice: "",
  rentalType: "Daily",
  availableQuantity: "1",
  condition: "",
  brand: "",
  model: "",
  image: "",
  rentalTerms: "",
};

const INPUT =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
const LABEL = "block text-sm font-semibold text-slate-700";

function Field({
  label,
  id,
  className,
  children,
}: {
  label: string;
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function AddEquipmentForm({
  embedded = false,
  equipmentId,
  adminEdit = false,
  onSaved,
}: {
  embedded?: boolean;
  equipmentId?: string;
  adminEdit?: boolean;
  onSaved?: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [values, setValues] =
    React.useState<EquipmentFormValues>(INITIAL_VALUES);
  const [uploading, setUploading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [loadingExisting, setLoadingExisting] = React.useState(
    Boolean(equipmentId)
  );

  React.useEffect(() => {
    if (user && user.role !== "owner" && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [router, user]);

  React.useEffect(() => {
    if (!equipmentId) return;
    let cancelled = false;
    api<{ item: EquipmentRecord }>(`/api/equipment/${equipmentId}`)
      .then(({ item }) => {
        if (cancelled) return;
        setValues({
          name: item.name,
          description: item.description,
          category: item.category,
          location: item.location,
          rentalPrice: String(item.rentalPrice),
          rentalType: item.rentalType,
          availableQuantity: String(item.availableQuantity),
          condition: item.condition,
          brand: item.brand,
          model: item.model,
          image: item.image,
          rentalTerms: item.rentalTerms,
        });
        setLoadingExisting(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        toast.error(
          err instanceof Error ? err.message : "Could not load this listing."
        );
        setLoadingExisting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [equipmentId]);

  const update = (key: keyof EquipmentFormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== "string") {
            reject(new Error("Could not read the selected image."));
            return;
          }
          resolve(reader.result);
        };
        reader.onerror = () => reject(new Error("Could not read the selected image."));
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",")[1];
      if (!base64) throw new Error("Could not read the selected image.");
      const uploaded = await api<{ url: string }>("/api/equipment/upload-image", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: base64,
      });
      update("image", uploaded.url);
      toast.success("Equipment image uploaded.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload this image."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || uploading) return;
    setSubmitting(true);
    try {
      const result = await api<{ item: { _id: string } }>(
        equipmentId
          ? adminEdit
            ? `/api/admin/equipment/${equipmentId}`
            : `/api/equipment/${equipmentId}`
          : "/api/equipment",
        {
        method: equipmentId ? "PATCH" : "POST",
        body: JSON.stringify({
          ...values,
          rentalPrice: Number(values.rentalPrice),
          availableQuantity: Number(values.availableQuantity),
        }),
        }
      );
      toast.success(
        adminEdit
          ? "Equipment updated."
          : equipmentId
          ? "Equipment updated and sent for approval."
          : "Equipment submitted for approval."
      );
      if (onSaved) {
        onSaved();
      } else {
        router.push(
          equipmentId
            ? adminEdit
              ? "/dashboard/admin/equipment"
              : "/dashboard/owner/my-equipment"
            : `/equipment/${result.item._id}`
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not submit equipment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || (user.role !== "owner" && user.role !== "admin")) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#faf7f2]">
        <LoaderCircle className="size-9 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "relative min-h-screen bg-[#faf7f2]"}>
      {!embedded ? (
        <>
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-48"
            style={{
              background:
                "linear-gradient(135deg, #071a9e 0%, #1140f0 42%, #1a63ff 66%, #1f9bff 100%)",
            }}
          />
          <Header />
        </>
      ) : null}
      <main
        className={
          embedded
            ? ""
            : "relative mx-auto max-w-4xl px-5 pt-28 pb-16 sm:px-6 sm:pt-32"
        }
      >
        {!embedded ? (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to dashboard
          </Link>
        ) : null}

        <section
          className={`${embedded ? "" : "mt-6"} rounded-3xl bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 sm:p-8`}
        >
          <div className="mb-7">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <ImagePlus className="size-5" aria-hidden />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {adminEdit
                ? "Update equipment"
                : equipmentId
                  ? "Update your equipment"
                  : "List your equipment"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {adminEdit
                ? "Edit the equipment listing and save your changes."
                : equipmentId
                ? "Keep your listing details accurate. Updated listings are reviewed before appearing publicly."
                : "Add accurate details so renters know what they can book. New listings are reviewed before appearing publicly."}
            </p>
          </div>

          {!adminEdit ? (
            <div className="mb-6 grid gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm sm:grid-cols-2">
              <p className="text-slate-600">
                Listing status:{" "}
                <span className="font-semibold text-amber-700">
                  Pending approval
                </span>
              </p>
              <p className="text-slate-600 sm:text-right">
                Owner: <span className="font-semibold">{user.name}</span>
                <span className="block text-xs text-slate-500">
                  {user.email}
                </span>
              </p>
            </div>
          ) : null}

          {loadingExisting ? (
            <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
              <LoaderCircle className="mx-auto mb-2 size-5 animate-spin text-blue-700" />
              Loading equipment details...
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Equipment name" id="equipment-name">
                <input
                  id="equipment-name"
                  className={INPUT}
                  value={values.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="e.g. Compact excavator"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </Field>
              <Field label="Category" id="equipment-category">
                <select
                  id="equipment-category"
                  className={INPUT}
                  value={values.category}
                  onChange={(event) => update("category", event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Brand" id="equipment-brand">
                <input
                  id="equipment-brand"
                  className={INPUT}
                  value={values.brand}
                  onChange={(event) => update("brand", event.target.value)}
                  placeholder="Brand name"
                  required
                />
              </Field>
              <Field label="Model" id="equipment-model">
                <input
                  id="equipment-model"
                  className={INPUT}
                  value={values.model}
                  onChange={(event) => update("model", event.target.value)}
                  placeholder="Model or version"
                  required
                />
              </Field>
              <Field label="Condition" id="equipment-condition">
                <input
                  id="equipment-condition"
                  className={INPUT}
                  value={values.condition}
                  onChange={(event) => update("condition", event.target.value)}
                  placeholder="e.g. Excellent"
                  required
                />
              </Field>
              <Field label="Location" id="equipment-location">
                <input
                  id="equipment-location"
                  className={INPUT}
                  value={values.location}
                  onChange={(event) => update("location", event.target.value)}
                  placeholder="City, district"
                  required
                />
              </Field>
            </div>

            <Field label="Description" id="equipment-description">
              <textarea
                id="equipment-description"
                className={`${INPUT} min-h-28 resize-y py-3`}
                value={values.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Describe the equipment, its use, and anything renters should know."
                required
                maxLength={3000}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Rental price (৳)" id="equipment-price">
                <input
                  id="equipment-price"
                  type="number"
                  className={INPUT}
                  value={values.rentalPrice}
                  onChange={(event) => update("rentalPrice", event.target.value)}
                  placeholder="0"
                  min="0.01"
                  step="0.01"
                  required
                />
              </Field>
              <Field label="Rental type" id="equipment-rental-type">
                <select
                  id="equipment-rental-type"
                  className={INPUT}
                  value={values.rentalType}
                  onChange={(event) => update("rentalType", event.target.value)}
                  required
                >
                  {RENTAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Available quantity" id="equipment-quantity">
                <input
                  id="equipment-quantity"
                  type="number"
                  className={INPUT}
                  value={values.availableQuantity}
                  onChange={(event) =>
                    update("availableQuantity", event.target.value)
                  }
                  min="1"
                  step="1"
                  required
                />
              </Field>
            </div>

            <Field label="Rental terms and conditions" id="equipment-terms">
              <textarea
                id="equipment-terms"
                className={`${INPUT} min-h-28 resize-y py-3`}
                value={values.rentalTerms}
                onChange={(event) => update("rentalTerms", event.target.value)}
                placeholder="Add pickup, usage, damage, and return conditions."
                required
                maxLength={3000}
              />
            </Field>

            <Field label="Equipment image" id="equipment-image">
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                <label
                  htmlFor="equipment-image"
                  className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
                >
                  {uploading ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Upload className="size-4" aria-hidden />
                  )}
                  {uploading ? "Uploading..." : "Choose image"}
                </label>
                <input
                  id="equipment-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImage}
                  disabled={uploading}
                />
                <span className="text-xs text-slate-500">
                  JPG, PNG or WebP; up to 5 MB. Uploaded securely through ImgBB.
                </span>
              </div>
              {values.image ? (
                <div className="mt-4 flex items-center gap-4 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                    <Image
                      src={values.image}
                      alt="Selected equipment preview"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      Image ready
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {values.image}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ml-auto shrink-0 text-sm font-semibold text-rose-600 hover:text-rose-700"
                    onClick={() => update("image", "")}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  Select an image before submitting your listing.
                </p>
              )}
            </Field>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                href={
                  equipmentId
                    ? adminEdit
                      ? "/dashboard/admin/equipment"
                      : "/dashboard/owner/my-equipment"
                    : "/dashboard"
                }
                className="inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || uploading || !values.image}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0b1f8f] px-6 text-sm font-semibold text-white transition hover:bg-[#091674] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {submitting && (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden />
                )}
                {submitting ? "Submitting..." : "Submit for approval"}
              </button>
            </div>
          </form>
          )}
        </section>
      </main>
    </div>
  );
}
