"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/auth-context";
import {
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

/** Placeholder shown while the popular feed loads. */
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
 * Popular Equipment — most-reviewed approved items
 * (GET /api/equipment/popular). One clean row of 4 on wide screens.
 */
export function PopularEquipment() {
  const [items, setItems] = useState<EquipmentItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/equipment/popular`)
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
    <section className="bg-white py-16 sm:py-20">
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
              Popular Equipment
            </h2>
            <span aria-hidden className="h-px w-10 bg-slate-300 sm:w-16" />
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base"
          >
            Most loved by our renters
          </motion.p>
        </motion.div>

        {/* Cards — one row of 4 on xl.
            Skeletons are plain divs; the animated grid mounts only once the
            real cards arrive, so whileInView can't fire early and leave the
            later-mounted cards stuck at opacity 0. */}
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
              <div className="col-span-full rounded-2xl bg-slate-50 p-10 text-center ring-1 ring-slate-100">
                <p className="font-semibold text-slate-700">
                  No popular equipment yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  The most reviewed equipment will show up here.
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
