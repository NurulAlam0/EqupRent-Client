"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Rentora page error:", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f7fb] px-5 py-12">
      <section
        role="alert"
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-blue-950/5 sm:p-10"
      >
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertTriangle aria-hidden="true" className="size-8" />
        </div>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
          Rentora
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
          We couldn’t load this page. Please try again, or return to the
          homepage.
        </p>
        {error.digest ? (
          <p className="mt-4 text-xs text-slate-400">
            Reference: <span className="font-mono">{error.digest}</span>
          </p>
        ) : null}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#071a9e] px-5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <Home aria-hidden="true" className="size-4" />
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
