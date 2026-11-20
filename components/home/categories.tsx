"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const CATEGORIES = [
  {
    name: "Construction Equipment",
    desc: "Heavy machinery, drills and power tools",
    count: 24,
    image: "/image/cat-construction.jpg",
  },
  {
    name: "Photography Equipment",
    desc: "Cameras, drones and lighting gear",
    count: 18,
    image: "/image/cat-photography.jpg",
  },
  {
    name: "Vehicles & Transportation",
    desc: "Cars, vans and transport solutions",
    count: 31,
    image: "/image/cat-vehicles.jpg",
  },
  {
    name: "Agriculture Equipment",
    desc: "Tractors, harvesters and farm gear",
    count: 16,
    image: "/image/cat-agriculture.jpg",
  },
  {
    name: "Electronics",
    desc: "Laptops, audio systems and devices",
    count: 42,
    image: "/image/cat-electronics.jpg",
  },
  {
    name: "Event Equipment",
    desc: "Stages, sound systems and lighting",
    count: 12,
    image: "/image/cat-event.jpg",
  },
];

/**
 * Popular Categories — thumbnail card grid on the home page.
 * Counts are placeholders until the equipment API is wired up.
 */
export function Categories() {
  return (
    <section className="bg-[#faf7f2] py-16 sm:py-20">
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
              Popular Categories
            </h2>
            <span aria-hidden className="h-px w-10 bg-slate-300 sm:w-16" />
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base"
          >
            Explore verified equipment categories from our real-time database
          </motion.p>
        </motion.div>

        {/* Category cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-6"
        >
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.name} variants={fadeUp} className="h-full">
              <Link
                href={`/equipment?category=${encodeURIComponent(cat.name)}`}
                className="group flex h-full flex-col items-center rounded-2xl bg-white p-5 text-center shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)]"
              >
                <span className="overflow-hidden rounded-xl ring-1 ring-slate-100">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={64}
                    height={64}
                    className="size-16 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-slate-900 sm:text-[15px]">
                  {cat.name}
                </h3>
                <p className="mt-1.5 mb-3 line-clamp-2 text-xs leading-5 text-slate-500">
                  {cat.desc}
                </p>
                <span className="mt-auto inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
                  {cat.count} items
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
