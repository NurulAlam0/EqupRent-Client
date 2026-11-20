"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { API_URL } from "@/lib/auth-context";

type Review = {
  _id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/** Two-letter initials for the avatar chip. */
function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden
          className={`size-4 ${
            i <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.article
      variants={fadeUp}
      className="group flex h-full flex-col rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.12)]"
    >
      <Stars rating={review.rating} />
      <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">
        &ldquo;{review.comment}&rdquo;
      </p>
      <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0b1f8f] to-blue-500 text-sm font-bold text-white"
        >
          {initials(review.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {review.name}
          </p>
          <p className="truncate text-xs text-slate-500">{review.location}</p>
        </div>
      </div>
    </motion.article>
  );
}

/** Placeholder shown while the review feed loads. */
function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-100">
      <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
        <div className="size-10 animate-pulse rounded-full bg-slate-100" />
        <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

/**
 * Customer Reviews — 4+ reviews from MongoDB (GET /api/reviews).
 * Stars, comment, initials avatar, name and location per card.
 */
export function Reviews() {
  const [items, setItems] = useState<Review[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/reviews`)
      .then((res) =>
        res.ok
          ? res.json()
          : Promise.reject(new Error(`HTTP ${res.status}`))
      )
      .then((data: { items: Review[] }) => {
        if (!cancelled) setItems(data.items);
      })
      .catch(() => {
        // API unreachable — show the empty state instead of a broken grid.
        if (!cancelled) setItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {/* Heading: flanking dashes + title + subtitle */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-4"
          >
            <span aria-hidden className="h-px w-10 bg-slate-300 sm:w-16" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Customer Reviews
            </h2>
            <span aria-hidden className="h-px w-10 bg-slate-300 sm:w-16" />
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base"
          >
            Real experiences from renters across Bangladesh
          </motion.p>
        </motion.div>

        {/* Review cards.
            Skeletons render as plain divs while loading; the animated grid only
            mounts once real cards exist. Otherwise whileInView would fire (once)
            during the loading state and the later-mounted cards would stay at
            opacity 0 forever. */}
        {items === null ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4"
          >
            {items.length === 0 ? (
              <div className="col-span-full rounded-2xl bg-white p-10 text-center ring-1 ring-slate-100">
                <p className="font-semibold text-slate-700">
                  No reviews yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Customer reviews will appear here as soon as rentals are
                  completed.
                </p>
              </div>
            ) : (
              items.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
