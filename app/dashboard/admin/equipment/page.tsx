import type { Metadata } from "next";
import { AdminDashboardView } from "@/components/dashboard/admin-dashboard";

export const metadata: Metadata = {
  title: "All Equipment | Rentora Admin",
  description: "Review and manage equipment listings on Rentora.",
};

export default function AdminEquipmentPage() {
  return <AdminDashboardView />;
}
