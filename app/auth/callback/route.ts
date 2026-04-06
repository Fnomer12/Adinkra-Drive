import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/booking";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("exchangeCodeForSession error:", error);
      return NextResponse.redirect(new URL("/login", requestUrl.origin));
    }
  }

  const safeNext = next.startsWith("/") ? next : "/booking";

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}