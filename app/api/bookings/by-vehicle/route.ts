import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const vehicleId = request.nextUrl.searchParams.get("vehicleId");

    if (!vehicleId) {
      return NextResponse.json(
        { error: "vehicleId is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("id, start_date, end_date, status")
      .eq("vehicle_id", vehicleId)
      .eq("booking_type", "rent")
      .in("status", ["pending", "paid"])
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Fetch vehicle bookings error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookings: data || [] });
  } catch (error) {
    console.error("Vehicle bookings route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocked dates." },
      { status: 500 }
    );
  }
}