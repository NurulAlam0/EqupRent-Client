import type { Metadata } from "next";
import { OwnerDashboardView } from "@/components/dashboard/owner-dashboard";

export const metadata: Metadata = {
  title: "Owner Profile | Rentora",
  description: "Update your owner account profile on Rentora.",
};

export default function OwnerProfilePage() {
  return <OwnerDashboardView />;
}
