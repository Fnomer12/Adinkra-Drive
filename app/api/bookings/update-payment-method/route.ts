import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, payment_status } = body;

    if (!bookingId || !payment_status) {
      return NextResponse.json(
        { error: "bookingId and payment_status are required." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("bookings")
      .update({ payment_status })
      .eq("id", bookingId);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to update payment status." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}