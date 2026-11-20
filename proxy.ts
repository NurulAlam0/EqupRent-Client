import { NextResponse, type NextRequest } from "next/server";

const API_URL =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050";

/**
 * Asks the API to validate the JWT cookie and return the user's role.
 * The secret never leaves the server — middleware just gets the verdict.
 */
async function fetchRole(token: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { role?: string };
    return data.role ?? null;
  } catch {
    return null;
  }
}

function isSafePath(path: string | null): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}

/**
 * Route guard (Next 16 "proxy", formerly middleware):
 * - /dashboard/* and /equipment/[id] require a valid JWT; role-gated
 *   dashboard sections redirect by role
 * - /login and /register bounce already-signed-in users to their dashboard
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value ?? null;

  const isPrivate =
    pathname.startsWith("/dashboard") ||
    // Equipment details are private; the single-segment matcher keeps the
    // public list page (/equipment) out of this branch.
    /^\/equipment\/[^/]+$/.test(pathname);
  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (!isPrivate && !isAuthPage) return NextResponse.next();

  const role = token ? await fetchRole(token) : null;

  if (isPrivate) {
    if (!role) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname + search);
      return NextResponse.redirect(loginUrl);
    }
    // Role-based dashboard sections (active as soon as those routes exist).
    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (
      pathname.startsWith("/dashboard/owner") &&
      role !== "owner" &&
      role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (
      /^\/dashboard\/(my-rentals|favorites|profile)(\/|$)/.test(pathname) &&
      role !== "customer"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Signed-in users shouldn't see the login/register forms again.
  if (role) {
    const next = request.nextUrl.searchParams.get("next");
    const target = isSafePath(next) ? next : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/equipment/:id", "/login", "/register"],
};
