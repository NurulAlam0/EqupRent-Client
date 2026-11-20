"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarClock, Lock, ShieldCheck, Wallet } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const BENEFITS = [
  {
    title: "Affordable Prices",
    desc: "Budget-friendly daily, weekly and monthly rates — no hidden fees.",
    icon: Wallet,
  },
  {
    title: "Verified Owners",
    desc: "Every listed owner is identity-checked and reviewed by our team.",
    icon: ShieldCheck,
  },
  {
    title: "Flexible Rental Period",
    desc: "Rent by the day, week or month and extend whenever you need.",
    icon: CalendarClock,
  },
  {
    title: "Secure Payments",
    desc: "Stripe-powered checkout keeps every transaction encrypted and safe.",
    icon: Lock,
  },
];

/**
 * Why Choose Us — copy block on the left, four benefit cards on the right.
 * Screenshot layout, Rentora palette (cream section, blue accents).
 */
export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-[#faf7f2] py-16 sm:py-20">
      {/* Soft blue glow to lift the section off the cream */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl lg:h-96 lg:w-96"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_2fr] lg:gap-12">
          {/* Left: heading, copy, CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="flex items-center gap-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              <span aria-hidden className="h-px w-10 bg-slate-300 sm:w-16" />
              Why Choose Us
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base"
            >
              We provide reliable, affordable and hassle-free rental services
              for everyone — transparent pricing, vetted owners and secure
              checkout from booking to return.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-7">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0b1f8f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#091674]"
              >
                Learn More <span aria-hidden>→</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: four benefit cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-4"
          >
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title}
                  variants={fadeUp}
                  className="group flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.12)] sm:p-6"
                >
                  <span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-[#0b1f8f] group-hover:text-white">
                    <Icon className="size-7" aria-hidden strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-4 text-sm font-bold leading-snug text-slate-900 sm:text-[15px]">
                    {b.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
                    {b.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
