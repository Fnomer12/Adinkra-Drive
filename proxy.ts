import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const adminSession = request.cookies.get("admin_session");

  const isAdminRoute = request.nextUrl.pathname.startsWith("/Admin00");
  const isLoginRoute = request.nextUrl.pathname.startsWith("/login");

  if (isAdminRoute && !adminSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoginRoute && adminSession) {
    return NextResponse.redirect(new URL("/Admin00", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/Admin00/:path*", "/login"],
};