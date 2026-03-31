import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, code } = body;

    if (!username || !code) {
      return NextResponse.json(
        { error: "Missing username or verification code." },
        { status: 400 }
      );
    }

    // TODO:
    // 1. Check OTP in database
    // 2. Confirm it is correct and not expired
    // 3. Mark OTP used or delete it

    const sessionToken = crypto.randomBytes(32).toString("hex");

    const response = NextResponse.json({
      success: true,
      redirectTo: "/ADmin00",
    });

    response.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    console.error("Admin verify error:", error);
    return NextResponse.json(
      { error: "Verification failed." },
      { status: 500 }
    );
  }
}