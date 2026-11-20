"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  CalendarDays,
  Check,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import { AddEquipmentForm } from "@/components/equipment/add-equipment-form";
import { ProfileForm } from "@/components/dashboard/customer-dashboard";
import { api, useAuth, type UserRole } from "@/lib/auth-context";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: UserRole;
  createdAt: string;
};

type AdminEquipment = {
  _id: string;
  name: string;
  image: string;
  category: string;
  rentalPrice: number;
  rentalType: string;
  availableQuantity: number;
  status: "pending" | "approved" | "rejected";
  owner: { name: string; email: string } | null;
};

type AdminBooking = {
  _id: string;
  customer: { name: string; email: string } | null;
  owner: { name: string; email: string } | null;
  equipment: { name: string; image: string } | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
};

type AdminOverview = {
  stats: {
    totalUsers: number;
    totalEquipment: number;
    totalBookings: number;
    pendingApprovals: number;
    completedRentals: number;
    totalRevenue: number;
  };
  monthlyBookings: {
    _id: { year: number; month: number };
    bookings: number;
  }[];
};

const ADMIN_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "All Users", icon: UsersRound },
  { href: "/dashboard/admin/equipment", label: "All Equipment", icon: Boxes },
  {
    href: "/dashboard/admin/rentals",
    label: "All Rentals",
    icon: CalendarDays,
  },
  {
    href: "/dashboard/admin/profile",
    label: "My Profile",
    icon: UserRound,
  },
];

const ROLES: UserRole[] = ["customer", "owner", "admin"];

function money(value: number) {
  return `৳${Number(value || 0).toLocaleString("en-BD", {
    maximumFractionDigits: 0,
  })}`;
}

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function Badge({ value }: { value: string }) {
  const style =
    value === "approved" || value === "paid" || value === "completed"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : value === "rejected" || value === "failed" || value === "cancelled"
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : value === "confirmed" || value === "admin"
          ? "bg-blue-50 text-blue-700 ring-blue-200"
          : "bg-amber-50 text-amber-700 ring-amber-200";
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${style}`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

function AdminUsersTable({
  items,
  adminId,
  updatingId,
  onChangeRole,
}: {
  items: AdminUser[];
  adminId: string;
  updatingId: string;
  onChangeRole: (user: AdminUser, role: UserRole) => void;
}) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        No users found.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Role</th>
            <th className="px-4 py-3 font-semibold">Registration Date</th>
            <th className="px-4 py-3 text-right font-semibold">Manage User</th>
          </tr>
        </thead>
        <tbody>
          {items.map((user) => (
            <tr
              key={user._id}
              className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-50 font-semibold text-blue-700">
                    {user.photo ? (
                      <Image
                        src={user.photo}
                        alt={user.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      user.name.slice(0, 1).toUpperCase()
                    )}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {user.name}
                    {user._id === adminId ? (
                      <span className="ml-2 text-[10px] font-medium text-slate-400">
                        You
                      </span>
                    ) : null}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-500">{user.email}</td>
              <td className="px-4 py-3">
                <Badge value={user.role} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                {dateLabel(user.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <select
                  aria-label={`Change role for ${user.name}`}
                  disabled={user._id === adminId || updatingId === user._id}
                  value={user.role}
                  onChange={(event) =>
                    onChangeRole(user, event.target.value as UserRole)
                  }
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold capitalize text-slate-700 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminEquipmentTable({
  items,
  updatingId,
  deletingId,
  onStatus,
  onDelete,
}: {
  items: AdminEquipment[];
  updatingId: string;
  deletingId: string;
  onStatus: (item: AdminEquipment, status: "approved" | "rejected") => void;
  onDelete: (item: AdminEquipment) => void;
}) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        No equipment listings found.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1050px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 font-semibold">Equipment</th>
            <th className="px-4 py-3 font-semibold">Owner</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Rental Price</th>
            <th className="px-4 py-3 font-semibold">Quantity</th>
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
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </span>
                  <span className="font-semibold text-slate-800">{item.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-700">
                  {item.owner?.name ?? "Owner unavailable"}
                </p>
                <p className="text-xs text-slate-400">
                  {item.owner?.email ?? "—"}
                </p>
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
                <Badge value={item.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    aria-label={`Approve ${item.name}`}
                    title="Approve"
                    onClick={() => onStatus(item, "approved")}
                    disabled={updatingId === item._id || item.status === "approved"}
                    className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-40"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Reject ${item.name}`}
                    title="Reject"
                    onClick={() => onStatus(item, "rejected")}
                    disabled={updatingId === item._id || item.status === "rejected"}
                    className="grid size-8 place-items-center rounded-lg bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:opacity-40"
                  >
                    <X className="size-4" />
                  </button>
                  <Link
                    href={`/dashboard/admin/equipment/${item._id}/edit`}
                    className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                  >
                    Update
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    disabled={deletingId === item._id}
                    className="h-8 rounded-lg px-2.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:opacity-50"
                  >
                    {deletingId === item._id ? "Deleting" : "Delete"}
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

function AdminRentalsTable({ items }: { items: AdminBooking[] }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        No rental bookings found.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 font-semibold">Customer</th>
            <th className="px-4 py-3 font-semibold">Owner</th>
            <th className="px-4 py-3 font-semibold">Equipment</th>
            <th className="px-4 py-3 font-semibold">Rental Duration</th>
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
                <p className="text-xs text-slate-400">
                  {booking.customer?.email ?? "—"}
                </p>
              </td>
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-800">
                  {booking.owner?.name ?? "Owner unavailable"}
                </p>
                <p className="text-xs text-slate-400">
                  {booking.owner?.email ?? "—"}
                </p>
              </td>
              <td className="px-4 py-3">
                <div className="flex min-w-40 items-center gap-2.5">
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
                  <span className="font-medium text-slate-700">
                    {booking.equipment?.name ?? "Equipment unavailable"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                {dateLabel(booking.startDate)} – {dateLabel(booking.endDate)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap font-bold text-blue-700">
                {money(booking.totalAmount)}
              </td>
              <td className="px-4 py-3">
                <Badge value={booking.paymentStatus} />
              </td>
              <td className="px-4 py-3">
                <Badge value={booking.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyTable({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
      <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
      <p className="sr-only">{text}</p>
    </div>
  );
}

export function AdminDashboardView({
  equipmentId,
}: {
  equipmentId?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [equipment, setEquipment] = useState<AdminEquipment[]>([]);
  const [rentals, setRentals] = useState<AdminBooking[]>([]);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [loadedSection, setLoadedSection] = useState("");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    if (user === null) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (user?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, router, pathname]);

  const section = pathname.includes("/users")
    ? "users"
    : pathname.includes("/equipment/") && equipmentId
      ? "edit-equipment"
      : pathname.includes("/equipment")
        ? "equipment"
        : pathname.includes("/rentals")
          ? "rentals"
          : pathname.includes("/profile")
            ? "profile"
            : "overview";

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
      const current = overview?.monthlyBookings.find(
        (row) =>
          row._id.year === month.getFullYear() &&
          row._id.month === month.getMonth() + 1
      );
      return {
        month: new Intl.DateTimeFormat("en", { month: "short" }).format(month),
        bookings: current?.bookings ?? 0,
      };
    });
  }, [currentDate, overview]);

  useEffect(() => {
    if (user?.role !== "admin" || section === "profile" || section === "edit-equipment") {
      return;
    }
    let cancelled = false;

    const request =
      section === "users"
        ? api<{ items: AdminUser[] }>("/api/admin/users").then((data) => {
            if (!cancelled) setUsers(data.items);
          })
        : section === "equipment"
          ? api<{ items: AdminEquipment[] }>("/api/admin/equipment").then(
              (data) => {
                if (!cancelled) setEquipment(data.items);
              }
            )
          : section === "rentals"
            ? api<{ items: AdminBooking[] }>("/api/admin/bookings").then(
                (data) => {
                  if (!cancelled) setRentals(data.items);
                }
              )
            : api<AdminOverview>("/api/admin/overview").then((data) => {
                if (!cancelled) setOverview(data);
              });

    request
      .then(() => {
        if (!cancelled) setError("");
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error ? cause.message : "Could not load admin data."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadedSection(section);
      });

    return () => {
      cancelled = true;
    };
  }, [section, user?.role]);

  const changeRole = async (target: AdminUser, role: UserRole) => {
    if (target.role === role) return;
    setUpdatingId(target._id);
    try {
      await api(`/api/admin/users/${target._id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setUsers((current) =>
        current.map((item) =>
          item._id === target._id ? { ...item, role } : item
        )
      );
      toast.success(`${target.name}'s role changed to ${role}.`);
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not change user role."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const changeEquipmentStatus = async (
    item: AdminEquipment,
    status: "approved" | "rejected"
  ) => {
    if (item.status === status) return;
    setUpdatingId(item._id);
    try {
      await api(`/api/admin/equipment/${item._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setEquipment((current) =>
        current.map((row) =>
          row._id === item._id ? { ...row, status } : row
        )
      );
      toast.success(`Equipment ${status}.`);
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not update equipment."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const deleteEquipment = async (item: AdminEquipment) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(item._id);
    try {
      await api(`/api/admin/equipment/${item._id}`, { method: "DELETE" });
      setEquipment((current) => current.filter((row) => row._id !== item._id));
      toast.success("Equipment deleted.");
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not delete equipment."
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

  const loading = loadedSection !== section;

  if (user === undefined || user === null || user.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <span className="size-9 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const title =
    section === "users"
      ? "All Users"
      : section === "equipment"
        ? "All Equipment"
        : section === "edit-equipment"
          ? "Update Equipment"
          : section === "rentals"
            ? "All Rentals"
            : section === "profile"
              ? "My Profile"
              : "Admin Overview";

  const overviewStats = [
    { label: "Total Users", value: overview?.stats.totalUsers ?? 0, icon: UsersRound, tone: "bg-blue-50 text-blue-700" },
    { label: "Total Equipment", value: overview?.stats.totalEquipment ?? 0, icon: Boxes, tone: "bg-cyan-50 text-cyan-700" },
    { label: "Total Bookings", value: overview?.stats.totalBookings ?? 0, icon: CalendarDays, tone: "bg-violet-50 text-violet-700" },
    { label: "Pending Approvals", value: overview?.stats.pendingApprovals ?? 0, icon: ShieldCheck, tone: "bg-amber-50 text-amber-700" },
    { label: "Completed Rentals", value: overview?.stats.completedRentals ?? 0, icon: CalendarDays, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Total Revenue", value: money(overview?.stats.totalRevenue ?? 0), icon: CircleDollarSign, tone: "bg-indigo-50 text-indigo-700" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#071a9e] text-white lg:flex">
        <Link
          href="/"
          className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-white text-blue-800">
            <ShieldCheck className="size-5" />
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
        <nav aria-label="Admin dashboard" className="flex-1 space-y-1 px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
            Administration
          </p>
          {ADMIN_LINKS.map((item) => {
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
                Rentora / Admin
              </p>
              <h1 className="truncate text-base font-bold text-slate-900">
                {title}
              </h1>
            </div>
            <Link
              href="/dashboard/admin/profile"
              aria-label="Open admin profile"
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
          <nav
            aria-label="Admin dashboard mobile"
            className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden"
          >
            {ADMIN_LINKS.map((item) => {
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
          {section === "profile" ? (
            <ProfileForm key={user.email} user={user} />
          ) : section === "edit-equipment" ? (
            <AddEquipmentForm
              embedded
              adminEdit
              equipmentId={equipmentId}
              onSaved={() => router.push("/dashboard/admin/equipment")}
            />
          ) : !loading && error ? (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800"
            >
              {error}
            </div>
          ) : section === "users" ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">All Users</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review registrations and manage account roles.
                </p>
              </div>
              {loading ? (
                <EmptyTable text="Loading users" />
              ) : (
                <AdminUsersTable
                  items={users}
                  adminId={user._id ?? ""}
                  updatingId={updatingId}
                  onChangeRole={changeRole}
                />
              )}
            </section>
          ) : section === "equipment" ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  All Equipment
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review, approve, update, or remove equipment listings.
                </p>
              </div>
              {loading ? (
                <EmptyTable text="Loading equipment" />
              ) : (
                <AdminEquipmentTable
                  items={equipment}
                  updatingId={updatingId}
                  deletingId={deletingId}
                  onStatus={changeEquipmentStatus}
                  onDelete={deleteEquipment}
                />
              )}
            </section>
          ) : section === "rentals" ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">All Rentals</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Monitor platform-wide bookings and payment status.
                </p>
              </div>
              {loading ? (
                <EmptyTable text="Loading bookings" />
              ) : (
                <AdminRentalsTable items={rentals} />
              )}
            </section>
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
                      Platform administration
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                      Welcome, <span className="text-cyan-200">{user.name}</span>
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                      Monitor users, equipment approvals, and rental activity
                      across Rentora.
                    </p>
                  </div>
                  <div className="hidden size-24 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 sm:flex">
                    <ShieldCheck className="size-12 text-cyan-200" />
                  </div>
                </div>
              </section>
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div
                      key={index}
                      className="h-32 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200"
                    />
                  ))}
                </div>
              ) : overview ? (
                <>
                  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                        <p className="mt-4 text-2xl font-bold text-slate-900">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {stat.label}
                        </p>
                      </article>
                    ))}
                  </section>
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="font-bold text-slate-900">
                      Monthly bookings
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Platform booking volume over the last six months
                    </p>
                    <div className="mt-5 h-64 min-w-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={monthlyData}
                          margin={{ top: 8, right: 12, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid stroke="#e8edf5" strokeDasharray="4 4" />
                          <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 11 }}
                          />
                          <YAxis
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 11 }}
                          />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="bookings"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#2563eb", strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                </>
              ) : null}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
