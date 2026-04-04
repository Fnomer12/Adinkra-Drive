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
      chauffeur_required,
      pickup_time,
      chauffeur_fee,
      country_of_birth,
      handover_document,
      notes,
      payment_method,
      unit_price,
      total_amount,
      status,
      chauffeur_id,
      chauffeur_name,
      chauffeur_phone,
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
        start_date: booking_type === "rent" ? start_date : null,
        end_date: booking_type === "rent" ? end_date : null,
        pickup_location,
        chauffeur_required: booking_type === "rent" ? !!chauffeur_required : false,
        pickup_time: booking_type === "rent" && chauffeur_required ? pickup_time : null,
        chauffeur_fee: booking_type === "rent" ? chauffeur_fee || 0 : 0,
        country_of_birth: booking_type === "rent" ? country_of_birth || null : null,
        handover_document: booking_type === "rent" ? handover_document || null : null,
        notes: notes || null,
        payment_method: payment_method || "cash",
        payment_status: "pending",
        unit_price,
        total_amount,
        status: status || "pending",
        chauffeur_id: booking_type === "rent" && chauffeur_required ? chauffeur_id || null : null,
        chauffeur_name:
          booking_type === "rent" && chauffeur_required ? chauffeur_name || null : null,
        chauffeur_phone:
          booking_type === "rent" && chauffeur_required ? chauffeur_phone || null : null,
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