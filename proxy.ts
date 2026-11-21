import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

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

  const isPrivate =
    pathname.startsWith("/dashboard") ||
    // Equipment details are private; the single-segment matcher keeps the
    // public list page (/equipment) out of this branch.
    /^\/equipment\/[^/]+$/.test(pathname);
  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (!isPrivate && !isAuthPage) return NextResponse.next();

  let role: string | null = null;
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    role = session
      ? (session.user as { role?: string }).role ?? "customer"
      : null;
  } catch {
    role = null;
  }

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
