import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  createOtpRecord,
  findAdminByUsername,
  verifyAdminPassword,
  generateOtp,
} from "@/lib/admin-auth";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing");
  }

  return new Resend(apiKey);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim();
    const password = String(body.password || "").trim();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const admin = await findAdminByUsername(username);

    if (!admin || !admin.is_active) {
      return NextResponse.json(
        { error: "Invalid admin credentials." },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyAdminPassword(
      password,
      admin.password_hash
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid admin credentials." },
        { status: 401 }
      );
    }

    const otp = generateOtp();
    const resend = getResendClient();

    const { error: emailError } = await resend.emails.send({
      from: process.env.ADMIN_FROM_EMAIL || "onboarding@resend.dev",
      to: admin.email,
      subject: "Your Adinkra Drive admin verification code",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Admin Verification Code</h2>
          <p>Your verification code is:</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend email error:", emailError);
      return NextResponse.json(
        { error: "Could not send verification code." },
        { status: 500 }
      );
    }

    await createOtpRecord(admin.id, otp);

    return NextResponse.json({
      success: true,
      adminUserId: admin.id,
      username: admin.username,
      email: admin.email,
      message: "Verification code sent successfully.",
    });
  } catch (error) {
    console.error("Admin login error:", error);

    if (
      error instanceof Error &&
      error.message === "RESEND_API_KEY is missing"
    ) {
      return NextResponse.json(
        { error: "Server email configuration is missing." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong during login." },
      { status: 500 }
    );
  }
}