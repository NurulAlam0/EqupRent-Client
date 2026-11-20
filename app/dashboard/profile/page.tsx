import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Profile | Rentora",
  description: "Update your Rentora account profile.",
};

export default function CustomerProfilePage() {
  return <DashboardView />;
}
