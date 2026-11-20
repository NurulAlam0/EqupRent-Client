"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, LoaderCircle, ReceiptText } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { api, useAuth } from "@/lib/auth-context";

type BookingReceipt = {
  id: string;
  equipment: { name: string; image: string } | null;
  startDate: string;
  endDate: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  transactionId: string;
  paymentStatus: "paid";
};

const STRIP =
  "linear-gradient(135deg, #071a9e 0%, #1140f0 42%, #1a63ff 66%, #1f9bff 100%)";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(value);
  } catch {
    return `${currency.toUpperCase()} ${value.toLocaleString("en-BD")}`;
  }
}

export function PaymentSuccess({ sessionId }: { sessionId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = React.useState<BookingReceipt | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.replace(
        `/login?next=${encodeURIComponent(`/payment/success?session_id=${sessionId}`)}`
      );
      return;
    }
    if (!sessionId) return;

    let cancelled = false;
    api<{ booking: BookingReceipt }>(
      `/api/bookings/verify?session_id=${encodeURIComponent(sessionId)}`
    )
      .then((result) => {
        if (!cancelled) setBooking(result.booking);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [router, sessionId, user]);

  const visibleError =
    error ?? (!sessionId ? "The Stripe checkout session is missing." : null);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#faf7f2]">
      <div aria-hidden className="absolute inset-x-0 top-0 h-48" style={{ background: STRIP }} />
      <Header />
      <main className="relative mx-auto flex w-full max-w-3xl flex-1 items-center px-5 pt-28 pb-16 sm:px-6">
        <section className="w-full rounded-3xl bg-white p-6 text-center shadow-[0_18px_55px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 sm:p-10">
          {booking ? (
            <>
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <CheckCircle2 className="size-8" aria-hidden />
              </span>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Payment successful
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Your equipment is booked
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Stripe confirmed your payment and your booking is saved.
              </p>

              <div className="mt-8 rounded-2xl bg-[#faf7f2] p-4 text-left ring-1 ring-[#eee8df] sm:p-5">
                {booking.equipment && (
                  <div className="flex items-center gap-4 border-b border-[#e9e1d7] pb-4">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                      <Image
                        src={booking.equipment.image}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-slate-900">
                        {booking.equipment.name}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {booking.quantity}{" "}
                        {booking.quantity === 1 ? "unit" : "units"}
                      </p>
                    </div>
                    <p className="ml-auto whitespace-nowrap text-lg font-bold text-blue-700">
                      {formatMoney(booking.totalAmount, booking.currency)}
                    </p>
                  </div>
                )}
                <dl className="grid gap-4 pt-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Rental period
                    </dt>
                    <dd className="mt-1 font-semibold text-slate-800">
                      {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Booking reference
                    </dt>
                    <dd className="mt-1 break-all font-mono text-xs font-semibold text-slate-800">
                      {booking.id}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Stripe transaction
                    </dt>
                    <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                      {booking.transactionId}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0b1f8f] px-5 text-sm font-semibold text-white transition hover:bg-[#091674]"
                >
                  View dashboard
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href="/"
                  className="inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  Continue browsing
                </Link>
              </div>
            </>
          ) : visibleError ? (
            <>
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <ReceiptText className="size-7" aria-hidden />
              </span>
              <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                Payment confirmation pending
              </h1>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                {visibleError}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                If Stripe charged your card, keep your session ID for support:
                <span className="mt-1 block break-all font-mono text-xs">
                  {sessionId || "Not provided"}
                </span>
              </p>
              <Link
                href="/dashboard"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0b1f8f] px-5 text-sm font-semibold text-white hover:bg-[#091674]"
              >
                Go to dashboard
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </>
          ) : (
            <div className="py-12" role="status">
              <LoaderCircle className="mx-auto size-9 animate-spin text-blue-700" />
              <p className="mt-4 text-sm text-slate-500">
                Verifying your payment with Stripe...
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
