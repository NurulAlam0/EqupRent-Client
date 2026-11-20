"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { cn } from "cn";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Equipment", href: "/equipment" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
];

export function Header() {
  const [open, setOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toggleTheme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 16);
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  React.useEffect(() => {
    if (!userMenuOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !userMenuRef.current?.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUserMenuOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    setUserMenuOpen(false);
    toast.success("Logged out successfully");
    router.push("/");
  };

  const authActions = user ? (
    <>
      <Link
        href="/dashboard"
        className={cn(
          "rounded-full border border-white/70 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10",
          pathname === "/dashboard" && "bg-white/15"
        )}
      >
        Dashboard
      </Link>
      <div className="relative" ref={userMenuRef}>
        <button
          type="button"
          aria-label="Open account menu"
          aria-haspopup="menu"
          aria-expanded={userMenuOpen}
          onClick={() => setUserMenuOpen((isOpen) => !isOpen)}
          className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Image
            src={user.photo}
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-full object-cover ring-1 ring-white/40"
          />
          <span className="hidden max-w-28 truncate text-sm font-medium xl:block">
            {user.name}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`hidden size-4 transition-transform xl:block ${
              userMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {userMenuOpen ? (
          <div
            role="menu"
            aria-label="Account menu"
            className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl shadow-blue-950/15"
          >
            <p className="truncate px-3 py-2 text-xs text-slate-500">
              Signed in as {user.email}
            </p>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:bg-rose-50 focus-visible:outline-none"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </>
  ) : (
    <>
      <Link
        href="/login"
        className="rounded-full border border-white/70 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-white/90"
      >
        Sign Up
      </Link>
    </>
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[1000] bg-[#071a9e] dark:bg-[#05106b] transition-shadow duration-300",
        isScrolled
          ? "shadow-md shadow-blue-950/25 dark:shadow-black/30"
          : "shadow-sm shadow-blue-950/15 dark:shadow-black/20"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-white dark:text-white">
          <Image
            src="/image/logo-mark.png"
            alt=""
            width={44}
            height={44}
            className="size-11 rounded-xl ring-1 ring-white/20"
          />
          <span className="text-2xl font-bold tracking-tight">Rentora</span>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main"
          className="hidden items-center gap-7 lg:flex xl:gap-9"
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "relative py-1 text-[15px] font-medium text-white/85 dark:text-white/80 transition-colors hover:text-white dark:hover:text-white",
                  active && "font-semibold text-white dark:text-white"
                )}
              >
                {link.label}
                {active ? (
                  <span
                    aria-hidden
                    className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-cyan-400"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-4 lg:flex">
          <button
            type="button"
            aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
            className="p-2 rounded-full text-white/85 dark:text-white/80 transition-colors hover:text-white dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
          </button>
          {authActions}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="p-2 text-white dark:text-white lg:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open ? (
        <div className="mx-4 rounded-2xl border border-white/15 dark:border-white/10 bg-[#0b1f8f]/95 dark:bg-[#05106b]/95 p-6 shadow-2xl backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-white/85 dark:text-white/80">Appearance</span>
            <button
              type="button"
              aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onClick={toggleTheme}
              className="p-2 rounded-full text-white/85 dark:text-white/80 transition-colors hover:text-white dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/5"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "text-[15px] font-medium text-white/85 hover:text-white",
                    active && "font-semibold text-cyan-300"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 flex flex-wrap gap-3 border-t border-white/20 pt-5">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex min-w-28 items-center justify-center gap-2 rounded-full border border-white/70 dark:border-white/50 px-5 py-2 text-sm font-semibold text-white dark:text-white hover:bg-white/10 dark:hover:bg-white/5"
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-w-28 items-center justify-center gap-2 rounded-full bg-white dark:bg-white px-5 py-2 text-sm font-semibold text-slate-900 dark:text-slate-900 hover:bg-white/90 dark:hover:bg-white/80"
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-white/70 dark:border-white/50 px-5 py-2 text-center text-sm font-semibold text-white dark:text-white hover:bg-white/10 dark:hover:bg-white/5"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full bg-white dark:bg-white px-5 py-2 text-center text-sm font-semibold text-slate-900 dark:text-slate-900 hover:bg-white/90 dark:hover:bg-white/80"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
