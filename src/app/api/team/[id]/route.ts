import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "../../../../lib/supabase/server";
import { getTeamContext, canManageTeam } from "../../../../lib/team";

type RouteContext = { params: Promise<{ id: string }> };

// ── PATCH — update a team member's role ───────────────────────────────────────
export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamCtx = await getTeamContext(supabase, user.id);
  if (!canManageTeam(teamCtx)) {
    return NextResponse.json({ error: "Only the account owner can update team members." }, { status: 403 });
  }

  const { role } = await request.json();
  const validRoles = ["admin", "dispatcher", "technician"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("team_members")
    .update({ role })
    .eq("id", id)
    .eq("owner_user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ member: data });
}

// ── DELETE — remove a team member ─────────────────────────────────────────────
export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamCtx = await getTeamContext(supabase, user.id);
  if (!canManageTeam(teamCtx)) {
    return NextResponse.json({ error: "Only the account owner can remove team members." }, { status: 403 });
  }

  const service = createServiceClient();
  const { error } = await service
    .from("team_members")
    .delete()
    .eq("id", id)
    .eq("owner_user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
