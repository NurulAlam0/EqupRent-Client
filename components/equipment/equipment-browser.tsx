"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ListFilter,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { API_URL } from "@/lib/auth-context";
import {
  EquipmentCard,
  type EquipmentItem,
} from "@/components/equipment/equipment-card";

const EQUIPMENT_API_URL = `${API_URL.replace(/\/+$/, "")}/api/equipment`;
const SEARCH_DEBOUNCE_MS = 250;

const CATEGORIES = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
] as const;

type Filters = {
  search: string;
  location: string;
  category: string;
  rentalType: string;
  minPrice: string;
  maxPrice: string;
  availability: string;
  sort: string;
  page: string;
};

const INITIAL_FILTERS: Filters = {
  search: "",
  location: "",
  category: "",
  rentalType: "",
  minPrice: "",
  maxPrice: "",
  availability: "all",
  sort: "recent",
  page: "1",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function EquipmentSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
      <div className="aspect-[16/10] animate-pulse bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-9 w-full animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-b border-slate-100 py-5 last:border-0">
      <legend className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export function EquipmentBrowser() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState(0);
  const [urlReady, setUrlReady] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value &&
        !(key === "availability" && value === "all") &&
        !(key === "sort" && value === "recent") &&
        !(key === "page" && value === "1")
      ) {
        params.set(key, value);
      }
    });
    return params.toString();
  }, [filters]);

  useEffect(() => {
    const readUrlFilters = () => {
      const params = new URLSearchParams(window.location.search);
      const nextFilters: Filters = {
        search: params.get("search") ?? "",
        location: params.get("location") ?? "",
        category: params.get("category") ?? "",
        rentalType: params.get("rentalType") ?? "",
        minPrice: params.get("minPrice") ?? "",
        maxPrice: params.get("maxPrice") ?? "",
        availability: params.get("availability") ?? "all",
        sort: params.get("sort") ?? "recent",
        page: params.get("page") ?? "1",
      };
      setFilters(nextFilters);
      setSearchTerm(nextFilters.search);
      setUrlReady(true);
    };

    readUrlFilters();
    window.addEventListener("popstate", readUrlFilters);
    return () => window.removeEventListener("popstate", readUrlFilters);
  }, []);

  useEffect(() => {
    if (!urlReady) return;

    const params = new URLSearchParams(query);
    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${
      queryString ? `?${queryString}` : ""
    }${window.location.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [query, urlReady]);

  useEffect(() => {
    if (!urlReady) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `${EQUIPMENT_API_URL}${query ? `?${query}` : ""}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          const result = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
          throw new Error(result?.message ?? "Could not load equipment.");
        }
        const result = (await response.json()) as {
          items: EquipmentItem[];
          total: number;
          page: number;
          totalPages: number;
        };
        setItems(result.items);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setFilters((current) =>
          current.page === String(result.page)
            ? current
            : { ...current, page: String(result.page) }
        );
      } catch (cause) {
        if (cause instanceof Error && cause.name === "AbortError") return;
        setError(
          cause instanceof Error ? cause.message : "Could not load equipment."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [filters.search, query, requestId, urlReady]);

  const update = (key: keyof Filters, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "page" ? {} : { page: "1" }),
    }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters(INITIAL_FILTERS);
  };

  const currentPage = Number(filters.page) || 1;

  const filterControls = (
    <>
      <FilterSection title="Category">
        <div className="space-y-2.5">
          {CATEGORIES.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 transition hover:text-blue-700"
            >
              <input
                type="radio"
                name="category"
                checked={filters.category === category}
                onChange={() =>
                  update(
                    "category",
                    filters.category === category ? "" : category
                  )
                }
                className="size-4 accent-blue-700"
              />
              {category}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Rental type">
        <div className="flex flex-wrap gap-2">
          {["Daily", "Weekly", "Monthly"].map((rentalType) => (
            <button
              key={rentalType}
              type="button"
              onClick={() =>
                update(
                  "rentalType",
                  filters.rentalType === rentalType ? "" : rentalType
                )
              }
              aria-pressed={filters.rentalType === rentalType}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                filters.rentalType === rentalType
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-slate-200 text-slate-600 hover:border-blue-300"
              }`}
            >
              {rentalType}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price range (৳)">
        <div className="grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor="min-price">
            Minimum price
          </label>
          <input
            id="min-price"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(event) => update("minPrice", event.target.value)}
            className="h-10 min-w-0 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <label className="sr-only" htmlFor="max-price">
            Maximum price
          </label>
          <input
            id="max-price"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(event) => update("maxPrice", event.target.value)}
            className="h-10 min-w-0 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <div className="space-y-2.5">
          {[
            ["all", "All equipment"],
            ["available", "Available now"],
            ["unavailable", "Rented out"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600"
            >
              <input
                type="radio"
                name="availability"
                checked={filters.availability === value}
                onChange={() => update("availability", value)}
                className="size-4 accent-blue-700"
              />
              {label}
            </label>
          ))}
        </div>
      </FilterSection>
    </>
  );

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071a9e] via-[#1140f0] to-[#1689ed] pt-28 text-white sm:pt-32">
        <div
          aria-hidden
          className="absolute -right-20 -top-32 size-96 rounded-full bg-cyan-300/20 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-8 px-5 pb-12 sm:px-6 sm:pb-14">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.45 }}
            className="max-w-2xl"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
              Explore & rent
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              All Equipment
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Find the right tools, gear, and equipment for your next project.
              Compare options and rent with confidence.
            </p>
          </motion.div>
          <div className="hidden size-32 shrink-0 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur sm:flex">
            <ListFilter className="size-14 text-cyan-200" strokeWidth={1.4} />
          </div>
        </div>
      </section>

      <section className="bg-[#f8fafc] py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <form
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                setFilters((current) => ({
                  ...current,
                  search: searchTerm.trim(),
                  page: "1",
                }));
                setRequestId((current) => current + 1);
              }}
              className="flex h-12 w-full max-w-2xl items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100"
            >
              <Search className="size-5 shrink-0 text-slate-400" aria-hidden />
              <label className="sr-only" htmlFor="equipment-search">
                Search equipment by name, location or category
              </label>
              <input
                id="equipment-search"
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchTerm(value);
                  setFilters((current) => ({
                    ...current,
                    search: value,
                    page: "1",
                  }));
                }}
                placeholder="Search equipment name or category..."
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              {searchTerm ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchTerm("");
                    update("search", "");
                  }}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="size-4" />
                </button>
              ) : null}
              <button
                type="submit"
                className="h-9 shrink-0 rounded-lg bg-[#0b1f8f] px-4 text-sm font-semibold text-white transition hover:bg-[#091674]"
              >
                Search
              </button>
            </form>

            <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500 shadow-sm">
              <SlidersHorizontal className="size-4" aria-hidden />
              <span className="shrink-0">Sort by</span>
              <select
                aria-label="Sort equipment"
                value={filters.sort}
                onChange={(event) => update("sort", event.target.value)}
                className="min-w-0 bg-transparent font-semibold text-slate-700 outline-none"
              >
                <option value="recent">Recently added</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-slate-200 bg-white px-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 py-4">
                <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                  <ListFilter className="size-4 text-blue-700" />
                  Filters
                </h2>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                >
                  Clear all
                </button>
              </div>
              {filterControls}
              <div className="pb-5">
                <label
                  htmlFor="location-search"
                  className="mb-3 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500"
                >
                  Location
                </label>
                <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-blue-500">
                  <MapPin className="size-4 shrink-0 text-slate-400" />
                  <input
                    id="location-search"
                    type="search"
                    value={filters.location}
                    onChange={(event) => update("location", event.target.value)}
                    placeholder="Search a location..."
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Search matches locations from approved equipment listings.
                </p>
              </div>
            </aside>

            <div className="min-w-0">
              <div
                className="mb-4 flex min-h-8 items-center justify-between gap-3"
                aria-live="polite"
              >
                <p className="text-sm font-medium text-slate-500">
                  {loading
                    ? "Finding equipment..."
                    : `Showing ${total === 1 ? "1 equipment item" : `${total} equipment items`}`}
                </p>
                <p className="hidden text-xs text-slate-400 sm:block">
                  Approved listings only
                </p>
              </div>

              {error ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center"
                >
                  <p className="font-semibold text-rose-800">
                    Equipment could not be loaded
                  </p>
                  <p className="mt-1 text-sm text-rose-700">{error}</p>
                  <button
                    type="button"
                    onClick={() => setRequestId((current) => current + 1)}
                    className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
                  >
                    Try again
                  </button>
                </div>
              ) : loading ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }, (_, index) => (
                    <EquipmentSkeleton key={index} />
                  ))}
                </div>
              ) : items.length ? (
                <>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.06 } },
                    }}
                    className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                  >
                    {items.map((item) => (
                      <motion.div key={item._id} variants={fadeUp}>
                        <EquipmentCard item={item} />
                      </motion.div>
                    ))}
                  </motion.div>
                  {totalPages > 1 ? (
                    <nav
                      aria-label="Equipment pagination"
                      className="mt-8 flex flex-wrap items-center justify-center gap-2"
                    >
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() =>
                          update("page", String(Math.max(1, currentPage - 1)))
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                        (page) => (
                          <button
                            key={page}
                            type="button"
                            aria-current={page === currentPage ? "page" : undefined}
                            onClick={() => update("page", String(page))}
                            className={`grid size-9 place-items-center rounded-lg text-sm font-semibold transition ${
                              page === currentPage
                                ? "bg-[#0b1f8f] text-white"
                                : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          update(
                            "page",
                            String(Math.min(totalPages, currentPage + 1))
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>
                    </nav>
                  ) : null}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                  <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                    <Search className="size-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-slate-900">
                    No matching equipment
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Try a different search or remove some filters to see more
                    approved listings.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-lg bg-[#0b1f8f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#091674]"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
