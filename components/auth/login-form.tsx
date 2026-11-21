"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { FormField } from "@/components/auth/form-field";

/** ?next=... set by the route guard, but only for safe local paths. */
function getNextPath(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [keepSignedIn, setKeepSignedIn] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  // Already signed in → skip the form. (`undefined` = still hydrating.)
  React.useEffect(() => {
    if (user) router.replace(getNextPath());
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const session = await login({ email, password, keepSignedIn });
      toast.success(`Welcome back, ${session.name.split(" ")[0]}!`);
      router.push(getNextPath());
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-slate-900">
        Welcome back
      </h2>
      <p className="mt-1 text-sm leading-5 text-slate-500">
        Sign in to manage your rentals, favorites and bookings.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-2.5" noValidate>
        <FormField
          id="email"
          label="Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <FormField
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          icon={Lock}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-slate-400 transition hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="size-[18px]" />
              ) : (
                <Eye className="size-[18px]" />
              )}
            </button>
          }
        />

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 select-none">
          <input
            type="checkbox"
            checked={keepSignedIn}
            onChange={(e) => setKeepSignedIn(e.target.checked)}
            className="size-4 rounded border-slate-300 accent-blue-600"
          />
          Keep me signed in
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="h-11 w-full rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-transform hover:scale-[1.01] disabled:scale-100 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
