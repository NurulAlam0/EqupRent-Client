"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  LayoutDashboard,
  LogOut,
  MapPin,
  PackageCheck,
  Search,
  UserRound,
  Heart,
  XCircle,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import { api, useAuth, type AuthUser } from "@/lib/auth-context";
import { useFavorites, type FavoriteEquipment } from "@/lib/favorites";

type Booking = {
  _id: string;
  equipment: { _id: string; name: string; image: string } | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  totalAmount: number;
  paymentStatus: "unpaid" | "paid" | "failed" | "refunded";
  status: "pending_payment" | "confirmed" | "cancelled" | "completed";
};

const DASHBOARD_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/my-rentals", label: "My Rentals", icon: CalendarDays },
  { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

const CHART_COLORS = ["#2563eb", "#f59e0b", "#06b6d4", "#f43f5e"];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatMoney(value: number) {
  return `৳${Number(value || 0).toLocaleString("en-BD", {
    maximumFractionDigits: 0,
  })}`;
}

function statusLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusPill({ value }: { value: string }) {
  const color =
    value === "paid" || value === "confirmed" || value === "completed"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : value === "failed" || value === "cancelled" || value === "refunded"
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : "bg-amber-50 text-amber-700 ring-amber-200";
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${color}`}
    >
      {statusLabel(value)}
    </span>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
        <PackageCheck className="size-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-14 animate-pulse rounded-xl bg-slate-100"
        />
      ))}
    </div>
  );
}

function RentalsTable({
  bookings,
  compact = false,
}: {
  bookings: Booking[];
  compact?: boolean;
}) {
  if (!bookings.length) {
    return (
      <EmptyState
        title="No rentals yet"
        description="When you book equipment, your rental dates and payment status will appear here."
        action={
          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0b1f8f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#091674]"
          >
            Explore equipment <ArrowRight className="size-4" />
          </Link>
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 font-semibold">Equipment Name</th>
            <th className="px-4 py-3 font-semibold">Rental Start Date</th>
            <th className="px-4 py-3 font-semibold">Rental End Date</th>
            {!compact ? (
              <th className="px-4 py-3 font-semibold">Booking Date</th>
            ) : null}
            <th className="px-4 py-3 font-semibold">Total Amount</th>
            <th className="px-4 py-3 font-semibold">Payment Status</th>
            <th className="px-4 py-3 font-semibold">Booking Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr
              key={booking._id}
              className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
            >
              <td className="px-4 py-4">
                <div className="flex min-w-48 items-center gap-3">
                  <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-blue-50 text-blue-700">
                    {booking.equipment?.image ? (
                      <Image
                        src={booking.equipment.image}
                        alt={booking.equipment.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      <PackageCheck className="size-5" aria-hidden />
                    )}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {booking.equipment?.name ?? "Equipment unavailable"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                {formatDate(booking.startDate)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                {formatDate(booking.endDate)}
              </td>
              {!compact ? (
                <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                  {formatDate(booking.createdAt)}
                </td>
              ) : null}
              <td className="px-4 py-4 whitespace-nowrap font-bold text-blue-700">
                {formatMoney(booking.totalAmount)}
              </td>
              <td className="px-4 py-4">
                <StatusPill value={booking.paymentStatus} />
              </td>
              <td className="px-4 py-4">
                <StatusPill value={booking.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FavoritesTable({
  items,
  onRemove,
}: {
  items: ReturnType<typeof useFavorites>["items"];
  onRemove: (equipment: FavoriteEquipment) => void;
}) {
  if (!items.length) {
    return (
      <EmptyState
        title="No favorites saved"
        description="Save equipment with the heart button and it will be ready for you here."
        action={
          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0b1f8f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#091674]"
          >
            Browse equipment <ArrowRight className="size-4" />
          </Link>
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 font-semibold">Equipment</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Rental Price</th>
            <th className="px-4 py-3 font-semibold">Location</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ _id, equipment }) => (
            <tr
              key={_id}
              className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={equipment.image}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                  <span className="font-semibold text-slate-800">
                    {equipment.name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-500">{equipment.category}</td>
              <td className="px-4 py-3 whitespace-nowrap font-bold text-blue-700">
                {formatMoney(equipment.rentalPrice)}
                <span className="ml-1 text-xs font-normal text-slate-400">
                  / {equipment.rentalType.toLowerCase()}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 text-slate-400" />
                  {equipment.location}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/equipment/${equipment._id}`}
                    className="rounded-lg bg-[#0b1f8f] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#091674]"
                  >
                    View Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => onRemove(equipment)}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50"
                  >
                    Remove
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

export function ProfileForm({ user }: { user: AuthUser }) {
  const { updateProfile } = useAuth();
  const [values, setValues] = useState({
    name: user.name,
    photo: user.photo,
    phoneNumber: user.phoneNumber,
    address: user.address,
  });
  const [saving, setSaving] = useState(false);

  const update = (key: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile(values);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
        <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-50 text-2xl font-bold text-blue-700 ring-4 ring-blue-50">
          {values.photo ? (
            <Image
              src={values.photo}
              alt={values.name}
              fill
              sizes="80px"
              unoptimized
              className="object-cover"
            />
          ) : (
            values.name.slice(0, 1).toUpperCase()
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Profile information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Update the details used for your account and rental bookings.
          </p>
          <p className="mt-2 text-xs font-medium text-slate-400">
            Signed in as {user.email}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">
          Full name
          <input
            required
            minLength={2}
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Email address
          <input
            disabled
            value={user.email}
            className="mt-2 h-11 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 font-normal text-slate-500"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
          Profile image URL
          <input
            type="url"
            value={values.photo}
            onChange={(event) => update("photo", event.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Phone number
          <input
            type="tel"
            maxLength={30}
            value={values.phoneNumber}
            onChange={(event) => update("phoneNumber", event.target.value)}
            placeholder="+880 1XXX-XXXXXX"
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
          Address
          <textarea
            maxLength={300}
            rows={3}
            value={values.address}
            onChange={(event) => update("address", event.target.value)}
            placeholder="Enter your delivery or home address"
            className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0b1f8f] px-5 text-sm font-semibold text-white transition hover:bg-[#091674] disabled:cursor-wait disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function CustomerDashboardContent({
  section,
  user,
  bookings,
  bookingsLoading,
  bookingsError,
  favorites,
  onRemoveFavorite,
}: {
  section: "overview" | "rentals" | "favorites" | "profile";
  user: AuthUser;
  bookings: Booking[];
  bookingsLoading: boolean;
  bookingsError: string;
  favorites: ReturnType<typeof useFavorites>;
  onRemoveFavorite: (equipment: FavoriteEquipment) => void;
}) {
  const paidTotal = bookings
    .filter((booking) => booking.paymentStatus === "paid")
    .reduce((sum, booking) => sum + booking.totalAmount, 0);
  const completedCount = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;
  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending_payment"
  ).length;
  const confirmedCount = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;
  const cancelledCount = bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length;

  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      return {
        month: new Intl.DateTimeFormat("en", { month: "short" }).format(month),
        bookings: bookings.filter((booking) => {
          const created = new Date(booking.createdAt);
          return (
            created.getFullYear() === month.getFullYear() &&
            created.getMonth() === month.getMonth()
          );
        }).length,
      };
    });
  }, [bookings]);

  const statusData = [
    { name: "Confirmed", value: confirmedCount },
    { name: "Pending", value: pendingCount },
    { name: "Completed", value: completedCount },
    { name: "Cancelled", value: cancelledCount },
  ];

  if (section === "profile") {
    return <ProfileForm key={user.email} user={user} />;
  }

  if (section === "rentals") {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">My Rentals</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your booking dates, payment status, and rental history.
          </p>
        </div>
        {bookingsLoading ? (
          <LoadingRows />
        ) : bookingsError ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800"
          >
            {bookingsError}
          </div>
        ) : (
          <RentalsTable bookings={bookings} />
        )}
      </section>
    );
  }

  if (section === "favorites") {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">My Favorites</h2>
          <p className="mt-1 text-sm text-slate-500">
            Equipment saved to revisit and rent later.
          </p>
        </div>
        {favorites.loading ? (
          <LoadingRows />
        ) : (
          <FavoritesTable
            items={favorites.items}
            onRemove={onRemoveFavorite}
          />
        )}
      </section>
    );
  }

  const stats = [
    {
      label: "Total Bookings",
      value: String(bookings.length),
      icon: CalendarDays,
      accent: "bg-blue-50 text-blue-700",
      note: "All your rentals",
    },
    {
      label: "Favorite Items",
      value: String(favorites.items.length),
      icon: Heart,
      accent: "bg-rose-50 text-rose-600",
      note: "Saved for later",
    },
    {
      label: "Total Spent",
      value: formatMoney(paidTotal),
      icon: CircleDollarSign,
      accent: "bg-cyan-50 text-cyan-700",
      note: "Successful payments",
    },
    {
      label: "Completed Rentals",
      value: String(completedCount),
      icon: CheckCircle2,
      accent: "bg-emerald-50 text-emerald-700",
      note: "Finished bookings",
    },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-r from-[#071a9e] via-[#1140f0] to-[#1689ed] p-6 text-white shadow-lg shadow-blue-950/10 sm:p-8">
        <div
          aria-hidden
          className="absolute -right-12 -top-20 size-64 rounded-full bg-cyan-200/20 blur-3xl"
        />
        <div className="relative flex items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
              Customer overview
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, <span className="text-cyan-200">{user.name}</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
              Rent the equipment you need for your next project with ease and
              confidence.
            </p>
            <Link
              href="/equipment"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              Explore equipment <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="hidden size-24 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 sm:flex">
            <PackageCheck className="size-12 text-cyan-200" strokeWidth={1.4} />
          </div>
        </div>
      </section>

      <section
        aria-label="Rental statistics"
        className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span
                className={`grid size-10 place-items-center rounded-xl ${stat.accent}`}
              >
                <stat.icon className="size-5" />
              </span>
              <ArrowDownRight className="size-4 text-slate-300" />
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              {stat.value}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {stat.label}
            </p>
            <p className="mt-1 text-xs text-slate-400">{stat.note}</p>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Pending bookings",
            count: pendingCount,
            icon: Clock3,
            tone: "border-amber-200 bg-amber-50 text-amber-800",
          },
          {
            label: "Confirmed",
            count: confirmedCount,
            icon: CheckCircle2,
            tone: "border-blue-200 bg-blue-50 text-blue-800",
          },
          {
            label: "Cancelled",
            count: cancelledCount,
            icon: XCircle,
            tone: "border-rose-200 bg-rose-50 text-rose-800",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 ${item.tone}`}
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <item.icon className="size-4" />
              {item.label}
            </span>
            <span className="text-sm font-bold">{item.count}</span>
          </div>
        ))}
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900">Your booking overview</h2>
              <p className="mt-1 text-xs text-slate-500">
                Booking activity over the last six months
              </p>
            </div>
            <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
              Last 6 months
            </span>
          </div>
          <div className="mt-5 h-56 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
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
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  name="Bookings"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#2563eb", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-slate-900">Booking status</h2>
          <p className="mt-1 text-xs text-slate-500">
            A quick look at your rental progress
          </p>
          <div className="relative mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                  stroke="none"
                >
                  {statusData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">
                {bookings.length}
              </span>
              <span className="text-[11px] text-slate-500">Bookings</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {statusData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-2 text-xs text-slate-500"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-full"
                    style={{
                      backgroundColor:
                        CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">Recent rentals</h2>
            <p className="mt-1 text-xs text-slate-500">
              Your latest booking activity
            </p>
          </div>
          <Link
            href="/dashboard/my-rentals"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        {bookingsLoading ? (
          <LoadingRows />
        ) : bookingsError ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
          >
            {bookingsError}
          </div>
        ) : (
          <RentalsTable bookings={bookings.slice(0, 5)} compact />
        )}
      </section>
    </>
  );
}

export function CustomerDashboardView() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const favorites = useFavorites();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");

  useEffect(() => {
    if (user === null) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [user, router, pathname]);

  useEffect(() => {
    if (user?.role !== "customer") return;
    let cancelled = false;
    api<{ items: Booking[] }>("/api/bookings/mine")
      .then((data) => {
        if (cancelled) return;
        setBookings(data.items);
        setBookingsLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setBookingsError(
          error instanceof Error ? error.message : "Could not load your rentals."
        );
        setBookingsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email, user?.role]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") !== "google") return;
    toast.success("Signed in with Google successfully!");
    params.delete("auth");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (query ? `?${query}` : "")
    );
  }, []);

  const section =
    pathname === "/dashboard/my-rentals"
      ? "rentals"
      : pathname === "/dashboard/favorites"
        ? "favorites"
        : pathname === "/dashboard/profile"
          ? "profile"
          : "overview";
  const pageTitle =
    section === "rentals"
      ? "My Rentals"
      : section === "favorites"
        ? "My Favorites"
        : section === "profile"
          ? "Profile Settings"
          : "Customer Overview";

  const handleRemoveFavorite = async (equipment: FavoriteEquipment) => {
    try {
      await favorites.toggle(equipment);
      toast.success("Removed from favorites");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not remove favorite"
      );
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

  if (user.role !== "customer") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <section className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <UserRound className="mx-auto size-10 text-blue-700" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            {user.role === "owner" ? "Owner dashboard" : "Admin dashboard"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This dashboard is for customer accounts. Your {user.role} workspace
            is separate.
          </p>
          {user.role === "owner" ? (
            <Link
              href="/dashboard/owner/add-equipment"
              className="mt-5 inline-flex rounded-lg bg-[#0b1f8f] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Go to owner tools
            </Link>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#071a9e] text-white lg:flex">
        <Link
          href="/"
          className="flex h-[76px] items-center gap-3 border-b border-white/10 px-6"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-white text-blue-800">
            <PackageCheck className="size-5" />
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

        <nav aria-label="Customer dashboard" className="flex-1 space-y-1 px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
            Workspace
          </p>
          {DASHBOARD_LINKS.map((item) => {
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
                {item.label === "Favorites" && favorites.items.length > 0 ? (
                  <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-[10px]">
                    {favorites.items.length}
                  </span>
                ) : null}
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
                Rentora / Customer
              </p>
              <h1 className="truncate text-base font-bold text-slate-900">
                {pageTitle}
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
                href="/dashboard/profile"
                aria-label="Open profile settings"
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
            aria-label="Customer dashboard mobile"
            className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden"
          >
            {DASHBOARD_LINKS.map((item) => {
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
          <CustomerDashboardContent
            section={section}
            user={user}
            bookings={bookings}
            bookingsLoading={bookingsLoading}
            bookingsError={bookingsError}
            favorites={favorites}
            onRemoveFavorite={handleRemoveFavorite}
          />
        </main>
      </div>
    </div>
  );
}
