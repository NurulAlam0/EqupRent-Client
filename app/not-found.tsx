import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f7fb] px-5 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-blue-950/5 sm:p-10">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-blue-50 text-[#071a9e]">
          <Search aria-hidden="true" className="size-8" />
        </div>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
          Rentora
        </p>
        <p className="mt-2 text-5xl font-black tracking-tight text-[#071a9e]">
          404
        </p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
          This page may have moved, or the link may be incorrect. Explore
          equipment or head back to the homepage.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/equipment"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#071a9e] px-5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <Search aria-hidden="true" className="size-4" />
            Browse equipment
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
