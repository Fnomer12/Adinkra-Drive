import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getResendClient } from "@/lib/resend";

type NotifyPayload = {
  vehicle: {
    title: string;
    brand: string;
    model: string;
    year: number;
    category: "rent" | "sale";
    price: number;
    description?: string;
    image_url?: string | null;
  };
};

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as NotifyPayload;

    if (!body?.vehicle?.title) {
      return NextResponse.json(
        { error: "Vehicle details are required." },
        { status: 400 }
      );
    }

    const from = process.env.EMAIL_FROM;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!from) {
      return NextResponse.json(
        { error: "Missing EMAIL_FROM environment variable." },
        { status: 500 }
      );
    }

    if (!siteUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SITE_URL environment variable." },
        { status: 500 }
      );
    }

    const supabase = getSupabaseAdmin();
    const resend = getResendClient();

    const { data: members, error: membersError } = await supabase
      .from("members")
      .select("email, full_name, consent")
      .eq("consent", true);

    if (membersError) {
      console.error("Members query error:", membersError);
      return NextResponse.json(
        { error: membersError.message },
        { status: 500 }
      );
    }

    console.log("MEMBERS FOUND:", members);

    if (!members || members.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No members found to notify.",
        sent: 0,
      });
    }

    const viewUrl =
      body.vehicle.category === "rent"
        ? `${siteUrl}/rent`
        : `${siteUrl}/buy`;

    const sendResults = await Promise.allSettled(
      members.map(async (member) => {
        console.log("Sending to:", member.email);

        return resend.emails.send({
          from,
          to: member.email,
          subject: `New vehicle update: ${body.vehicle.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
              <h2>New vehicle update from Adinkra Drive</h2>

              <p>Hello ${member.full_name || "Member"},</p>

              <p>
                A new ${
                  body.vehicle.category === "rent" ? "rental" : "purchase"
                } vehicle is now available at Adinkra Drive.
              </p>

              <div style="padding:16px; border:1px solid #e5e7eb; border-radius:12px; margin:16px 0;">
                <h3 style="margin:0 0 8px;">${body.vehicle.title}</h3>
                <p style="margin:4px 0;"><strong>Brand:</strong> ${body.vehicle.brand}</p>
                <p style="margin:4px 0;"><strong>Model:</strong> ${body.vehicle.model}</p>
                <p style="margin:4px 0;"><strong>Year:</strong> ${body.vehicle.year}</p>
                <p style="margin:4px 0;"><strong>Category:</strong> ${body.vehicle.category}</p>
                <p style="margin:4px 0;"><strong>Price:</strong> ${
                  body.vehicle.category === "rent"
                    ? `$${body.vehicle.price}/day`
                    : `$${Number(body.vehicle.price).toLocaleString()}`
                }</p>
                ${
                  body.vehicle.description
                    ? `<p style="margin:12px 0 0;">${body.vehicle.description}</p>`
                    : ""
                }
                ${
                  body.vehicle.image_url
                    ? `<img src="${body.vehicle.image_url}" alt="${body.vehicle.title}" style="margin-top:16px; width:100%; max-width:480px; border-radius:12px;" />`
                    : ""
                }

                <p style="margin-top:16px;">
                  <a
                    href="${viewUrl}"
                    style="display:inline-block; background:#111; color:#fff; text-decoration:none; padding:12px 20px; border-radius:10px; font-weight:600;"
                  >
                    View Vehicle
                  </a>
                </p>
              </div>

              <p>Thank you for being part of Adinkra Drive.</p>
            </div>
          `,
        });
      })
    );

    console.log("SEND RESULTS:", JSON.stringify(sendResults, null, 2));

    const sent = sendResults.filter((r) => r.status === "fulfilled").length;
    const failed = sendResults.length - sent;

    return NextResponse.json({
      success: true,
      sent,
      failed,
      message: `Vehicle added. ${sent} email(s) sent, ${failed} failed.`,
    });
  } catch (error) {
    console.error("notify-members route error:", error);

    return NextResponse.json(
      { error: "Failed to notify members." },
      { status: 500 }
    );
  }
}