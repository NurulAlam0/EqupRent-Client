import type { Metadata } from "next";
import { AdminDashboardView } from "@/components/dashboard/admin-dashboard";

export const metadata: Metadata = {
  title: "All Rentals | Rentora Admin",
  description: "Monitor platform rental activity on Rentora.",
};

export default function AdminRentalsPage() {
  return <AdminDashboardView />;
}
