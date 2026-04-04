import { NextRequest, NextResponse } from "next/server";

const ADMIN_DASHBOARD_PATH = "/ADmin00";
const ADMIN_LOGIN_PATH = "/login/ADmin00";
const ADMIN_VERIFY_PATH = "/login/ADmin00/verify";
const SESSION_COOKIE = "admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  const isDashboardRoute = pathname.startsWith(ADMIN_DASHBOARD_PATH);
  const isLoginRoute = pathname.startsWith(ADMIN_LOGIN_PATH);
  const isVerifyRoute = pathname.startsWith(ADMIN_VERIFY_PATH);

  if (isDashboardRoute && !session) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if ((isLoginRoute || isVerifyRoute) && session) {
    const dashboardUrl = new URL(ADMIN_DASHBOARD_PATH, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ADmin00/:path*", "/login/ADmin00/:path*"],
};