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
  /** Redirects the browser to the server's Google OAuth entry point. */
  loginWithGoogle: () => void;
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

/** Base URL of the Express API (configured via environment variable). */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050";

const TOKEN_KEY = "rentora:token";
const AUTH_EVENT = "rentora:auth-change";

/* ------------------------------------------------------------------ */
/* JWT storage (localStorage when "keep me signed in", else session)    */
/* ------------------------------------------------------------------ */

function readToken(): string | null {
  try {
    return (
      window.localStorage.getItem(TOKEN_KEY) ??
      window.sessionStorage.getItem(TOKEN_KEY)
    );
  } catch {
    return null;
  }
}

function saveToken(token: string, persist: boolean) {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);
    (persist ? window.localStorage : window.sessionStorage).setItem(
      TOKEN_KEY,
      token
    );
  } catch {
    // Storage unavailable — the httpOnly cookie still keeps the session alive.
  }
}

function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

/* ------------------------------------------------------------------ */
/* External store: no setState, so no hydration mismatch               */
/* ------------------------------------------------------------------ */

let currentUser: AuthUser | null | undefined = undefined;

function getSnapshot(): AuthUser | null | undefined {
  return currentUser;
}

function getServerSnapshot(): AuthUser | null | undefined {
  return undefined;
}

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(AUTH_EVENT, onStoreChange);
  return () => window.removeEventListener(AUTH_EVENT, onStoreChange);
}

function setSession(user: AuthUser | null) {
  currentUser = user;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

/* ------------------------------------------------------------------ */
/* API helper — attaches the JWT, surfaces server error messages        */
/* ------------------------------------------------------------------ */

/**
 * API helper — attaches the JWT from storage, sends cookies and surfaces
 * the server's error message. Exported so feature modules (favorites)
 * share one authenticated request path instead of re-implementing it.
 */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = readToken();
  let res: Response;
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
      "Cannot reach the server. Make sure the API is running on " + API_URL
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

  const data = await api<{ token: string; user: AuthUser }>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ name, email, photo, password: input.password }),
    }
  );
  saveToken(data.token, true);
  setSession(data.user);
  return data.user;
}

async function login(input: LoginInput): Promise<AuthUser> {
  const email = input.email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("Please enter a valid email address.");
  }
  if (!input.password) throw new Error("Please enter your password.");

  const data = await api<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: input.password,
      keepSignedIn: input.keepSignedIn,
    }),
  });
  saveToken(data.token, input.keepSignedIn);
  setSession(data.user);
  return data.user;
}

async function updateProfile(input: ProfileInput): Promise<AuthUser> {
  const data = await api<{ user: AuthUser }>("/api/auth/me", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  setSession(data.user);
  return data.user;
}

function loginWithGoogle() {
  // Full-page navigation to another origin (the Express API's OAuth entry
  // point) — not an internal Next.js route, so window.location is correct.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `${API_URL}/api/auth/google`;
}

async function logout(): Promise<void> {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch {
    // Server may already be gone — clear the local session anyway.
  }
  clearToken();
  setSession(null);
}

const ACTIONS: AuthActions = {
  register,
  login,
  loginWithGoogle,
  updateProfile,
  logout,
};
const AuthContext = React.createContext<AuthActions | null>(null);

/**
 * Reads the JWT session from the Express API on mount, then exposes the
 * signed-in user to the navbar, forms and private routes.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await api<{ user: AuthUser }>("/api/auth/me");
        if (!cancelled) setSession(data.user);
      } catch {
        clearToken();
        if (!cancelled) setSession(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={ACTIONS}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const actions = React.useContext(AuthContext);
  if (!actions) throw new Error("useAuth must be used within <AuthProvider>");
  const user = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return React.useMemo(() => ({ user, ...actions }), [user, actions]);
}
