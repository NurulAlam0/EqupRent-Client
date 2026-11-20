import type { Metadata } from "next";
import { AdminDashboardView } from "@/components/dashboard/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | Rentora",
  description: "Manage users, equipment, and rentals on Rentora.",
};

export default function AdminDashboardPage() {
  return <AdminDashboardView />;
}
