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

    // Look up the contractor by slug
    const { data: settings, error: slugError } = await supabase
      .from("settings")
      .select("user_id, business_name")
      .eq("lead_capture_slug", slug)
      .maybeSingle();

    if (slugError || !settings) {
      return NextResponse.json(
        { error: "This link is no longer active." },
        { status: 404 }
      );
    }

    // Insert the lead for that contractor
    const { error: insertError } = await supabase.from("leads").insert([
      {
        user_id: settings.user_id,
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
