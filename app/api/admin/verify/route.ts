import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  makeSessionToken,
  verifyOtpCode,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const adminUserId = String(body.adminUserId || "").trim();
    const code = String(body.code || "").trim();

    if (!adminUserId || !code) {
      return NextResponse.json(
        { error: "Verification code is required." },
        { status: 400 }
      );
    }

    const isValid = await verifyOtpCode(adminUserId, code);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 401 }
      );
    }

    const token = makeSessionToken(adminUserId);
    const cookieStore = await cookies();

    cookieStore.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return NextResponse.json({
      success: true,
      message: "Admin verified successfully.",
    });
  } catch (error) {
    console.error("Admin verify error:", error);
    return NextResponse.json(
      { error: "Something went wrong during verification." },
      { status: 500 }
    );
  }
}