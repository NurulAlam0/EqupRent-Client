import type { Metadata } from "next";
import { AdminDashboardView } from "@/components/dashboard/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Profile | Rentora",
  description: "Manage your Rentora admin profile.",
};

export default function AdminProfilePage() {
  return <AdminDashboardView />;
}
