import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

function randomSuffix() {
  return Math.random().toString(36).slice(2, 7);
}

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get business name to build a nice slug
  const { data: settings } = await supabase
    .from("settings")
    .select("business_name, lead_capture_slug")
    .eq("user_id", user.id)
    .maybeSingle();

  // If they already have a slug, return it
  if (settings?.lead_capture_slug) {
    return NextResponse.json({ slug: settings.lead_capture_slug });
  }

  const base = settings?.business_name
    ? toSlug(settings.business_name)
    : "lawn-care";

  // Try base slug, then add suffix until unique
  let slug = base;
  let attempts = 0;
  while (attempts < 5) {
    const candidate = attempts === 0 ? slug : `${base}-${randomSuffix()}`;
    const { data: existing } = await supabase
      .from("settings")
      .select("user_id")
      .eq("lead_capture_slug", candidate)
      .maybeSingle();

    if (!existing) {
      slug = candidate;
      break;
    }
    attempts++;
  }

  // Save it
  const { error } = await supabase
    .from("settings")
    .upsert(
      { user_id: user.id, lead_capture_slug: slug, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ slug });
}
