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
  loginWithGoogle: () => void;
  updateProfile: (input: ProfileInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  becomeOwner: () => Promise<AuthUser>;
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

/** Direct Express origin, used only for Google sign-in / logout (cross-origin). */
const BACKEND_DIRECT_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://equip-rent-server-pi.vercel.app";

/**
 * The Express API lives on a different Vercel origin from the Next.js
 * client, so its httpOnly `access_token` cookie is never sent to the
 * client origin (and a rewrite never carries it either). The JWT is
 * therefore also kept client-side — in localStorage and in a
 * client-domain `access_token` cookie the Next.js route guard can read —
 * and sent to Express as `Authorization: Bearer <token>`, which
 * `verifyToken` already accepts. This is what unifies the two auth
 * systems: one sign-in creates BOTH a Better Auth session (client
 * domain) and an Express JWT (API), and the Express user is the
 * authoritative one for role/profile, because that is the store the
 * admin panel and the dashboards read.
 */
const TOKEN_KEY = "rentora_access_token";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string, persist: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable — the cookie below still carries the token */
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `access_token=${token}; path=/; SameSite=Lax${persist ? `; max-age=${7 * 24 * 60 * 60}` : ""}${secure}`;
}

function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
}

/* ------------------------------------------------------------------ */
/* API helper — sends the JWT and surfaces server errors               */
/* ------------------------------------------------------------------ */

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  const token = getStoredToken();
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
/* Express sync — one sign-in, two sessions                            */
/* ------------------------------------------------------------------ */

type ExpressAuthResult = { token: string; user: unknown } | null;

function parseExpressAuth(data: unknown): ExpressAuthResult {
  const value = (data ?? {}) as { token?: unknown; user?: unknown };
  return typeof value.token === "string" && value.token
    ? { token: value.token, user: value.user }
    : null;
}

/**
 * Ensures the same credentials also exist in the Express (Mongoose)
 * user store and returns its JWT. Login first; if Express has no such
 * account, register one with the same credentials. Returns null when
 * the account exists only via Google (no password to sync) or when
 * Express is unreachable — the Better Auth session still stands in
 * that case, and the next login retries the sync.
 * Express auth goes through `/backend-api/*` (Next rewrite to the
 * backend), because `/api/auth/*` on the client origin is Better Auth.
 */
async function ensureExpressSession(input: {
  name: string;
  email: string;
  photo: string;
  password: string;
  keepSignedIn: boolean;
}): Promise<ExpressAuthResult> {
  const photo = input.photo.trim() || "/image/logo-mark.png";
  const name = input.name.trim() || input.email.split("@")[0];
  const headers = { "Content-Type": "application/json" };

  try {
    const loginRes = await fetch("/backend-api/auth/login", {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        keepSignedIn: input.keepSignedIn,
      }),
    });
    if (loginRes.ok) return parseExpressAuth(await loginRes.json());
    const loginData = (await loginRes.json().catch(() => null)) as {
      message?: string;
    } | null;
    if (/google/i.test(loginData?.message ?? "")) return null;
    if (loginRes.status !== 401) return null;

    const registerRes = await fetch("/backend-api/auth/register", {
      method: "POST",
      headers,
      body: JSON.stringify({ name, email: input.email, photo, password: input.password }),
    });
    if (registerRes.ok) return parseExpressAuth(await registerRes.json());
    if (registerRes.status !== 409) return null;

    const retryRes = await fetch("/backend-api/auth/login", {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        keepSignedIn: input.keepSignedIn,
      }),
    });
    if (retryRes.ok) return parseExpressAuth(await retryRes.json());
    return null;
  } catch (error) {
    console.warn("Could not sync the Express session:", error);
    return null;
  }
}

function loginWithGoogle() {
  const backendUrl = BACKEND_DIRECT_URL;
  // The OAuth entry point is on the separate Express origin.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `${backendUrl.replace(/\/+$/, "")}/api/auth/google`;
}

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

function mapSessionUser(user: unknown): AuthUser {
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
 * Reads the session and exposes the signed-in user. The Express (JWT)
 * user wins when present, because its role is the one the admin panel
 * changes and the dashboards enforce; the Better Auth user is the
 * fallback so the dashboard still loads if the Express sync failed.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const betterAuthUser = session?.user;
  const sessionUserId = betterAuthUser?.id;
  const [jwtUser, setJwtUser] = React.useState<AuthUser | null | undefined>(undefined);
  const [tokenVersion, setTokenVersion] = React.useState(0);

  React.useEffect(() => {
    if (isPending) return;
    let cancelled = false;
    void (async () => {
      const token = getStoredToken();
      if (token) {
        try {
          const response = await fetch("/backend-api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          if (response.ok) {
            const data = (await response.json()) as { user?: unknown; token?: string };
            if (data.token) storeToken(data.token, true);
            if (!cancelled) setJwtUser(mapSessionUser(data.user));
            return;
          }
          clearStoredToken();
          if (!cancelled) setJwtUser(null);
          return;
        } catch (error) {
          console.error("Could not load the Express API session:", error);
          if (!cancelled) setJwtUser(null);
          return;
        }
      }

      // No stored JWT and no Better Auth user: this is the Google
      // landing. The Express `access_token` cookie lives on the server
      // domain, so exchange it here (direct, credentials:include) for
      // a Bearer token we can store on the client domain. After this
      // runs once, reloads use the stored token above.
      if (betterAuthUser) {
        if (!cancelled) setJwtUser(null);
        return;
      }
      try {
        const response = await fetch(
          `${BACKEND_DIRECT_URL.replace(/\/+$/, "")}/api/auth/me`,
          { credentials: "include", cache: "no-store" }
        );
        if (response.status === 401 || response.status === 403) {
          if (!cancelled) setJwtUser(null);
          return;
        }
        if (!response.ok) {
          throw new Error(`Could not read the API session (${response.status}).`);
        }
        const data = (await response.json()) as { user?: unknown; token?: string };
        if (data.token) storeToken(data.token, true);
        if (!cancelled) setJwtUser(mapSessionUser(data.user));
      } catch (error) {
        console.error("Could not load the Express API session:", error);
        if (!cancelled) setJwtUser(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPending, sessionUserId, tokenVersion]);

  const register = React.useCallback(async (input: RegisterInput): Promise<AuthUser> => {
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
    const betterAuthCreated = mapSessionUser(result.data?.user);

    const synced = await ensureExpressSession({
      name,
      email,
      photo,
      password: input.password,
      keepSignedIn: true,
    });
    if (synced) {
      storeToken(synced.token, true);
      const expressUser = mapSessionUser(synced.user);
      setJwtUser(expressUser);
      return expressUser;
    }
    setTokenVersion((v) => v + 1);
    return betterAuthCreated;
  }, []);

  const login = React.useCallback(async (input: LoginInput): Promise<AuthUser> => {
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
    const betterAuthUser = mapSessionUser(result.data?.user);

    const synced = await ensureExpressSession({
      name: betterAuthUser.name,
      email,
      photo: betterAuthUser.photo,
      password: input.password,
      keepSignedIn: input.keepSignedIn,
    });
    if (synced) {
      storeToken(synced.token, input.keepSignedIn);
      const expressUser = mapSessionUser(synced.user);
      setJwtUser(expressUser);
      return expressUser;
    }
    setTokenVersion((v) => v + 1);
    return betterAuthUser;
  }, []);

  const updateProfile = React.useCallback(async (input: ProfileInput): Promise<AuthUser> => {
    const result = await authClient.updateUser({
      name: input.name,
      image: input.photo,
      phoneNumber: input.phoneNumber,
      address: input.address,
    });
    if (result.error) throw new Error(result.error.message ?? "Profile update failed.");

    // Sync to Express too — it is the store the dashboards read.
    const token = getStoredToken();
    if (token) {
      try {
        const response = await fetch("/backend-api/auth/me", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });
        if (response.ok) {
          const data = (await response.json()) as { user?: unknown };
          const expressUser = mapSessionUser(data.user);
          setJwtUser(expressUser);
          return expressUser;
        }
      } catch (error) {
        console.warn("Could not sync the profile update to the Express API:", error);
      }
    }
    const session = await authClient.getSession();
    if (session.error) throw new Error(session.error.message ?? "Profile update failed.");
    return mapSessionUser(session.data?.user);
  }, []);

  const logout = React.useCallback(async (): Promise<void> => {
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message ?? "Could not sign out.");
    } catch (error) {
      console.warn("Better Auth sign-out failed, clearing the local session anyway:", error);
    }
    clearStoredToken();
    setJwtUser(null);
    setTokenVersion((v) => v + 1);
    try {
      await fetch(`${BACKEND_DIRECT_URL.replace(/\/+$/, "")}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* the local session is already cleared; a stale server cookie is harmless */
    }
  }, []);

  const becomeOwner = React.useCallback(async (): Promise<AuthUser> => {
    const token = getStoredToken();
    if (!token) throw new Error("Please sign in again to switch to an owner account.");
    const response = await fetch("/backend-api/auth/become-owner", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = (await response.json().catch(() => null)) as {
      token?: string;
      user?: unknown;
      message?: string;
    } | null;
    if (!response.ok) {
      throw new Error(data?.message ?? `Could not switch to owner (${response.status}).`);
    }
    if (data?.token) storeToken(data.token, true);
    const expressUser = mapSessionUser(data?.user);
    setJwtUser(expressUser);
    return expressUser;
  }, []);

  const user: AuthUser | null | undefined = jwtUser
    ? jwtUser
    : betterAuthUser
      ? mapSessionUser(betterAuthUser)
      : isPending || jwtUser === undefined
        ? undefined
        : null;

  const value = React.useMemo(
    () => ({ user, register, login, loginWithGoogle, updateProfile, logout, becomeOwner }),
    [user, register, login, updateProfile, logout, becomeOwner]
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
