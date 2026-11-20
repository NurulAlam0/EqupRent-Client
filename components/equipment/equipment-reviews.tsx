"use client";

import * as React from "react";
import { LoaderCircle, Star } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/auth-context";

type EligibleBooking = {
  _id: string;
  startDate: string;
  endDate: string;
};

type EquipmentReviewItem = {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type ReviewData = {
  items: EquipmentReviewItem[];
  eligibleBookings: EligibleBooking[];
  hasCompletedRental: boolean;
  rating: number;
  reviews: number;
};

type ReviewSummary = Pick<ReviewData, "rating" | "reviews">;

function rentalDateRange(booking: EligibleBooking) {
  const start = new Date(booking.startDate).toLocaleDateString();
  const end = new Date(booking.endDate).toLocaleDateString();
  return `${start} – ${end}`;
}

export function EquipmentReviews({
  equipmentId,
  userRole,
  onSummaryChange,
}: {
  equipmentId: string;
  userRole: string;
  onSummaryChange: (summary: ReviewSummary) => void;
}) {
  const [result, setResult] = React.useState<{
    forId: string;
    data: ReviewData | null;
    error: string | null;
  } | null>(null);
  const [retry, setRetry] = React.useState(0);
  const [bookingId, setBookingId] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const current = result?.forId === equipmentId ? result : null;
  const data = current?.data ?? null;
  const error = current?.error ?? null;
  const loading = !current;

  React.useEffect(() => {
    let cancelled = false;

    api<ReviewData>(`/api/reviews/equipment/${equipmentId}`)
      .then((response) => {
        if (cancelled) return;
        setResult({ forId: equipmentId, data: response, error: null });
        setBookingId(response.eligibleBookings[0]?._id ?? "");
        onSummaryChange({
          rating: response.rating,
          reviews: response.reviews,
        });
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setResult({
            forId: equipmentId,
            data: null,
            error: err.message || "Could not load reviews.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [equipmentId, onSummaryChange, retry]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data || !bookingId || submitting) return;

    setSubmitting(true);
    try {
      const response = await api<{
        item: EquipmentReviewItem;
        rating: number;
        reviews: number;
      }>(`/api/reviews/equipment/${equipmentId}`, {
        method: "POST",
        body: JSON.stringify({ bookingId, rating, comment }),
      });
      const nextData = {
        ...data,
        items: [response.item, ...data.items],
        eligibleBookings: data.eligibleBookings.filter(
          (booking) => booking._id !== bookingId
        ),
        rating: response.rating,
        reviews: response.reviews,
      };
      setResult({ forId: equipmentId, data: nextData, error: null });
      setBookingId(nextData.eligibleBookings[0]?._id ?? "");
      setRating(5);
      setComment("");
      onSummaryChange({
        rating: response.rating,
        reviews: response.reviews,
      });
      toast.success("Your review was added.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not submit your review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

  return (
    <section className="mt-6 rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Reviews &amp; comments
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {data
              ? data.reviews > 0
                ? `${data.rating.toFixed(1)} out of 5 · ${data.reviews} review${data.reviews === 1 ? "" : "s"}`
                : "No reviews yet"
              : "Customer feedback"}
          </p>
        </div>
        {loading ? (
          <LoaderCircle
            className="size-5 animate-spin text-blue-700"
            aria-label="Loading reviews"
          />
        ) : null}
      </div>

      {error ? (
        <div className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
          <p>Could not load reviews: {error}</p>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setRetry((current) => current + 1);
            }}
            className="mt-2 font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      ) : null}

      {!error && data ? (
        <>
          {userRole === "customer" && data.eligibleBookings.length > 0 ? (
            <form
              onSubmit={handleSubmit}
              className="mt-5 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100 sm:p-5"
            >
              <h3 className="font-semibold text-slate-900">
                Share your rental experience
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Reviews are available after a paid rental is completed.
              </p>

              {data.eligibleBookings.length > 1 ? (
                <label className="mt-4 block text-xs font-semibold text-slate-700">
                  Completed rental
                  <select
                    value={bookingId}
                    onChange={(event) => setBookingId(event.target.value)}
                    className={inputClass}
                    required
                  >
                    {data.eligibleBookings.map((booking) => (
                      <option key={booking._id} value={booking._id}>
                        {rentalDateRange(booking)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="mt-4 text-xs text-slate-600">
                  Rental dates: {rentalDateRange(data.eligibleBookings[0])}
                </p>
              )}

              <fieldset className="mt-4">
                <legend className="text-xs font-semibold text-slate-700">
                  Your rating
                </legend>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`Rate ${value} out of 5`}
                      aria-pressed={rating === value}
                      onClick={() => setRating(value)}
                      className="rounded p-1 transition hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                      <Star
                        className={`size-6 ${
                          value <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-slate-700">
                    {rating}/5
                  </span>
                </div>
              </fieldset>

              <label className="mt-4 block text-xs font-semibold text-slate-700">
                Comment
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  minLength={3}
                  maxLength={1000}
                  placeholder="What was your experience with this equipment?"
                  className={`${inputClass} resize-y`}
                  required
                />
              </label>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  {comment.length}/1000 characters
                </span>
                <button
                  type="submit"
                  disabled={
                    submitting || !bookingId || comment.trim().length < 3
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0b1f8f] px-4 text-sm font-semibold text-white transition hover:bg-[#091674] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden />
                  ) : null}
                  {submitting ? "Submitting..." : "Submit review"}
                </button>
              </div>
            </form>
          ) : null}

          {userRole === "customer" &&
          data.eligibleBookings.length === 0 &&
          data.hasCompletedRental ? (
            <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
              You have reviewed all your completed rentals for this equipment.
            </p>
          ) : null}

          {data.items.length > 0 ? (
            <div className="mt-5 divide-y divide-slate-100">
              {data.items.map((review) => (
                <article key={review._id} className="py-5 first:pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                        {review.customerName.slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {review.customerName}
                        </p>
                        <p className="text-xs text-slate-500">
                          Verified rental ·{" "}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-0.5"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          aria-hidden
                          className={`size-4 ${
                            value <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {review.comment}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No reviews yet. A review can be added after a paid rental is
              completed.
            </p>
          )}
        </>
      ) : null}
    </section>
  );
}
