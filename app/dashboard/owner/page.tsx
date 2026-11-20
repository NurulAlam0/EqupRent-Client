import type { Metadata } from "next";
import { OwnerDashboardView } from "@/components/dashboard/owner-dashboard";

export const metadata: Metadata = {
  title: "Owner Dashboard | Rentora",
  description: "Manage your equipment and rentals on Rentora.",
};

export default function OwnerDashboardPage() {
  return <OwnerDashboardView />;
}

