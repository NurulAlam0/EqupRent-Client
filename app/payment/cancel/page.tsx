import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentCancelled } from "@/components/payment/payment-cancelled";

export const metadata: Metadata = {
  title: "Checkout Cancelled | Rentora",
  description: "The equipment rental checkout was cancelled.",
};

async function PaymentCancelContent({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const params = await searchParams;
  const value = params.session_id;
  const sessionId = Array.isArray(value) ? value[0] ?? "" : value ?? "";
  return <PaymentCancelled sessionId={sessionId} />;
}

export default function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#faf7f2]">
          <p className="text-sm text-slate-500">Loading checkout status...</p>
        </main>
      }
    >
      <PaymentCancelContent searchParams={searchParams} />
    </Suspense>
  );
}
