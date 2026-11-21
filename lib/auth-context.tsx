"use client";

import * as React from "react";

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
  exchangeGoogleTicket: (ticket: string) => Promise<AuthUser>;
  updateProfile: (input: ProfileInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
};

type AuthContextValue = AuthActions & {
  /**
   * `undefined` — still hydrating from the API (same as the server render,
   * so SSR HTML matches). `null` — signed out. Object — signed in.
   */
  user: AuthUser | null | undefined;
};

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHOTO_RE = /^(https:\/\/|\/)/;

/**
 * Base URL of the Express API (empty in production so browser requests go
 * through the Next.js `/backend-api` rewrite on the same origin, keeping the
 * `access_token` cookie first-party and readable by the route guard).
 */
export const API_URL =
  process.env.NODE_ENV === "production"
    ? ""
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050");

/* ------------------------------------------------------------------ */
/* API helper                                                         */
/* ------------------------------------------------------------------ */

/**
 * Fetch wrapper that sends the httpOnly `access_token` cookie with every
 * request (`credentials: "include"`) and surfaces the server's error
 * message as a thrown `Error`. Used by every authenticated feature module.
 *
 * Browser requests always use same-origin paths proxied by `next.config.ts`
 * (`/backend-api/:path*`), so cookies are consistently stored on the frontend
 * domain in both development and production.
 */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  // Always use the same-origin Next.js rewrite so auth cookies are
  // stored for the frontend host in both development and production.
  const url = "/backend-api" + path.replace(/^\/api/, "");
  try {
    res = await fetch(url, {
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
/* Context                                                            */
/* ------------------------------------------------------------------ */

const AuthContext = React.createContext<AuthContextValue | null>(null);

/**
 * Single authentication provider. Express + MongoDB + JWT is the single
 * source of truth; Better Auth has been removed.
 *
 * All auth actions live inside the provider so they can call `setUser`
 * directly — user state is updated immediately without waiting for a
 * page navigation + remount cycle.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null | undefined>(undefined);

  // ---- session restoration ----------------------------------------
  /**
   * Restores the session from the httpOnly cookie by calling
   * `GET /backend-api/auth/me`. Returns the user when authenticated,
   * `null` when the cookie is missing/invalid/expired (HTTP 401).
   * Network failures are treated as signed out.
   */
  const refreshUser = React.useCallback(async (): Promise<AuthUser | null> => {
    try {
      const data = await api<{ user: AuthUser }>("/api/auth/me");
      return data.user ?? null;
    } catch {
      // Any error (401, network failure, etc.) — treat as signed out.
      return null;
    }
  }, []);

  // Restore the session once on mount. When returning from Google OAuth,
  // the one-time ticket exchange must run first; otherwise an initial /me
  // 401 could race with the exchange and overwrite the authenticated user.
  React.useEffect(() => {
    const hasGoogleExchangeTicket =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("exchange");

    if (hasGoogleExchangeTicket) {
      setUser(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      const restored = await refreshUser();
      if (!cancelled) setUser(restored);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  // ---- auth actions ------------------------------------------------

  const register = React.useCallback(async (input: RegisterInput): Promise<AuthUser> => {
    const name = input.name.trim();
    if (name.length < 2) throw new Error("Please enter your full name.");

    const email = input.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      throw new Error("Please enter a valid email address.");
    }

    const photo = input.photo.trim();
    // Photo is optional — an empty value is accepted and falls back to the
    // default profile image on the backend/UI. Only validate when provided.
    if (photo !== "" && !PHOTO_RE.test(photo)) {
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

    // The registration is only reported as successful once the backend has
    // created the user and issued a session cookie.
    const data = await api<{ user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, photo, password: input.password }),
    });
    setUser(data.user);
    return data.user;
  }, []);

  const login = React.useCallback(async (input: LoginInput): Promise<AuthUser> => {
    const email = input.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      throw new Error("Please enter a valid email address.");
    }
    if (!input.password) throw new Error("Please enter your password.");

    const data = await api<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password: input.password,
        keepSignedIn: input.keepSignedIn,
      }),
    });
    setUser(data.user);
    return data.user;
  }, []);

  /**
   * Exchanges a short-lived Google OAuth ticket (issued by the backend after
   * the OAuth callback) for a session cookie. The ticket is single-use and
   * expires in 60 s. The JWT is never exposed in the URL.
   */
  const exchangeGoogleTicket = React.useCallback(async (ticket: string): Promise<AuthUser> => {
    const data = await api<{ user: AuthUser }>("/api/auth/exchange", {
      method: "POST",
      body: JSON.stringify({ ticket }),
    });
    setUser(data.user);
    return data.user;
  }, []);

  const updateProfile = React.useCallback(async (input: ProfileInput): Promise<AuthUser> => {
    const data = await api<{ user: AuthUser }>("/api/auth/me", {
      method: "PUT",
      body: JSON.stringify(input),
    });
    setUser(data.user);
    return data.user;
  }, []);

  /**
   * Start OAuth on the backend's own origin so its oauth_state cookie is
   * available to the backend callback. The callback returns a short-lived
   * ticket to the frontend, which exchanges it through /backend-api.
   */
  const loginWithGoogle = React.useCallback(() => {
    window.location.href = "/auth/google";
  }, []);

  const logout = React.useCallback(async (): Promise<void> => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      // Even if the backend call fails, clear local state so the user
      // is not stuck in a signed-in UI.
    }
    setUser(null);
  }, []);

  // ---- context value -----------------------------------------------

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      register,
      login,
      loginWithGoogle,
      exchangeGoogleTicket,
      updateProfile,
      logout,
      refreshUser,
    }),
    [user, register, login, loginWithGoogle, exchangeGoogleTicket, updateProfile, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = React.useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within <AuthProvider>");
  return value;
}
