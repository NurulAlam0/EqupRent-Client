import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "My Favorites | Rentora",
  description: "Manage your saved equipment on Rentora.",
};

export default function CustomerFavoritesPage() {
  return <DashboardView />;
}
