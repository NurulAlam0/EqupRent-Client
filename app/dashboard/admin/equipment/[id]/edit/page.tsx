import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminDashboardView } from "@/components/dashboard/admin-dashboard";

export const metadata: Metadata = {
  title: "Update Equipment | Rentora Admin",
  description: "Update an equipment listing on Rentora.",
};

async function AdminEquipmentEditContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminDashboardView equipmentId={id} />;
}

export default function AdminEquipmentEditPage({
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
      <AdminEquipmentEditContent params={params} />
    </Suspense>
  );
}
