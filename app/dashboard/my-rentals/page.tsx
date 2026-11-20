import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "My Rentals | Rentora",
  description: "View your equipment rental bookings on Rentora.",
};

export default function MyRentalsPage() {
  return <DashboardView />;
}
