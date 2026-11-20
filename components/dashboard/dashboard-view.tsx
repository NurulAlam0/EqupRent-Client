"use client";

import { CustomerDashboardView } from "@/components/dashboard/customer-dashboard";
import { OwnerDashboardView } from "@/components/dashboard/owner-dashboard";
import { AdminDashboardView } from "@/components/dashboard/admin-dashboard";
import { useAuth } from "@/lib/auth-context";

export function DashboardView() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboardView />;
  if (user?.role === "owner") return <OwnerDashboardView />;
  return <CustomerDashboardView />;
}
