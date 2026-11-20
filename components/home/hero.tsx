"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, MotionConfig, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "cn";

type Slide = {
  src: string;
  alt: string;
  eyebrow: string;
  heading: string;
  description: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

const SLIDES: Slide[] = [
  {
    src: "/image/12.png",
    alt: "Yellow excavator working at a construction site at sunset",
    eyebrow: "Heavy Machinery",
    heading: "Built for the Toughest Jobs",
    description:
      "Excavators, loaders and earthmovers — serviced, insured and delivered to your site, rentable by the day.",
    primary: { label: "Browse Gear", href: "/equipment" },
    secondary: { label: "How It Works", href: "/#how-it-works" },
  },
  {
    src: "/image/13.png",
    alt: "Camera drone flying over a lake with mountains behind",
    eyebrow: "Aerial & Creative",
    heading: "Capture Every Angle",
    description:
      "Pro drones and gimbals ready for your next shoot — fly today without the price tag of owning.",
    primary: { label: "Rent a Drone", href: "/equipment" },
    secondary: { label: "How It Works", href: "/#how-it-works" },
  },
  {
    src: "/image/14.png",
    alt: "Canon EOS R6 camera with zoom lens on a stone ledge",
    eyebrow: "Cameras & Lenses",
    heading: "Shoot Like a Pro",
    description:
      "Flagship mirrorless bodies and premium glass, cleaned and checked between every single rental.",
    primary: { label: "View Cameras", href: "/equipment" },
    secondary: { label: "Create Account", href: "/register" },
  },
  {
    src: "/image/15.png",
    alt: "White cargo truck driving on a highway",
    eyebrow: "Transport & Logistics",
    heading: "Move More, Spend Less",
    description:
      "From pickups to long-haul trucks — book by the day, hit your deadline and keep costs predictable.",
    primary: { label: "Find a Vehicle", href: "/equipment" },
    secondary: { label: "Sign Up Free", href: "/register" },
  },
];

const AUTOPLAY_MS = 5000;

/** Parent only orchestrates the stagger; each child carries its own motion. */
const copyContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};

const copyItem: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Hero() {
  const [index, setIndex] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);

  /**
   * Autoplay: the interval is recreated whenever `index` changes, so the 5s
   * countdown also resets after manual arrow/dot navigation.
   */
  React.useEffect(() => {
    if (hovered) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [hovered, index]);

  const step = (delta: number) =>
    setIndex((current) => (current + delta + SLIDES.length) % SLIDES.length);

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-label="Featured banners"
        className="relative bg-[#faf7f2] pt-28"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6">
          {/*
            Banner card — spans the same max-w-7xl container as the Featured
            Equipment grid below, so the two widths always line up. Slide ratio
            is the images' own 837/467 on phones/tablets (nothing cropped) and
            a cinematic 16/7 from md up, where object-cover centre-crops ≈21%
            off the top and bottom to keep the banner inside the viewport.
          */}
          <div className="relative mx-auto w-full overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-xl shadow-blue-950/10 sm:rounded-3xl">
            {/* Slide track — one banner at a time, horizontal slide transition */}
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {SLIDES.map((slide, i) => {
                const isActive = i === index;
                return (
                  <div
                    key={slide.src}
                    className="relative aspect-[837/467] w-full shrink-0 md:aspect-[16/7]"
                    inert={!isActive}
                  >
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 1280px) 100vw, 1100px"
                      className="object-cover"
                    />

                    {/* Dark gradient — bottom-up on mobile, left-to-right on sm+ */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#030b3d]/95 via-[#030b3d]/55 to-[#030b3d]/10 sm:bg-gradient-to-r sm:from-[#030b3d]/90 sm:via-[#030b3d]/50 sm:to-[#030b3d]/5"
                    />

                    {/* Copy — pl clears the arrows, which sit at mid-height */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:justify-center sm:p-8 lg:p-12">
                      <motion.div
                        variants={copyContainer}
                        initial="hidden"
                        animate={isActive ? "visible" : "hidden"}
                        className="max-w-[34rem] pl-12 sm:pl-14 lg:pl-16"
                      >
                        <motion.span
                          variants={copyItem}
                          className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300 sm:mb-3"
                        >
                          {slide.eyebrow}
                        </motion.span>
                        <motion.h2
                          variants={copyItem}
                          className="text-balance text-lg font-bold leading-[1.15] tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl"
                        >
                          {slide.heading}
                        </motion.h2>
                        <motion.p
                          variants={copyItem}
                          className="mt-3 hidden max-w-[30rem] text-sm leading-relaxed text-white/80 sm:block md:text-base"
                        >
                          {slide.description}
                        </motion.p>
                        <motion.div
                          variants={copyItem}
                          className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-3"
                        >
                          <Link
                            href={slide.primary.href}
                            className="rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#071a9e] shadow-lg shadow-black/25 transition hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-5 sm:py-3 sm:text-sm"
                          >
                            {slide.primary.label}
                          </Link>
                          <Link
                            href={slide.secondary.href}
                            className="rounded-full border border-white/50 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-5 sm:py-3 sm:text-sm"
                          >
                            {slide.secondary.label}
                          </Link>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Previous / Next arrows — vertically centred, mirrored insets */}
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous banner"
              className="absolute top-1/2 left-3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#071a9e] shadow-lg shadow-blue-950/25 ring-1 ring-black/5 transition hover:scale-110 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#071a9e] sm:left-6 sm:size-12"
            >
              <ChevronLeft className="size-5 sm:size-6" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next banner"
              className="absolute top-1/2 right-3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#071a9e] shadow-lg shadow-blue-950/25 ring-1 ring-black/5 transition hover:scale-110 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#071a9e] sm:right-6 sm:size-12"
            >
              <ChevronRight className="size-5 sm:size-6" strokeWidth={2.5} />
            </button>
          </div>

          {/* Pagination dots — centred under the card */}
          <div className="relative z-10 flex justify-center gap-2.5 py-6">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to banner ${i + 1}: ${slide.heading}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  i === index
                    ? "w-8 bg-[#071a9e] shadow-md shadow-blue-950/20"
                    : "w-2.5 bg-[#071a9e]/25 hover:bg-[#071a9e]/50"
                )}
              />
            ))}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
