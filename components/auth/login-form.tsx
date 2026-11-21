"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { FormField } from "@/components/auth/form-field";
import { GoogleIcon } from "@/components/auth/google-icon";

/** ?next=... set by the route guard, but only for safe local paths. */
function getNextPath(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const { login, loginWithGoogle, exchangeGoogleTicket, user } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [keepSignedIn, setKeepSignedIn] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  // Already signed in → skip the form. (`undefined` = still hydrating.)
  React.useEffect(() => {
    if (user) router.replace(getNextPath());
  }, [user, router]);

  // Handle Google OAuth exchange ticket (?exchange=<ticket>) — set by the
  // backend after the OAuth callback. Exchange it for a session cookie via
  // the same-origin /backend-api rewrite; the JWT is never in the URL.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get("exchange");
    const error = params.get("error");

    if (ticket) {
      // Remove the ticket from the URL immediately so a refresh doesn't
      // re-submit an already-consumed (single-use) ticket.
      params.delete("exchange");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (query ? `?${query}` : "")
      );
      exchangeGoogleTicket(ticket)
        .then((session) => {
          toast.success(`Welcome, ${session.name.split(" ")[0]}!`);
          router.replace(getNextPath());
        })
        .catch(() => {
          toast.error("Google sign-in failed. Please try again.");
        });
      return;
    }

    if (!error) return;
    toast.error(
      error === "google-config"
        ? "Google sign-in isn't configured on the server."
        : "Google sign-in failed. Please try again."
    );
    params.delete("error");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (query ? `?${query}` : "")
    );
  }, [exchangeGoogleTicket, router]);

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

      <div className="my-3.5 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-semibold text-slate-400">or</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={loginWithGoogle}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
      >
        <GoogleIcon className="size-5" />
        Continue with Google
      </button>

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
