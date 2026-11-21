import { NextResponse } from "next/server";

export function GET(request: Request) {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    return NextResponse.redirect(new URL("/login?error=google-config", request.url));
  }

  try {
    const destination = new URL("/api/auth/google", backendUrl);
    return NextResponse.redirect(destination);
  } catch {
    return NextResponse.redirect(new URL("/login?error=google-config", request.url));
  }
}
