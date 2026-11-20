import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Tag, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Booking",
    text: "Reserve the equipment you need in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Owners",
    text: "Every listing is reviewed before it goes live.",
  },
  {
    icon: Tag,
    title: "Flexible Rates",
    text: "Daily, weekly and monthly pricing that fits you.",
  },
];

/** Split-screen layout shared by the Register and Login pages. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      {/* Brand panel — same gradient + glows as the home banner */}
      <aside
        className="relative overflow-hidden px-6 pt-6 pb-8 text-white sm:px-10 lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:px-12 lg:pt-20 lg:pb-10 xl:px-16"
        style={{
          background:
            "linear-gradient(135deg, #071a9e 0%, #1140f0 42%, #1a63ff 66%, #1f9bff 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(65% 55% at 72% 92%, rgba(56, 191, 255, 0.55) 0%, rgba(56, 191, 255, 0) 62%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 50% at 6% 0%, rgba(4, 14, 90, 0.9) 0%, rgba(4, 14, 90, 0) 65%)",
          }}
        />

        {/* Logo */}
        <Link
          href="/"
          className="relative flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <Image
            src="/image/logo-mark.png"
            alt=""
            width={44}
            height={44}
            className="size-11 rounded-xl ring-1 ring-white/20"
          />
          <span className="text-2xl font-bold tracking-tight">Rentora</span>
        </Link>

        {/* Copy */}
        <div className="relative mt-8 lg:mt-0">
          <h1 className="text-2xl leading-[1.1] font-bold tracking-tight sm:text-3xl xl:text-4xl">
            Everything you need.
            <br />
            <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
              Nothing to own.
            </span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-blue-100 sm:text-base">
            Discover and rent top-quality equipment for work, creativity, and
            everyday life.
          </p>

          <ul className="mt-7 hidden space-y-4 lg:block">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10">
                  <f.icon className="size-5 text-cyan-300" strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold">
                    {f.title}
                  </span>
                  <span className="block text-sm text-blue-100/85">{f.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-8 text-sm text-white/60 lg:mt-0">
          © Rentora. All rights reserved.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 items-center justify-center px-5 py-6 sm:px-8 sm:py-8">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">{children}</div>
      </main>
    </div>
  );
}
