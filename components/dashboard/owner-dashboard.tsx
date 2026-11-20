"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  PackageSearch,
  Search,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { AddEquipmentForm } from "@/components/equipment/add-equipment-form";
import { ProfileForm } from "@/components/dashboard/customer-dashboard";
import { api, useAuth } from "@/lib/auth-context";

type OwnerEquipment = {
  _id: string;
  name: string;
  image: string;
  category: string;
  rentalPrice: number;
  rentalType: string;
  availableQuantity: number;
  status: "pending" | "approved" | "rejected";
};

type OwnerBooking = {
  _id: string;
  customer: { name: string; email: string; photo: string } | null;
  equipment: { _id: string; name: string; image: string } | null;
  startDate: string;
  endDate: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: string;
  status: string;
};

type OwnerOverview = {
  stats: {
    totalListedEquipment: number;
    completedRentals: number;
    totalEarnings: number;
  };
  monthlyEarnings: {
    _id: { year: number; month: number };
    earnings: number;
  }[];
};

const OWNER_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  {
    href: "/dashboard/owner/add-equipment",
    label: "Add Equipment",
    icon: PackagePlus,
  },
  {
    href: "/dashboard/owner/my-equipment",
    label: "My Equipment",
    icon: Boxes,
  },
  {
    href: "/dashboard/owner/rentals",
    label: "My Equipment Rental",
    icon: CalendarDays,
  },
  {
    href: "/dashboard/owner/profile",
    label: "My Profile",
    icon: UserRound,
  },
];

function money(value: number) {
  return `৳${Number(value || 0).toLocaleString("en-BD", {
    maximumFractionDigits: 0,
  })}`;
}

function shortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function StateBadge({ value }: { value: string }) {
  const styles =
    value === "approved" || value === "paid" || value === "confirmed"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : value === "rejected" || value === "failed" || value === "cancelled"
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : "bg-amber-50 text-amber-700 ring-amber-200";
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${styles}`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

function OwnerEquipmentTable({
  items,
  onDelete,
  deletingId,
}: {
  items: OwnerEquipment[];
  onDelete: (item: OwnerEquipment) => void;
  deletingId: string;
}) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <PackageSearch className="mx-auto size-9 text-blue-600" />
        <h2 className="mt-4 font-bold text-slate-900">No equipment listed</h2>
        <p className="mt-2 text-sm text-slate-500">
          Add your first listing to start renting out equipment.
        </p>
        <Link
          href="/dashboard/owner/add-equipment"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0b1f8f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#091674]"
        >
          Add equipment <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 font-semibold">Equipment Name</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Rental Price</th>
            <th className="px-4 py-3 font-semibold">Available Quantity</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item._id}
              className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
            >
              <td className="px-4 py-3">
                <div className="flex min-w-48 items-center gap-3">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                  <span className="font-semibold text-slate-800">{item.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-500">{item.category}</td>
              <td className="px-4 py-3 whitespace-nowrap font-bold text-blue-700">
                {money(item.rentalPrice)}
                <span className="ml-1 text-xs font-normal text-slate-400">
                  / {item.rentalType.toLowerCase()}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {item.availableQuantity}
              </td>
              <td className="px-4 py-3">
                <StateBadge value={item.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/dashboard/owner/my-equipment/${item._id}/edit`}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    Update
                  </Link>
                  <Link
                    href={`/equipment/${item._id}`}
                    className="rounded-lg bg-[#0b1f8f] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#091674]"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    disabled={deletingId === item._id}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:opacity-50"
                  >
                    {deletingId === item._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OwnerRentalsTable({ items }: { items: OwnerBooking[] }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <CalendarDays className="mx-auto size-9 text-blue-600" />
        <h2 className="mt-4 font-bold text-slate-900">No rental bookings yet</h2>
        <p className="mt-2 text-sm text-slate-500">
          Customer bookings for your equipment will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 font-semibold">Customer Information</th>
            <th className="px-4 py-3 font-semibold">Equipment</th>
            <th className="px-4 py-3 font-semibold">Rental Duration</th>
            <th className="px-4 py-3 font-semibold">Required Quantity</th>
            <th className="px-4 py-3 font-semibold">Booking Amount</th>
            <th className="px-4 py-3 font-semibold">Payment</th>
            <th className="px-4 py-3 font-semibold">Booking</th>
          </tr>
        </thead>
        <tbody>
          {items.map((booking) => (
            <tr
              key={booking._id}
              className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
            >
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-800">
                  {booking.customer?.name ?? "Customer unavailable"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {booking.customer?.email ?? "—"}
                </p>
              </td>
              <td className="px-4 py-3">
                <div className="flex min-w-44 items-center gap-3">
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {booking.equipment?.image ? (
                      <Image
                        src={booking.equipment.image}
                        alt={booking.equipment.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="font-medium text-slate-800">
                    {booking.equipment?.name ?? "Equipment unavailable"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                {shortDate(booking.startDate)}
                <span className="mx-1 text-slate-300">–</span>
                {shortDate(booking.endDate)}
              </td>
              <td className="px-4 py-3 text-slate-600">{booking.quantity}</td>
              <td className="px-4 py-3 whitespace-nowrap font-bold text-blue-700">
                {money(booking.totalAmount)}
              </td>
              <td className="px-4 py-3">
                <StateBadge value={booking.paymentStatus} />
              </td>
              <td className="px-4 py-3">
                <StateBadge value={booking.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OwnerDashboardView({
  equipmentId,
}: {
  equipmentId?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [equipment, setEquipment] = useState<OwnerEquipment[]>([]);
  const [rentals, setRentals] = useState<OwnerBooking[]>([]);
  const [overview, setOverview] = useState<OwnerOverview | null>(null);
  const [equipmentLoading, setEquipmentLoading] = useState(true);
  const [rentalsLoading, setRentalsLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [equipmentError, setEquipmentError] = useState("");
  const [rentalsError, setRentalsError] = useState("");
  const [overviewError, setOverviewError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [reloadId, setReloadId] = useState(0);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setCurrentDate(new Date()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const monthlyData = useMemo(() => {
    if (!currentDate) return [];
    return Array.from({ length: 6 }, (_, index) => {
      const month = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 5 + index,
        1
      );
      const current = overview?.monthlyEarnings.find(
        (row) =>
          row._id.year === month.getFullYear() &&
          row._id.month === month.getMonth() + 1
      );
      return {
        month: new Intl.DateTimeFormat("en", { month: "short" }).format(month),
        earnings: current?.earnings ?? 0,
      };
    });
  }, [currentDate, overview]);

  useEffect(() => {
    if (user === null) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (user?.role === "customer") {
      router.replace("/dashboard");
    }
  }, [user, router, pathname]);

  useEffect(() => {
    if (user?.role !== "owner" && user?.role !== "admin") return;
    let cancelled = false;
    api<{ items: OwnerEquipment[] }>("/api/equipment/mine")
      .then((data) => {
        if (cancelled) return;
        setEquipment(data.items);
        setEquipmentError("");
        setEquipmentLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setEquipmentError(
          error instanceof Error ? error.message : "Could not load equipment."
        );
        setEquipmentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email, user?.role, reloadId]);

  useEffect(() => {
    if (user?.role !== "owner" && user?.role !== "admin") return;
    let cancelled = false;
    api<OwnerOverview>("/api/owner/overview")
      .then((data) => {
        if (cancelled) return;
        setOverview(data);
        setOverviewError("");
        setOverviewLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setOverviewError(
          error instanceof Error
            ? error.message
            : "Could not load business analytics."
        );
        setOverviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email, user?.role, reloadId]);

  useEffect(() => {
    if (user?.role !== "owner" && user?.role !== "admin") return;
    let cancelled = false;
    api<{ items: OwnerBooking[] }>("/api/bookings/owner")
      .then((data) => {
        if (cancelled) return;
        setRentals(data.items);
        setRentalsError("");
        setRentalsLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setRentalsError(
          error instanceof Error ? error.message : "Could not load rentals."
        );
        setRentalsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email, user?.role, reloadId]);

  const deleteEquipment = async (item: OwnerEquipment) => {
    if (
      !window.confirm(
        `Delete "${item.name}"? This listing cannot be restored.`
      )
    ) {
      return;
    }
    setDeletingId(item._id);
    try {
      await api(`/api/equipment/${item._id}`, { method: "DELETE" });
      setEquipment((current) =>
        current.filter((equipmentItem) => equipmentItem._id !== item._id)
      );
      toast.success("Equipment deleted");
      setReloadId((current) => current + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete equipment."
      );
    } finally {
      setDeletingId("");
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.replace("/");
  };

  if (user === undefined || user === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <span className="size-9 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
      </div>
    );
  }
  if (user.role !== "owner" && user.role !== "admin") {
    return null;
  }

  const section = pathname.includes("/add-equipment")
    ? "add"
    : pathname.includes("/my-equipment/") && equipmentId
      ? "edit"
      : pathname.includes("/my-equipment")
        ? "equipment"
        : pathname.includes("/rentals")
          ? "rentals"
          : pathname.includes("/profile")
            ? "profile"
            : "overview";
  const title =
    section === "add"
      ? "Add Equipment"
      : section === "edit"
        ? "Update Equipment"
        : section === "equipment"
          ? "My Equipment"
          : section === "rentals"
            ? "My Equipment Rental"
            : section === "profile"
              ? "My Profile"
              : "Owner Overview";

  const pendingCount = equipment.filter(
    (item) => item.status === "pending"
  ).length;
  const overviewStats = [
    {
      label: "Total Listed Equipment",
      value: overview
        ? String(overview.stats.totalListedEquipment)
        : overviewLoading
          ? "..."
          : "—",
      icon: Boxes,
      tone: "bg-blue-50 text-blue-700",
      hint: "Your listings",
    },
    {
      label: "Pending Approvals",
      value: String(pendingCount),
      icon: Clock3,
      tone: "bg-amber-50 text-amber-700",
      hint: "Waiting for review",
    },
    {
      label: "Total Rentals",
      value: String(rentals.length),
      icon: CalendarDays,
      tone: "bg-cyan-50 text-cyan-700",
      hint: "Bookings on your items",
    },
    {
      label: "Completed Rentals",
      value: overview
        ? String(overview.stats.completedRentals)
        : overviewLoading
          ? "..."
          : "—",
      icon: CalendarDays,
      tone: "bg-violet-50 text-violet-700",
      hint: "Successfully completed",
    },
    {
      label: "Total Earnings",
      value: overview
        ? money(overview.stats.totalEarnings)
        : overviewLoading
          ? "..."
          : "—",
      icon: CircleDollarSign,
      tone: "bg-emerald-50 text-emerald-700",
      hint: "Successful payments",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#071a9e] text-white lg:flex">
        <Link
          href="/"
          className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-white text-blue-800">
            <PackageSearch className="size-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">
            Rent<span className="text-cyan-300">ora</span>
          </span>
        </Link>
        <div className="border-b border-white/10 px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-700 text-sm font-bold ring-2 ring-cyan-300">
              {user.photo ? (
                <Image
                  src={user.photo}
                  alt={user.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                user.name.slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="mt-0.5 text-xs capitalize text-blue-200">
                {user.role}
              </p>
            </div>
          </div>
        </div>
        <nav aria-label="Owner dashboard" className="flex-1 space-y-1 px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
            Owner workspace
          </p>
          {OWNER_LINKS.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
                    : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <Link
            href="/equipment"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-blue-100/80 transition hover:bg-white/10 hover:text-white"
          >
            <Search className="size-4" />
            Explore equipment
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-blue-100/80 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-[68px] max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-7">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                Rentora / Owner
              </p>
              <h1 className="truncate text-base font-bold text-slate-900">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/equipment"
                className="hidden h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 sm:flex"
              >
                <Search className="size-3.5" />
                Browse equipment
              </Link>
              <Link
                href="/dashboard/owner/profile"
                aria-label="Open owner profile"
                className="relative grid size-9 place-items-center overflow-hidden rounded-full bg-blue-50 text-sm font-bold text-blue-700 ring-2 ring-blue-100"
              >
                {user.photo ? (
                  <Image
                    src={user.photo}
                    alt=""
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                ) : (
                  user.name.slice(0, 1).toUpperCase()
                )}
              </Link>
            </div>
          </div>
          <nav
            aria-label="Owner dashboard mobile"
            className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden"
          >
            {OWNER_LINKS.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                    active
                      ? "bg-blue-50 text-blue-800"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className="size-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="mx-auto max-w-[1500px] space-y-5 px-4 py-5 sm:px-7 sm:py-7">
          {section === "add" || section === "edit" ? (
            <AddEquipmentForm
              embedded
              equipmentId={section === "edit" ? equipmentId : undefined}
              onSaved={() => {
                setReloadId((current) => current + 1);
                router.push("/dashboard/owner/my-equipment");
              }}
            />
          ) : section === "equipment" ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Equipment listings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your equipment listings and approval status.
                </p>
              </div>
              {equipmentLoading ? (
                <div className="space-y-3" aria-label="Loading equipment">
                  <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
                </div>
              ) : equipmentError ? (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800"
                >
                  {equipmentError}
                </div>
              ) : (
                <OwnerEquipmentTable
                  items={equipment}
                  onDelete={deleteEquipment}
                  deletingId={deletingId}
                />
              )}
            </section>
          ) : section === "rentals" ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Rentals for your equipment
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Customer, rental period, quantity, and payment details.
                </p>
              </div>
              {rentalsLoading ? (
                <div className="space-y-3" aria-label="Loading rentals">
                  <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
                </div>
              ) : rentalsError ? (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800"
                >
                  {rentalsError}
                </div>
              ) : (
                <OwnerRentalsTable items={rentals} />
              )}
            </section>
          ) : section === "profile" ? (
            <ProfileForm key={user.email} user={user} />
          ) : (
            <>
              <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-r from-[#071a9e] via-[#1140f0] to-[#1689ed] p-6 text-white shadow-lg shadow-blue-950/10 sm:p-8">
                <div
                  aria-hidden
                  className="absolute -right-12 -top-20 size-64 rounded-full bg-cyan-200/20 blur-3xl"
                />
                <div className="relative flex items-center justify-between gap-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                      Owner workspace
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                      Welcome back,{" "}
                      <span className="text-cyan-200">{user.name}</span>
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                      Keep your listings up to date and follow every rental in
                      one place.
                    </p>
                    <Link
                      href="/dashboard/owner/add-equipment"
                      className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
                    >
                      Add equipment <ArrowRight className="size-4" />
                    </Link>
                  </div>
                  <div className="hidden size-24 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 sm:flex">
                    <PackagePlus
                      className="size-12 text-cyan-200"
                      strokeWidth={1.4}
                    />
                  </div>
                </div>
              </section>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {overviewStats.map((stat) => (
                  <article
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span
                      className={`grid size-10 place-items-center rounded-xl ${stat.tone}`}
                    >
                      <stat.icon className="size-5" />
                    </span>
                    <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{stat.hint}</p>
                  </article>
                ))}
              </section>
              {overviewLoading ? (
                <section
                  aria-label="Loading monthly earnings"
                  className="h-80 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200"
                />
              ) : overviewError ? (
                <section
                  role="alert"
                  className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800"
                >
                  {overviewError}
                </section>
              ) : (
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <h2 className="font-bold text-slate-900">Monthly earnings</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Successful payments from your rentals over the last six months
                  </p>
                  <div className="mt-5 h-64 min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyData}
                        margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
                      >
                        <CartesianGrid
                          stroke="#e2e8f0"
                          strokeDasharray="4 4"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 12 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 11 }}
                          tickFormatter={(value: number) => money(value)}
                        />
                        <Tooltip
                          formatter={(value) => [money(Number(value)), "Earnings"]}
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #e2e8f0",
                          }}
                        />
                        <Bar
                          dataKey="earnings"
                          fill="#2563eb"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Recent equipment listings
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Your latest additions and their approval status
                    </p>
                  </div>
                  <Link
                    href="/dashboard/owner/my-equipment"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
                  >
                    View all <ArrowRight className="size-4" />
                  </Link>
                </div>
                {equipmentLoading ? (
                  <div className="space-y-3" aria-label="Loading equipment">
                    <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  </div>
                ) : equipmentError ? (
                  <div role="alert" className="text-sm text-rose-700">
                    {equipmentError}
                  </div>
                ) : (
                  <OwnerEquipmentTable
                    items={equipment.slice(0, 5)}
                    onDelete={deleteEquipment}
                    deletingId={deletingId}
                  />
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
