"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/auth-context";
import {
  BTN,
  EquipmentCard,
  type EquipmentItem,
} from "@/components/equipment/equipment-card";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/** Placeholder shown while the featured feed loads. */
function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
      <div className="aspect-[16/10] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-9 w-full animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

/**
 * Featured Equipment — 6 approved items from MongoDB (GET /api/equipment/featured).
 * View Details: guests → Login, signed-in users → Equipment Details page.
 */
export function FeaturedEquipment() {
  const [items, setItems] = useState<EquipmentItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/equipment/featured`)
      .then((res) =>
        res.ok
          ? res.json()
          : Promise.reject(new Error(`HTTP ${res.status}`))
      )
      .then((data: { items: EquipmentItem[] }) => {
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
    <section className="bg-[#faf7f2] pb-4 pt-16 sm:pb-6 sm:pt-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {/* Heading: dash + title + subtitle, View All on the right */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="flex flex-wrap items-start justify-between gap-4"
        >
          <motion.div variants={fadeUp}>
            <h2 className="flex items-center gap-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              <span aria-hidden className="h-px w-10 bg-slate-300 sm:w-16" />
              Featured Equipment
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Top-rated and most rented equipment
            </p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <Link href="/equipment" className={`${BTN} px-5 py-2.5`}>
              View All <span aria-hidden>→</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Cards.
            Skeletons are plain divs; the animated grid mounts only once the
            real cards arrive, so whileInView can't fire early and leave the
            later-mounted cards stuck at opacity 0. */}
        {items === null ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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
            className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
          >
            {items.length === 0 ? (
              <div className="col-span-full rounded-2xl bg-white p-10 text-center ring-1 ring-slate-100">
                <p className="font-semibold text-slate-700">
                  No featured equipment yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Approved equipment will appear here as soon as owners list
                  items.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <EquipmentCard key={item._id} item={item} />
              ))
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
