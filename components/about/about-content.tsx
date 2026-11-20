"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Handshake,
  Plus,
  ShieldCheck,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const STATS = [
  {
    value: "6",
    label: "Equipment categories",
    hint: "Construction to electronics",
  },
  { value: "3", label: "Rental terms", hint: "Daily, weekly or monthly" },
  { value: "4", label: "Simple steps", hint: "Search to getting started" },
  { value: "24/7", label: "Online booking", hint: "Browse and book anytime" },
];

const VALUES = [
  {
    title: "Trust through transparency",
    description:
      "Clear listing details, rental terms, and pricing help you make informed decisions before booking.",
    icon: ShieldCheck,
  },
  {
    title: "Access over ownership",
    description:
      "Find the equipment you need for the time you need it, without the cost of buying and storing it.",
    icon: CircleDollarSign,
  },
  {
    title: "A marketplace for everyone",
    description:
      "Customers can find the right gear, while equipment owners can put useful assets to work.",
    icon: Handshake,
  },
];

/**
 * Answers stick to behaviour that exists in the app — no invented policies.
 */
const FAQS = [
  {
    q: "What equipment can I find on Rentora?",
    a: "Six categories cover construction machinery and power tools, photography gear such as cameras and drones, vehicles and transport, agriculture equipment, electronics, and event gear including stages, sound and lighting.",
  },
  {
    q: "How does renting work?",
    a: "Search or browse the equipment list, open a listing to check its availability, rental terms and total price, choose your dates, then complete checkout. Everything you need to decide is shown before you pay.",
  },
  {
    q: "Do I need an account to browse?",
    a: "No — anyone can browse the equipment list and categories. An account is needed to view full listing details, book equipment, save favourites or list your own gear.",
  },
  {
    q: "Can I rent for more than one day?",
    a: "Yes. Owners set daily, weekly and monthly rates, and the booking form lets you pick exactly the dates your project needs.",
  },
  {
    q: "How are payments handled?",
    a: "Checkout is handled by Stripe. The listing shows the rental rate and the full total before you confirm the booking, so the price you review is the price you pay.",
  },
  {
    q: "How do I list my own equipment?",
    a: "Ask an administrator to grant your account owner access. Once enabled, you can add equipment, set your rates and manage listings from the owner dashboard.",
  },
];

function SectionIntro({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700 sm:text-sm">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {sub ? (
        <p className="mt-4 text-base leading-7 text-slate-600">{sub}</p>
      ) : null}
    </div>
  );
}

/**
 * About page body — hero, mission, stats, values and FAQ.
 * Kept as a client component so it can use the same framer-motion reveals as
 * the home page sections; `metadata` stays in app/about/page.tsx.
 */
export function AboutContent() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#071a9e] via-[#1149d8] to-[#1684e8] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 size-[30rem] rounded-full bg-cyan-300/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -left-32 size-[28rem] rounded-full bg-blue-300/15 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-36 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200 sm:text-sm">
              About Rentora
            </p>
            <h1 className="mt-4 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              The right equipment,{" "}
              <span className="text-cyan-200">right when you need it.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-blue-50/90 sm:text-lg sm:leading-8">
              Rentora makes it easier to find and rent dependable equipment for
              projects, businesses, and big ideas—while helping owners connect
              their gear with people who need it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/equipment"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-[#071a9e] shadow-lg shadow-blue-950/15 transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Explore equipment
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 px-7 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                How it works
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-4 rounded-[2rem] border border-white/15 bg-white/5" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] shadow-2xl shadow-blue-950/30">
              <Image
                src="/image/cat-construction.jpg"
                alt="Professional construction equipment available to rent"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04104f]/85 via-[#04104f]/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <div className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
                  <BadgeCheck aria-hidden="true" className="size-5" />
                  Built around practical access
                </div>
                <p className="mt-2 max-w-sm text-xl font-bold leading-snug text-white sm:text-2xl">
                  Spend less time searching. Spend more time getting things
                  done.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Mission ---------- */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <motion.div variants={fadeUp}>
            <SectionIntro
              eyebrow="Why we are here"
              title="Making equipment access simpler for everyone."
            />
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="space-y-5 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8"
          >
            <p>
              Quality equipment makes a job safer, faster and more successful —
              but buying it outright is rarely practical. Rentora makes renting
              the straightforward alternative.
            </p>
            <p>
              Owners list the gear they already have, renters book the gear they
              need for as long as they need it, and every listing shows its
              rates, availability and terms before any money changes hands.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* ---------- Stats ---------- */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="bg-[#faf7f2] py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <motion.div variants={fadeUp}>
            <SectionIntro
              eyebrow="By the numbers"
              title="Rentora at a glance"
            />
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
          >
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white p-6 text-center shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 sm:p-7"
              >
                <p className="text-4xl font-extrabold tracking-tight text-[#071a9e] sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-3 text-sm font-bold text-slate-900">
                  {stat.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {stat.hint}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ---------- Values ---------- */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="bg-[#faf7f2] py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <motion.div variants={fadeUp}>
            <SectionIntro
              eyebrow="What guides us"
              title="A better way to rent and share"
              sub="Every part of the experience should feel clear, convenient, and dependable."
            />
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="mt-10 grid gap-5 md:grid-cols-3"
          >
            {VALUES.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="group rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.12)] sm:p-7"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-700 transition-colors duration-300 group-hover:bg-[#0b1f8f] group-hover:text-white">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ---------- FAQ ---------- */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <motion.div variants={fadeUp}>
            <SectionIntro
              eyebrow="Good to know"
              title="Frequently asked questions"
              sub="Everything worth knowing before your first booking — and the answers stick to exactly how the product works."
            />
          </motion.div>
          <motion.div variants={fadeUp} className="space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-slate-200 bg-white transition open:border-blue-200 open:shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-slate-900 sm:px-6 sm:py-5 sm:text-base [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700 transition-colors duration-300 group-open:bg-[#0b1f8f] group-open:text-white"
                  >
                    <Plus className="size-4 transition-transform duration-300 group-open:rotate-45" />
                  </span>
                </summary>
                <p className="px-5 pb-5 text-sm leading-6 text-slate-600 sm:px-6 sm:pb-6">
                  {item.a}
                </p>
              </details>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </>
  );
}
