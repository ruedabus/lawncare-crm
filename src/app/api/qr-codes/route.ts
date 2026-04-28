import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { getTeamContext, canWrite } from "../../../lib/team";
import { getUserPlanInfo } from "../../../lib/plan-guard";

function generateSlug(label: string): string {
  const base = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const rand = Math.random().toString(36).slice(2, 7);
  return `${base}-${rand}`;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ownerId } = await getTeamContext(supabase, user.id);

  const { data, error } = await supabase
    .from("lead_capture_codes")
    .select("id, slug, label, created_at")
    .eq("user_id", ownerId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamCtx = await getTeamContext(supabase, user.id);
  if (!canWrite(teamCtx)) return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  const { ownerId } = teamCtx;

  const { config } = await getUserPlanInfo(ownerId);

  // Basic plan: limit to 1 additional code
  if (!config.multipleQrCodes) {
    const { count } = await supabase
      .from("lead_capture_codes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ownerId);
    if ((count ?? 0) >= 1) {
      return NextResponse.json(
        { error: "Upgrade to Pro or Premier to create multiple QR codes." },
        { status: 403 }
      );
    }
  }

  const body = await request.json();
  const label = (body.label ?? "QR Code").trim();
  if (!label) return NextResponse.json({ error: "Label is required." }, { status: 400 });

  const slug = generateSlug(label);

  const { data, error } = await supabase
    .from("lead_capture_codes")
    .insert({ user_id: ownerId, slug, label })
    .select("id, slug, label, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ code: data }, { status: 201 });
}
