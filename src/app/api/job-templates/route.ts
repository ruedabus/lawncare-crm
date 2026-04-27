import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { getTeamContext, canWrite } from "../../../lib/team";
import { getPlanConfig } from "../../../lib/plans";

export type LineItem = {
  description: string;
  unit_price: number;
  quantity: number;
};

// ── GET /api/job-templates ───────────────────────────────────────────────────
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ownerId } = await getTeamContext(supabase, user.id);

  const { data, error } = await supabase
    .from("job_templates")
    .select("id, title, service_type, notes, estimated_duration_minutes, line_items, created_at")
    .eq("user_id", ownerId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ templates: data ?? [] });
}

// ── POST /api/job-templates ──────────────────────────────────────────────────
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamCtx = await getTeamContext(supabase, user.id);
  if (!canWrite(teamCtx)) return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  const { ownerId } = teamCtx;

  // Plan gate
  const { data: settings } = await supabase
    .from("settings")
    .select("plan_name")
    .eq("user_id", ownerId)
    .maybeSingle();
  if (!getPlanConfig(settings?.plan_name).jobTemplates) {
    return NextResponse.json({ error: "Job templates require Pro or Premier plan." }, { status: 403 });
  }

  const body = await request.json();
  const { title, service_type, notes, estimated_duration_minutes, line_items } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Template title is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("job_templates")
    .insert({
      user_id: ownerId,
      title: title.trim(),
      service_type: service_type || null,
      notes: notes?.trim() || null,
      estimated_duration_minutes: estimated_duration_minutes ? Number(estimated_duration_minutes) : null,
      line_items: Array.isArray(line_items) ? line_items : [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ template: data }, { status: 201 });
}
