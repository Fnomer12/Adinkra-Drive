import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminArea = pathname.startsWith("/admin");
  const isPublicAdminPage =
    pathname === "/admin/login" || pathname === "/admin/verify";
  const isAdminApi =
    pathname.startsWith("/api/admin/login") ||
    pathname.startsWith("/api/admin/verify") ||
    pathname.startsWith("/api/admin/logout");

  if (!isAdminArea || isPublicAdminPage || isAdminApi) {
    return NextResponse.next();
  }

  const session = request.cookies.get("admin_session")?.value;

  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};