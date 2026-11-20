"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, OctagonX } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { api, useAuth } from "@/lib/auth-context";

const STRIP =
  "linear-gradient(135deg, #071a9e 0%, #1140f0 42%, #1a63ff 66%, #1f9bff 100%)";

export function PaymentCancelled({ sessionId }: { sessionId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = React.useState(Boolean(sessionId));
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.replace(
        `/login?next=${encodeURIComponent(`/payment/cancel?session_id=${sessionId}`)}`
      );
      return;
    }
    if (!sessionId) return;

    let cancelled = false;
    api<{ cancelled: boolean }>("/api/bookings/cancel", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    })
      .then((result) => {
        if (cancelled) return;
        if (!result.cancelled) {
          setError("We could not confirm that the checkout was cancelled.");
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          if (err.message.includes("Payment completed")) {
            router.replace(
              `/payment/success?session_id=${encodeURIComponent(sessionId)}`
            );
            return;
          }
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router, sessionId, user]);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#faf7f2]">
      <div aria-hidden className="absolute inset-x-0 top-0 h-48" style={{ background: STRIP }} />
      <Header />
      <main className="relative mx-auto flex w-full max-w-2xl flex-1 items-center px-5 pt-28 pb-16 sm:px-6">
        <section className="w-full rounded-3xl bg-white p-7 text-center shadow-[0_18px_55px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 sm:p-10">
          {loading ? (
            <div role="status">
              <LoaderCircle className="mx-auto size-9 animate-spin text-blue-700" />
              <p className="mt-4 text-sm text-slate-500">
                Releasing the unpaid reservation...
              </p>
            </div>
          ) : (
            <>
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-slate-100 text-slate-500 ring-1 ring-slate-200">
                <OctagonX className="size-7" aria-hidden />
              </span>
              <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                Checkout cancelled
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {error ??
                  "No payment was taken. You can return to the equipment page and try again."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {sessionId && (
                  <Link
                    href="/"
                    className="inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                  >
                    Browse equipment
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0b1f8f] px-5 text-sm font-semibold text-white transition hover:bg-[#091674]"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Dashboard
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
