import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { getTeamContext, canWrite } from "../../../../lib/team";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamCtx = await getTeamContext(supabase, user.id);
  if (!canWrite(teamCtx)) return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  const { ownerId } = teamCtx;

  const { error } = await supabase
    .from("lead_capture_codes")
    .delete()
    .eq("id", id)
    .eq("user_id", ownerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
