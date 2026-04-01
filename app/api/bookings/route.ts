import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const {
      vehicle_id,
      booking_type,
      full_name,
      email,
      phone,
      start_date,
      end_date,
      pickup_location,
      notes,
      unit_price,
      total_amount,
      status,
    } = body;

    if (!vehicle_id || !booking_type || !full_name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required booking fields." },
        { status: 400 }
      );
    }

    if (booking_type === "rent" && (!start_date || !end_date)) {
      return NextResponse.json(
        { error: "Rental bookings require start and end dates." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        vehicle_id,
        booking_type,
        full_name,
        email,
        phone,
        start_date,
        end_date,
        pickup_location,
        notes,
        unit_price,
        total_amount,
        status: status || "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Create booking error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, booking: data });
  } catch (error) {
    console.error("Booking route error:", error);
    return NextResponse.json(
      { error: "Something went wrong while creating booking." },
      { status: 500 }
    );
  }
}