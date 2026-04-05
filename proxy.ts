import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminSession = request.cookies.get("admin_session")?.value;
  const adminPending = request.cookies.get("admin_pending_login")?.value;

  // Protect dashboard
  if (pathname.startsWith("/ADmin00")) {
    if (!adminSession && !adminPending) {
      return NextResponse.redirect(new URL("/login/ADmin00", request.url));
    }

    if (!adminSession && adminPending) {
      return NextResponse.redirect(
        new URL("/login/ADmin00/verify", request.url)
      );
    }
  }

  // Prevent logged-in admin from going back to login/verify
  if (
    adminSession &&
    (pathname.startsWith("/login/ADmin00") ||
      pathname.startsWith("/login/ADmin00/verify"))
  ) {
    return NextResponse.redirect(new URL("/ADmin00", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ADmin00/:path*", "/login/ADmin00/:path*"],
};