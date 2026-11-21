"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Camera, Check, Eye, EyeOff, Lock, Mail, User, X } from "lucide-react";
import { cn } from "cn";
import { useAuth } from "@/lib/auth-context";
import { FormField } from "@/components/auth/form-field";
import { GoogleIcon } from "@/components/auth/google-icon";

export function RegisterForm() {
  const router = useRouter();
  const { register, loginWithGoogle, user } = useAuth();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [photo, setPhoto] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Already signed in → skip the form. (`undefined` = still hydrating.)
  React.useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const rules = [
    { label: "At least 6 characters", ok: password.length >= 6 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "One lowercase letter", ok: /[a-z]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const session = await register({ name, email, photo, password });
      toast.success(`Welcome to Rentora, ${session.name.split(" ")[0]}!`);
      router.push("/dashboard");
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
        Create your account
      </h2>
      <p className="mt-1 text-sm leading-5 text-slate-500">
        Register to book equipment, save favorites and manage your rentals.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-2.5" noValidate>
        <FormField
          id="name"
          label="Full name"
          icon={User}
          value={name}
          onChange={setName}
          placeholder="e.g. Rahim Uddin"
          autoComplete="name"
        />
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
          id="photo"
          label="Photo URL"
          icon={Camera}
          value={photo}
          onChange={setPhoto}
          placeholder="https://i.imgur.com/your-photo.jpg"
          autoComplete="url"
        />

        <div>
          <FormField
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            icon={Lock}
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="new-password"
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
          <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
            {rules.map((r) => (
              <li
                key={r.label}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium",
                  r.ok ? "text-emerald-600" : "text-slate-500"
                )}
              >
                {r.ok ? (
                  <Check className="size-3.5 shrink-0" />
                ) : (
                  <X className="size-3.5 shrink-0" />
                )}
                {r.label}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="h-11 w-full rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-transform hover:scale-[1.01] disabled:scale-100 disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
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
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
