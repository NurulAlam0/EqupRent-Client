import type { Metadata } from "next";
import { OwnerDashboardView } from "@/components/dashboard/owner-dashboard";

export const metadata: Metadata = {
  title: "My Equipment | Rentora",
  description: "Manage your equipment listings on Rentora.",
};

export default function MyEquipmentPage() {
  return <OwnerDashboardView />;
}
