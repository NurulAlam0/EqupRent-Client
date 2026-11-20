"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CreditCard,
  Heart,
  LoaderCircle,
  MapPin,
  Package,
  Star,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BTN } from "@/components/equipment/equipment-card";
import { EquipmentReviews } from "@/components/equipment/equipment-reviews";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, useAuth } from "@/lib/auth-context";
import { useFavorites, type FavoriteEquipment } from "@/lib/favorites";

/** Same gradient strip the dashboard sits under, so the header stays legible. */
const STRIP = "linear-gradient(135deg, #071a9e 0%, #1140f0 42%, #1a63ff 66%, #1f9bff 100%)";

const CHIP =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium";

type OwnerInfo = {
  name: string;
  email: string;
  photo: string;
  role: string;
  createdAt: string;
};

type EquipmentDetail = FavoriteEquipment & {
  description: string;
  brand: string;
  model: string;
  condition: string;
  rentalTerms: string;
  status: string;
  owner: OwnerInfo | null;
};

/* ------------------------------------------------------------------ */
/* Shared page chrome: gradient strip + navbar + footer                */
/* ------------------------------------------------------------------ */

/**
 * Shared page chrome: gradient strip + navbar + footer.
 * `header={false}` is used by the loading boundary's static fallback —
 * Header reads usePathname, which cannot be prerendered.
 */
function PageShell({
  children,
  header = true,
}: {
  children: React.ReactNode;
  header?: boolean;
}) {
  return (
    <div className="relative min-h-screen bg-[#faf7f2]">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-48"
        style={{ background: STRIP }}
      />
      {header && <Header />}
      <main className="relative mx-auto max-w-7xl px-5 pt-32 pb-20 sm:px-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}

/**
 * "Back to Equipment" — returns to wherever the visitor came from
 * (home cards today, the All Equipment list once it ships) and falls back
 * to home on a direct load so it can never land on a 404.
 */
/**
 * "Back to Equipment" — returns to the exact previous page when we can see
 * it is one of ours (same-tab App Router navigation), otherwise falls home.
 * A freshly opened tab would back into about:blank, so the previous entry
 * must be same-origin before history.back() is used.
 */
function useBackToEquipment() {
  const router = useRouter();
  return React.useCallback(() => {
    let previousIsOurs = false;
    try {
      const nav = (
        window as unknown as {
          navigation?: { entries?: () => Array<{ url: string }> };
        }
      ).navigation;
      const entries = nav?.entries?.() ?? [];
      const previous = entries[entries.length - 2];
      previousIsOurs = Boolean(
        previous && previous.url.startsWith(window.location.origin)
      );
    } catch {
      previousIsOurs = false;
    }

    if (previousIsOurs) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);
}

function BackLink() {
  const goBack = useBackToEquipment();
  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex items-center gap-2 text-sm font-medium text-white/85 transition-colors hover:text-white"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Back to Equipment
    </button>
  );
}

/** Placeholder grid shared by the runtime skeleton and the route fallback. */
function SkeletonBody() {
  return (
    <>
      <div className="h-4 w-40 animate-pulse rounded-full bg-white/30" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 sm:p-7">
          <div className="aspect-[16/10] animate-pulse rounded-xl bg-slate-100" />
          <div className="mt-5 flex gap-2">
            <div className="h-6 w-40 animate-pulse rounded-full bg-slate-100" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="mt-4 h-9 w-2/3 animate-pulse rounded bg-slate-100" />
          <div className="mt-3 h-4 w-48 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-5">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-44 animate-pulse rounded-2xl bg-white ring-1 ring-slate-100" />
          <div className="h-40 animate-pulse rounded-2xl bg-white ring-1 ring-slate-100" />
        </div>
      </div>
    </>
  );
}

/** Full skeleton (navbar included) — rendered at runtime, where the
 *  pathname is known: while the session hydrates and the API responds. */
export function EquipmentDetailsSkeleton() {
  return (
    <PageShell>
      <SkeletonBody />
    </PageShell>
  );
}

/**
 * Hook-free twin used as the loading boundary's prerenderable fallback.
 * Header reads usePathname, which Next can only resolve at runtime — this
 * keeps the static shell valid and lets the navbar stream in behind it.
 */
export function EquipmentDetailsLoadingFallback() {
  return (
    <PageShell header={false}>
      <SkeletonBody />
    </PageShell>
  );
}

/** Owner photo when the account has one, otherwise initials on brand blue. */
function OwnerAvatar({ photo, name }: { photo: string; name: string }) {
  if (photo) {
    return (
      <Image
        src={photo}
        alt=""
        width={48}
        height={48}
        className="size-12 shrink-0 rounded-full object-cover ring-1 ring-slate-100"
      />
    );
  }
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden
      className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0b1f8f] to-blue-500 text-sm font-bold text-white ring-1 ring-slate-100"
    >
      {initials}
    </span>
  );
}

function dateInputValue(daysFromToday: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function RentalRequestForm({
  item,
  canRent,
  disabledReason,
}: {
  item: EquipmentDetail;
  canRent: boolean;
  disabledReason: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [startDate, setStartDate] = React.useState(() => dateInputValue(0));
  const [endDate, setEndDate] = React.useState(() => dateInputValue(1));
  const [quantity, setQuantity] = React.useState(1);
  const [contactPhone, setContactPhone] = React.useState("");
  const [deliveryAddress, setDeliveryAddress] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  const days = Number.isFinite(start) && Number.isFinite(end) && end >= start
    ? Math.floor((end - start) / 86_400_000) + 1
    : 0;
  const periods =
    item.rentalType === "Weekly"
      ? Math.ceil(days / 7)
      : item.rentalType === "Monthly"
        ? Math.ceil(days / 30)
        : days;
  const total = periods * quantity * item.rentalPrice;
  const periodLabel =
    item.rentalType === "Daily"
      ? `${days} day${days === 1 ? "" : "s"}`
      : `${periods} ${item.rentalType.toLowerCase()}${periods === 1 ? "" : "s"}`;
  const maxQuantity = Math.max(1, item.availableQuantity);
  const formInput =
    "mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || days < 1 || quantity > item.availableQuantity) return;

    setSubmitting(true);
    try {
      const checkout = await api<{ url: string }>("/api/bookings/checkout", {
        method: "POST",
        body: JSON.stringify({
          equipmentId: item._id,
          startDate,
          endDate,
          quantity,
          contactNumber: contactPhone,
          deliveryAddress,
          additionalNotes: notes,
        }),
      });
      if (!checkout.url) {
        throw new Error("The payment provider did not return a checkout link.");
      }
      window.location.assign(checkout.url);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not start checkout."
      );
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!item.availableQuantity || !canRent}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:from-blue-800 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-55"
      >
        <CreditCard className="size-4" aria-hidden />
        {!canRent
          ? "Booking unavailable"
          : item.availableQuantity
            ? "Book Now"
            : "Unavailable"}
      </button>
      {!canRent && (
        <p className="mt-2 text-center text-xs text-slate-500">
          {disabledReason}
        </p>
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto border-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-slate-100 px-5 pt-5 pb-4 sm:px-6">
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
            Book {item.name}
          </DialogTitle>
          <DialogDescription>
            Choose your rental dates and provide delivery details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCheckout} className="space-y-4 px-5 pb-5 sm:px-6">
          <div className="flex items-center justify-between rounded-xl bg-[#faf7f2] p-3">
            <span className="text-sm text-slate-600">
              ৳{item.rentalPrice.toLocaleString("en-US")} /{" "}
              {item.rentalType.toLowerCase()}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {item.availableQuantity} available
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="rental-start-date"
                className="text-xs font-semibold text-slate-700"
              >
                Rental start date
              </label>
              <input
                id="rental-start-date"
                type="date"
                min={dateInputValue(0)}
                value={startDate}
                onChange={(event) => {
                  const nextStart = event.target.value;
                  setStartDate(nextStart);
                  if (endDate < nextStart) setEndDate(nextStart);
                }}
                className={formInput}
                required
              />
            </div>
            <div>
              <label
                htmlFor="rental-end-date"
                className="text-xs font-semibold text-slate-700"
              >
                Rental end date
              </label>
              <input
                id="rental-end-date"
                type="date"
                min={startDate}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className={formInput}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="rental-quantity"
              className="text-xs font-semibold text-slate-700"
            >
              Required quantity (max {item.availableQuantity})
            </label>
            <input
              id="rental-quantity"
              type="number"
              min="1"
              max={maxQuantity}
              step="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  Math.min(
                    maxQuantity,
                    Math.max(1, Number(event.target.value) || 1)
                  )
                )
              }
              className={formInput}
              required
            />
          </div>

          <div>
            <label
              htmlFor="rental-contact-phone"
              className="text-xs font-semibold text-slate-700"
            >
              Contact phone
            </label>
            <input
              id="rental-contact-phone"
              type="tel"
              autoComplete="tel"
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
              placeholder="+880 1700 000000"
              className={formInput}
              required
              minLength={7}
              maxLength={30}
            />
          </div>

          <div>
            <label
              htmlFor="rental-delivery-address"
              className="text-xs font-semibold text-slate-700"
            >
              Delivery address
            </label>
            <input
              id="rental-delivery-address"
              autoComplete="street-address"
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              placeholder="House/Plot, Road, Area, City"
              className={formInput}
              required
              minLength={5}
              maxLength={300}
            />
          </div>

          <div>
            <label
              htmlFor="rental-notes"
              className="text-xs font-semibold text-slate-700"
            >
              Additional notes (optional)
            </label>
            <textarea
              id="rental-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Delivery instructions or other details"
              className={`${formInput} min-h-20 resize-y py-2`}
              maxLength={1000}
            />
          </div>

          <div className="rounded-xl bg-[#faf7f2] p-3.5 ring-1 ring-[#eee8df]">
            <div className="flex justify-between gap-3 text-xs text-slate-500">
              <span>
                {days > 0
                  ? `${periodLabel} × ${quantity} × ৳${item.rentalPrice.toLocaleString("en-US")}`
                  : "Choose a valid rental date range"}
              </span>
              <span className="whitespace-nowrap">
                ৳{total.toLocaleString("en-US")}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[#e9e1d7] pt-2">
              <span className="text-sm font-semibold text-slate-800">
                Total due
              </span>
              <span className="text-lg font-bold text-blue-700">
                ৳{total.toLocaleString("en-US")}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              submitting ||
              !item.availableQuantity ||
              days < 1 ||
              quantity > item.availableQuantity
            }
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0b1f8f] px-4 text-sm font-semibold text-white transition hover:bg-[#091674] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : (
              <CreditCard className="size-4" aria-hidden />
            )}
            {submitting ? "Connecting to Stripe..." : "Continue to secure payment"}
          </button>
          <p className="text-center text-xs leading-5 text-slate-500">
            Your final amount and availability are verified securely before
            checkout.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Equipment Details — private route (signed-in users only)            */
/* ------------------------------------------------------------------ */

export function EquipmentDetails({ id }: { id: string }) {
  const router = useRouter();
  const goBack = useBackToEquipment();
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();

  // Result is tagged with the id it belongs to: navigating to another
  // equipment id without a remount therefore drops back to the skeleton
  // instead of briefly showing the previous listing.
  const [result, setResult] = React.useState<{
    forId: string;
    item: EquipmentDetail | null;
    error: string | null;
  } | null>(null);

  const current = result && result.forId === id ? result : null;
  const item = current?.item ?? null;
  const error = current?.error ?? null;
  // Neither settled for THIS id yet → still loading (no setState needed).
  const loading = !item && !error;

  const [saving, setSaving] = React.useState(false);
  const handleReviewSummary = React.useCallback(
    (summary: { rating: number; reviews: number }) => {
      setResult((currentResult) =>
        currentResult?.forId === id && currentResult.item
          ? {
              ...currentResult,
              item: { ...currentResult.item, ...summary },
            }
          : currentResult
      );
    },
    [id]
  );

  // Private route: wait for the session verdict before deciding anything,
  // so reloading this page while signed in never bounces to /login.
  // State only changes inside the async callbacks below, never here.
  React.useEffect(() => {
    if (user === null) {
      router.replace(`/login?next=${encodeURIComponent(`/equipment/${id}`)}`);
      return;
    }
    if (user === undefined) return; // still hydrating

    let cancelled = false;
    api<{ item: EquipmentDetail }>(`/api/equipment/${id}`)
      .then((data) => {
        if (!cancelled) {
          setResult({ forId: id, item: data.item, error: null });
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setResult({ forId: id, item: null, error: err.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, user, router]);

  const handleFavorite = async () => {
    if (saving || !item) return;
    setSaving(true);
    try {
      const nowSaved = await toggle(item);
      toast.success(
        nowSaved ? "Saved to your favorites" : "Removed from favorites"
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update favorites"
      );
    } finally {
      setSaving(false);
    }
  };

  // Signed out (redirect pending) or still hydrating — show the skeleton
  // so no protected content ever flashes on screen.
  if (!user || loading) {
    return <EquipmentDetailsSkeleton />;
  }

  // Load failed or the listing doesn't exist.
  if (error || !item) {
    const notFound = Boolean(error && error.toLowerCase().includes("not found"));
    return (
      <PageShell>
        <BackLink />
        <div className="mt-6 rounded-2xl bg-white p-10 text-center ring-1 ring-slate-100 sm:p-14">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-rose-50 text-rose-500 ring-1 ring-rose-100">
            <Package className="size-6" aria-hidden />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
            {notFound ? "Equipment not found" : "We couldn't load this equipment"}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {error ?? "This listing may have been removed by its owner."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={goBack} className={BTN}>
              <ArrowLeft className="size-4" aria-hidden />
              Back to Equipment
            </button>
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-lg px-5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Go Home
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const available = item.availableQuantity > 0;
  const saved = isFavorite(item._id);

  const specs = [
    { label: "Brand", value: item.brand || "—" },
    { label: "Model", value: item.model || "—" },
    { label: "Condition", value: item.condition || "—" },
    {
      label: "Available Quantity",
      value: `${item.availableQuantity} ${item.availableQuantity === 1 ? "unit" : "units"}`,
    },
  ];

  const terms =
    item.rentalTerms ||
    "Standard rental terms apply. Contact the owner for custom arrangements.";

  const owner = item.owner;
  const memberSince = owner?.createdAt
    ? new Date(owner.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <PageShell>
      <BackLink />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        {/* ---------------- Left: image + equipment information ------- */}
        <article className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 sm:p-7">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 1024px) 100vw, 62vw"
              className="object-cover"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className={`${CHIP} border-slate-200 bg-slate-50 text-slate-500`}>
              <Tag className="size-3.5" aria-hidden />
              {item.category}
            </span>
            <span className={`${CHIP} border-blue-100 bg-blue-50 text-blue-600`}>
              <Clock className="size-3.5" aria-hidden />
              {item.rentalType} Rental
            </span>
            <span
              className={`${CHIP} ${
                available
                  ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                  : "border-rose-200 bg-rose-50 text-rose-600"
              }`}
            >
              <span aria-hidden className="size-1.5 rounded-full bg-current" />
              {available ? "Available" : "Out of Stock"}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {item.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-slate-400" aria-hidden />
              {item.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star
                className={`size-4 ${
                  item.reviews > 0
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                }`}
                aria-hidden
              />
              {item.reviews > 0 ? (
                <>
                  <span className="font-semibold text-slate-900">
                    {item.rating.toFixed(1)}
                  </span>
                  <span className="text-slate-400">
                    ({item.reviews} reviews)
                  </span>
                </>
              ) : (
                <span className="text-slate-400">No reviews yet</span>
              )}
            </span>
          </div>

          <section className="mt-6 border-t border-slate-100 pt-5">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              Description
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-[15px]">
              {item.description}
            </p>
          </section>

          <section className="mt-5 border-t border-slate-100 pt-5">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              Specifications
            </h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {specs.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-100"
                >
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    {s.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-5 border-t border-slate-100 pt-5">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              Rental Terms and Conditions
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-[15px]">
              {terms}
            </p>
          </section>
        </article>

        {/* ---------------- Right: price, booking, owner ---------------- */}
        <aside className="space-y-5 lg:self-start">
          <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3">
              <p>
                <span className="text-3xl font-bold tracking-tight text-blue-600">
                  ৳{item.rentalPrice.toLocaleString("en-US")}
                </span>{" "}
                <span className="text-sm text-slate-400">
                  / {item.rentalType.toLowerCase()}
                </span>
              </p>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white ${
                  available ? "bg-emerald-500" : "bg-slate-500"
                }`}
              >
                <span aria-hidden className="size-1.5 rounded-full bg-white" />
                {available ? "Available" : "Rented out"}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {available
                ? `${item.availableQuantity} ${item.availableQuantity === 1 ? "unit" : "units"} ready to rent`
                : "All units are currently booked"}
            </p>

            <RentalRequestForm
              item={item}
              canRent={user.role === "customer" && owner?.email !== user.email}
              disabledReason={
                owner?.email === user.email
                  ? "You cannot book your own equipment."
                  : "Only customer accounts can book equipment."
              }
            />

            {user.role === "customer" ? (
              <>
                <button
                  type="button"
                  onClick={handleFavorite}
                  disabled={saving}
                  className={`mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    saved
                      ? "border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                      : "border-transparent bg-[#0b1f8f] text-white hover:bg-[#091674]"
                  }`}
                >
                  <Heart
                    className={`size-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`}
                    aria-hidden
                  />
                  {saving
                    ? "Saving..."
                    : saved
                      ? "Saved to Favorites"
                      : "Add to Favorites"}
                </button>
                <p className="mt-3 text-center text-xs text-slate-400">
                  Saved items appear in your dashboard under Favorites.
                </p>
              </>
            ) : null}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              Owner Information
            </h2>
            {owner ? (
              <>
                <div className="mt-4 flex items-center gap-3">
                  <OwnerAvatar photo={owner.photo} name={owner.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {owner.name}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {owner.email}
                    </p>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Role
                    </dt>
                    <dd className="mt-1 text-sm font-semibold capitalize text-slate-900">
                      {owner.role}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Member since
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {memberSince}
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Owner details are unavailable for this listing.
              </p>
            )}
          </div>
        </aside>
      </div>

      <EquipmentReviews
        key={item._id}
        equipmentId={item._id}
        userRole={user.role}
        onSummaryChange={handleReviewSummary}
      />
    </PageShell>
  );
}
