import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard | Rentora",
  description: "Manage your rentals, favorites and profile on Rentora.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
