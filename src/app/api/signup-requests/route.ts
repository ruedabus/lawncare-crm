import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const full_name = String(body.full_name ?? "").trim();
    const company_name = String(body.company_name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const team_size = String(body.team_size ?? "").trim();
    const city = String(body.city ?? "").trim();
    const state = String(body.state ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!full_name || !email) {
      return NextResponse.json(
        { error: "Full name and email are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.from("signup_requests").insert([
      {
        full_name,
        company_name: company_name || null,
        email,
        phone: phone || null,
        team_size: team_size || null,
        city: city || null,
        state: state || null,
        message: message || null,
      },
    ]);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email has already submitted a request." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error.message || "Failed to save request." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}