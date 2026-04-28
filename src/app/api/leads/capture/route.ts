import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, name, phone, email, service, notes } = body;

    if (!slug) {
      return NextResponse.json({ error: "Invalid link." }, { status: 400 });
    }
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!phone?.trim() && !email?.trim()) {
      return NextResponse.json(
        { error: "Please provide a phone number or email." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Look up the contractor by slug — check lead_capture_codes first, then fall back to settings
    let userId: string | null = null;
    let businessName: string | null = null;

    const { data: codeRow } = await supabase
      .from("lead_capture_codes")
      .select("user_id")
      .eq("slug", slug)
      .maybeSingle();

    if (codeRow) {
      userId = codeRow.user_id;
      const { data: settingsRow } = await supabase
        .from("settings")
        .select("business_name")
        .eq("user_id", userId)
        .maybeSingle();
      businessName = settingsRow?.business_name ?? null;
    } else {
      // Fall back to legacy single-slug on settings table
      const { data: settings } = await supabase
        .from("settings")
        .select("user_id, business_name")
        .eq("lead_capture_slug", slug)
        .maybeSingle();
      if (settings) {
        userId = settings.user_id;
        businessName = settings.business_name ?? null;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "This link is no longer active." },
        { status: 404 }
      );
    }
    void businessName; // used on capture page, not needed here

    // Insert the lead for that contractor
    const { error: insertError } = await supabase.from("leads").insert([
      {
        user_id: userId,
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        source: "QR Code",
        status: "new",
        notes: [
          service ? `Service needed: ${service.trim()}` : null,
          notes ? notes.trim() : null,
        ]
          .filter(Boolean)
          .join("\n") || null,
      },
    ]);

    if (insertError) {
      console.error("Capture lead insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to submit. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
