import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "../../../../../lib/supabase/server";
import { getTeamContext } from "../../../../../lib/team";
import { getUserPlanInfo } from "../../../../../lib/plan-guard";

type RouteContext = { params: Promise<{ id: string }> };

// ── GET — list photos for a job ───────────────────────────────────────────────
export async function GET(_: Request, context: RouteContext) {
  const { id: jobId } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: photos, error } = await supabase
    .from("job_photos")
    .select("id, type, storage_path, created_at")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Generate signed URLs so photos are accessible in the browser
  const withUrls = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data: signed } = await supabase.storage
        .from("job-photos")
        .createSignedUrl(photo.storage_path, 60 * 60); // 1 hour
      return { ...photo, url: signed?.signedUrl ?? null };
    })
  );

  return NextResponse.json({ photos: withUrls });
}

// ── POST — upload a photo ─────────────────────────────────────────────────────
export async function POST(request: Request, context: RouteContext) {
  const { id: jobId } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ownerId } = await getTeamContext(supabase, user.id);

  // Gate to Pro and Premier only
  const { planName } = await getUserPlanInfo(ownerId);
  if (planName === "basic") {
    return NextResponse.json(
      { error: "Job photos are available on Pro and Premier plans. Upgrade to unlock." },
      { status: 403 }
    );
  }

  // Parse multipart form
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null; // "before" | "after"

  if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (!["before", "after"].includes(type ?? "")) {
    return NextResponse.json({ error: "Type must be 'before' or 'after'." }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, and HEIC images are allowed." }, { status: 400 });
  }

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File size must be under 10MB." }, { status: 400 });
  }

  // Build storage path: owner/job/type-timestamp.ext
  const ext = file.name.split(".").pop() ?? "jpg";
  const storagePath = `${ownerId}/${jobId}/${type}-${Date.now()}.${ext}`;

  const service = createServiceClient();
  const { error: uploadError } = await service.storage
    .from("job-photos")
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  // Save record to job_photos table
  const { data: photo, error: dbError } = await service
    .from("job_photos")
    .insert({ job_id: jobId, owner_user_id: ownerId, type, storage_path: storagePath })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded file if DB insert fails
    await service.storage.from("job-photos").remove([storagePath]);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Return with signed URL
  const { data: signed } = await supabase.storage
    .from("job-photos")
    .createSignedUrl(storagePath, 60 * 60);

  return NextResponse.json({ photo: { ...photo, url: signed?.signedUrl ?? null } }, { status: 201 });
}
