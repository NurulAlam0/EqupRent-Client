import type { Metadata } from "next";
import { AdminDashboardView } from "@/components/dashboard/admin-dashboard";

export const metadata: Metadata = {
  title: "All Users | Rentora",
  description: "Manage Rentora user roles.",
};

export default function AdminUsersPage() {
  return <AdminDashboardView />;
}
