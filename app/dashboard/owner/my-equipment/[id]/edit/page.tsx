import { Suspense } from "react";
import type { Metadata } from "next";
import { OwnerDashboardView } from "@/components/dashboard/owner-dashboard";

export const metadata: Metadata = {
  title: "Update Equipment | Rentora",
  description: "Update your equipment listing on Rentora.",
};

async function EditEquipmentContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OwnerDashboardView equipmentId={id} />;
}

export default function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-slate-50">
          <span className="size-9 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <EditEquipmentContent params={params} />
    </Suspense>
  );
}
