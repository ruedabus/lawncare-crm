import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { getTeamContext, canWrite } from "../../../../lib/team";

type RouteContext = { params: Promise<{ id: string }> };

// ── PATCH /api/job-templates/[id] ───────────────────────────────────────────
export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamCtx = await getTeamContext(supabase, user.id);
  if (!canWrite(teamCtx)) return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  const { ownerId } = teamCtx;

  const body = await request.json();
  const { title, service_type, notes, estimated_duration_minutes, line_items } = body;

  if (title !== undefined && !title?.trim()) {
    return NextResponse.json({ error: "Template title cannot be empty." }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (title !== undefined) updates.title = title.trim();
  if (service_type !== undefined) updates.service_type = service_type || null;
  if (notes !== undefined) updates.notes = notes?.trim() || null;
  if (estimated_duration_minutes !== undefined)
    updates.estimated_duration_minutes = estimated_duration_minutes ? Number(estimated_duration_minutes) : null;
  if (line_items !== undefined) updates.line_items = Array.isArray(line_items) ? line_items : [];

  const { data, error } = await supabase
    .from("job_templates")
    .update(updates)
    .eq("id", id)
    .eq("user_id", ownerId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Template not found." }, { status: 404 });

  return NextResponse.json({ template: data });
}

// ── DELETE /api/job-templates/[id] ──────────────────────────────────────────
export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamCtx = await getTeamContext(supabase, user.id);
  if (!canWrite(teamCtx)) return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  const { ownerId } = teamCtx;

  const { error } = await supabase
    .from("job_templates")
    .delete()
    .eq("id", id)
    .eq("user_id", ownerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
