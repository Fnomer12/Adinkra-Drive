import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await req.json();
    const { reference, bookingId } = body;

    if (!reference || !bookingId) {
      return NextResponse.json(
        { error: "Missing reference or bookingId" },
        { status: 400 }
      );
    }

    // 🔥 Here you would normally verify Paystack payment
    // (skipping real verification for now)

    // ✅ THIS IS WHERE YOUR CODE GOES
    const { error } = await supabase
      .from("bookings")
      .update({
        booking_paid: true,
        status: "confirmed",
      })
      .eq("id", bookingId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("verify payment error:", err);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}