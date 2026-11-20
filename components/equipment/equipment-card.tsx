"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Heart, MapPin, Star, Tag } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites";

export type EquipmentItem = {
  _id: string;
  name: string;
  category: string;
  rentalPrice: number;
  rentalType: string;
  location: string;
  image: string;
  availableQuantity: number;
  rating: number;
  reviews: number;
};

/** Shared dark-navy button style used across the home page. */
export const BTN =
  "inline-flex items-center gap-2 rounded-lg bg-[#0b1f8f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#091674]";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Single equipment card — image, favorite heart, availability badge,
 * category chip, rating, location, price + auth-gated View Details.
 * Shared by the Featured and Popular sections.
 */
export function EquipmentCard({ item }: { item: EquipmentItem }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isFavorite, toggle } = useFavorites();
  const [hearting, setHearting] = useState(false);

  // Read from the shared favorites store so the heart survives a reload
  // and matches the details page and the dashboard table.
  const liked = isFavorite(item._id);

  const detailPath = `/equipment/${item._id}`;
  // Guests go to login (with a return path), signed-in users to the details page.
  const detailHref =
    user === null
      ? `/login?next=${encodeURIComponent(detailPath)}`
      : detailPath;
  const canSaveFavorite = user === null || user?.role === "customer";

  const handleHeart = async () => {
    if (!user) {
      // Save requires an account — come back to this exact page afterwards.
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (hearting) return;
    setHearting(true);
    try {
      const saved = await toggle(item);
      toast.success(saved ? "Saved to favorites" : "Removed from favorites");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update favorites"
      );
    } finally {
      setHearting(false);
    }
  };

  const available = item.availableQuantity > 0;

  return (
    <motion.article
      variants={fadeUp}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.12)]"
    >
      {/* Image + floating badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {canSaveFavorite ? (
          <button
            type="button"
            onClick={handleHeart}
            disabled={hearting}
            aria-label={liked ? "Remove from favorites" : "Add to favorites"}
            className="absolute left-3 top-3 grid size-9 place-items-center rounded-full bg-white/95 shadow-md transition hover:scale-110 disabled:cursor-wait disabled:opacity-60"
          >
            <Heart
              className={`size-4 transition ${
                liked ? "fill-rose-500 text-rose-500" : "text-slate-600"
              }`}
            />
          </button>
        ) : null}
        <span
          className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-md ${
            available ? "bg-emerald-500" : "bg-slate-500"
          }`}
        >
          <span aria-hidden className="size-1.5 rounded-full bg-white" />
          {available ? "Available" : "Rented out"}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-slate-900 transition group-hover:text-blue-600">
          {item.name}
        </h3>
        <span className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
          <Tag className="size-3.5" aria-hidden />
          {item.category}
        </span>
        <div className="mt-3 flex items-center gap-1 text-sm">
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
              <span className="text-slate-400">({item.reviews} reviews)</span>
            </>
          ) : (
            <span className="text-slate-400">No reviews yet</span>
          )}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="size-4 text-slate-400" aria-hidden />
          {item.location}
        </p>

        {/* Price + action pinned to the bottom so all cards align */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p>
            <span className="text-xl font-bold text-blue-600">
              ৳{item.rentalPrice.toLocaleString("en-US")}
            </span>{" "}
            <span className="text-sm text-slate-400">
              / {item.rentalType.toLowerCase()}
            </span>
          </p>
          <Link href={detailHref} className={BTN}>
            View Details <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
