"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, CircleCheckBig, CreditCard, Search } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const STEPS = [
  { title: "Search", desc: "Find your desired equipment", icon: Search },
  {
    title: "Book",
    desc: "Choose dates & confirm booking",
    icon: Calendar,
  },
  {
    title: "Pay",
    desc: "Complete payment securely",
    icon: CreditCard,
  },
  {
    title: "Enjoy",
    desc: "Get your equipment and get started",
    icon: CircleCheckBig,
  },
];

/**
 * How It Works — four numbered steps beside a captioned image panel.
 * Also the anchor target for the navbar's "How It Works" link.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-[#faf7f2] py-16 sm:py-20"
    >
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
              How It Works
            </h2>
            <span aria-hidden className="h-px w-10 bg-slate-300 sm:w-16" />
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base"
          >
            Get started in just a few simple steps
          </motion.p>
        </motion.div>

        {/* Steps + image panel */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="mt-10 grid gap-6 lg:grid-cols-[3fr_2fr] lg:gap-8"
        >
          {/* Four step cards */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  variants={fadeUp}
                  className="group flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.12)] sm:p-6"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-[#0b1f8f] group-hover:text-white">
                    <Icon className="size-5" aria-hidden strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-3.5 text-sm font-bold text-slate-900 sm:text-[15px]">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Image panel with caption overlay */}
          <motion.div
            variants={fadeUp}
            className="relative min-h-[260px] overflow-hidden rounded-2xl ring-1 ring-slate-100"
          >
            <Image
              src="/image/12.png"
              alt="Yellow excavator working at a construction site at sunset"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-5 pt-16"
            >
              <p className="text-lg font-bold text-white sm:text-xl">
                Make Your Work Easier with{" "}
                <span className="text-blue-400">Rentora</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
