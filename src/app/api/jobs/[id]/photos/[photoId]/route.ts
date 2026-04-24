import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "../../../../../../lib/supabase/server";
import { getTeamContext } from "../../../../../../lib/team";

type RouteContext = { params: Promise<{ id: string; photoId: string }> };

// ── DELETE — remove a photo ───────────────────────────────────────────────────
export async function DELETE(_: Request, context: RouteContext) {
  const { photoId } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ownerId } = await getTeamContext(supabase, user.id);

  // Fetch photo to get storage path (and verify ownership)
  const { data: photo, error: fetchError } = await supabase
    .from("job_photos")
    .select("id, storage_path, owner_user_id")
    .eq("id", photoId)
    .eq("owner_user_id", ownerId)
    .maybeSingle();

  if (fetchError || !photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  const service = createServiceClient();

  // Delete from storage first
  await service.storage.from("job-photos").remove([photo.storage_path]);

  // Delete DB record
  const { error: dbError } = await service
    .from("job_photos")
    .delete()
    .eq("id", photoId);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
