"use client";

import * as React from "react";
import { authClient } from "@/lib/auth-client";

export type UserRole = "customer" | "owner" | "admin";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  photo: string;
  phoneNumber: string;
  address: string;
  role: UserRole;
};

type RegisterInput = {
  name: string;
  email: string;
  photo: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
  keepSignedIn: boolean;
};

type ProfileInput = Pick<AuthUser, "name" | "photo" | "phoneNumber" | "address">;

type AuthActions = {
  register: (input: RegisterInput) => Promise<AuthUser>;
  login: (input: LoginInput) => Promise<AuthUser>;
  updateProfile: (input: ProfileInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

type AuthContextValue = AuthActions & {
  /**
   * `undefined` — still hydrating from the API (same as the server render,
   * so SSR HTML matches). `null` — signed out. Object — signed in.
   */
  user: AuthUser | null | undefined;
};

/** Base URL of the Express API (empty in production so calls go through Next.js rewrite). */
export const API_URL =
  process.env.NODE_ENV === "production"
    ? ""
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050");

/* ------------------------------------------------------------------ */
/* API helper — sends Better Auth cookies and surfaces server errors   */
/* ------------------------------------------------------------------ */

/**
 * API helper — attaches the JWT from storage, sends cookies and surfaces
 * the server's error message. Exported so feature modules (favorites)
 * share one authenticated request path instead of re-implementing it.
 */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      API_URL
        ? "Cannot reach the server. Make sure the API is running on " + API_URL
        : "Cannot reach the server. Please check your connection."
    );
  }
  const data = (await res.json().catch(() => null)) as
    | { message?: string }
    | null;
  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed (${res.status}).`);
  }
  return data as T;
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

async function register(input: RegisterInput): Promise<AuthUser> {
  const name = input.name.trim();
  if (name.length < 2) throw new Error("Please enter your full name.");

  const email = input.email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  const photo = input.photo.trim();
  if (!/^(https:\/\/|\/)/.test(photo)) {
    throw new Error(
      "Photo must be a valid image URL starting with https:// (or /image/...)."
    );
  }

  if (!/[A-Z]/.test(input.password)) {
    throw new Error("Password must include an uppercase letter.");
  }
  if (!/[a-z]/.test(input.password)) {
    throw new Error("Password must include a lowercase letter.");
  }
  if (input.password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  const result = await authClient.signUp.email({
    name,
    email,
    password: input.password,
    image: photo,
  });
  if (result.error) throw new Error(result.error.message ?? "Registration failed.");
  return mapBetterAuthUser(result.data?.user);
}

async function login(input: LoginInput): Promise<AuthUser> {
  const email = input.email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("Please enter a valid email address.");
  }
  if (!input.password) throw new Error("Please enter your password.");

  const result = await authClient.signIn.email({
    email,
    password: input.password,
    rememberMe: input.keepSignedIn,
    callbackURL: "/dashboard",
  });
  if (result.error) throw new Error(result.error.message ?? "Sign in failed.");
  return mapBetterAuthUser(result.data?.user);
}

async function updateProfile(input: ProfileInput): Promise<AuthUser> {
  const result = await authClient.updateUser({
    name: input.name,
    image: input.photo,
    phoneNumber: input.phoneNumber,
    address: input.address,
  });
  if (result.error) throw new Error(result.error.message ?? "Profile update failed.");
  const session = await authClient.getSession();
  if (session.error) throw new Error(session.error.message ?? "Profile update failed.");
  return mapBetterAuthUser(session.data?.user);
}

async function logout(): Promise<void> {
  await authClient.signOut();
}

const ACTIONS: AuthActions = {
  register,
  login,
  updateProfile,
  logout,
};
const AuthContext = React.createContext<AuthContextValue | null>(null);

type BetterAuthUser = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  image?: string | null;
  photo?: string;
  phoneNumber?: string;
  address?: string;
  role?: UserRole;
};

function mapBetterAuthUser(user: unknown): AuthUser {
  const value = (user ?? {}) as BetterAuthUser;
  if (!value.id && !value._id) {
    throw new Error("Authentication succeeded but no user was returned.");
  }
  return {
    _id: value.id ?? value._id ?? "",
    name: value.name ?? "",
    email: value.email ?? "",
    photo: value.photo ?? value.image ?? "",
    phoneNumber: value.phoneNumber ?? "",
    address: value.address ?? "",
    role: value.role ?? "customer",
  };
}

/**
 * Reads the Better Auth session and exposes the signed-in user.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const user: AuthUser | null | undefined = isPending
    ? undefined
    : session?.user
      ? mapBetterAuthUser(session.user)
      : null;
  const value = React.useMemo(
    () => ({ user, ...ACTIONS }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = React.useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within <AuthProvider>");
  return value;
}
