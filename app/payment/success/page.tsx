import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentSuccess } from "@/components/payment/payment-success";

export const metadata: Metadata = {
  title: "Payment Successful | Rentora",
  description: "Your Rentora equipment rental payment has been confirmed.",
};

async function PaymentSuccessContent({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const params = await searchParams;
  const value = params.session_id;
  const sessionId = Array.isArray(value) ? value[0] ?? "" : value ?? "";
  return <PaymentSuccess sessionId={sessionId} />;
}

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#faf7f2]">
          <p className="text-sm text-slate-500">Verifying your payment...</p>
        </main>
      }
    >
      <PaymentSuccessContent searchParams={searchParams} />
    </Suspense>
  );
}
