import type { Metadata } from "next";
import { OwnerDashboardView } from "@/components/dashboard/owner-dashboard";

export const metadata: Metadata = {
  title: "Add Equipment | Rentora",
  description: "List your equipment for rent on Rentora.",
};

export default function AddEquipmentPage() {
  return <OwnerDashboardView />;
}
