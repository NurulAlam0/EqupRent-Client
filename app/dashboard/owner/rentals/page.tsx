import type { Metadata } from "next";
import { OwnerDashboardView } from "@/components/dashboard/owner-dashboard";

export const metadata: Metadata = {
  title: "My Equipment Rentals | Rentora",
  description: "Track rentals for your equipment on Rentora.",
};

export default function OwnerRentalsPage() {
  return <OwnerDashboardView />;
}
