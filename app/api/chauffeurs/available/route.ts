import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function normalizeDate(date: string) {
  return new Date(`${date}T00:00:00`);
}

function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  const aStart = normalizeDate(startA).getTime();
  const aEnd = normalizeDate(endA).getTime();
  const bStart = normalizeDate(startB).getTime();
  const bEnd = normalizeDate(endB).getTime();

  return aStart <= bEnd && aEnd >= bStart;
}

function shuffleArray<T>(items: T[]) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "startDate and endDate are required." },
      { status: 400 }
    );
  }

  const { data: chauffeurs, error: chauffeursError } = await supabase
    .from("employees")
    .select("*")
    .eq("is_chauffeur", true)
    .eq("status", "active");

  if (chauffeursError) {
    return NextResponse.json(
      { error: chauffeursError.message },
      { status: 500 }
    );
  }

  const { data: activeBookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("chauffeur_id, start_date, end_date, status, booking_paid, booking_completed")
    .eq("booking_type", "rent")
    .eq("booking_paid", true)
    .eq("booking_completed", false);

  if (bookingsError) {
    return NextResponse.json(
      { error: bookingsError.message },
      { status: 500 }
    );
  }

  const freeChauffeurs = (chauffeurs || []).filter((chauffeur) => {
    const chauffeurBookings = (activeBookings || []).filter(
      (booking) => booking.chauffeur_id === chauffeur.id
    );

    const hasConflict = chauffeurBookings.some((booking) => {
      if (!booking.start_date || !booking.end_date) return false;
      return rangesOverlap(startDate, endDate, booking.start_date, booking.end_date);
    });

    return !hasConflict;
  });

  return NextResponse.json({
    chauffeurs: shuffleArray(freeChauffeurs),
  });
}