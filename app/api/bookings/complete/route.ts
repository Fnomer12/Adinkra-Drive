// app/api/chauffeurs/available/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  const aStart = new Date(`${startA}T00:00:00`).getTime();
  const aEnd = new Date(`${endA}T23:59:59`).getTime();
  const bStart = new Date(`${startB}T00:00:00`).getTime();
  const bEnd = new Date(`${endB}T23:59:59`).getTime();

  return aStart <= bEnd && aEnd >= bStart;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const { data: chauffeurs, error: chauffeursError } = await supabase
      .from("employees")
      .select(`
        id,
        full_name,
        phone,
        image_url,
        is_available,
        status,
        role,
        is_chauffeur
      `)
      .eq("is_chauffeur", true)
      .eq("status", "active");

    if (chauffeursError) {
      return NextResponse.json(
        { error: chauffeursError.message },
        { status: 500 }
      );
    }

    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        id,
        chauffeur_id,
        start_date,
        end_date,
        status,
        booking_paid
      `)
      .not("chauffeur_id", "is", null)
      .in("status", ["confirmed", "pending"]);

    if (bookingsError) {
      return NextResponse.json(
        { error: bookingsError.message },
        { status: 500 }
      );
    }

    const busyChauffeurIds = new Set(
      (bookings || [])
        .filter((booking) => {
          if (!booking.chauffeur_id || !booking.start_date || !booking.end_date) {
            return false;
          }

          const countsAsBusy =
            booking.status === "confirmed" ||
            (booking.status === "pending" && booking.booking_paid === true);

          if (!countsAsBusy) return false;

          return rangesOverlap(
            startDate,
            endDate,
            booking.start_date,
            booking.end_date
          );
        })
        .map((booking) => booking.chauffeur_id)
    );

    const availableChauffeurs = (chauffeurs || []).filter(
      (chauffeur) => !busyChauffeurIds.has(chauffeur.id)
    );

    const shuffled = [...availableChauffeurs].sort(() => Math.random() - 0.5);

    return NextResponse.json({ chauffeurs: shuffled });
  } catch (error) {
    console.error("chauffeurs available route error:", error);
    return NextResponse.json(
      { error: "Failed to load available chauffeurs" },
      { status: 500 }
    );
  }
}