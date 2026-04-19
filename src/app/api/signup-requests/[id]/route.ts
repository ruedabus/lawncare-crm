import { NextResponse } from "next/server";
import {
  createClient,
  createServiceClient,
} from "../../../../lib/supabase/server";
import { isAdminEmail } from "../../../../lib/auth/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const sessionClient = await createClient();

    const {
      data: { user },
    } = await sessionClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const action = String(body.action ?? "").trim();

    if (!id) {
      return NextResponse.json({ error: "Missing request id." }, { status: 400 });
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: requestRow, error: fetchError } = await supabase
      .from("signup_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !requestRow) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    if (action === "reject") {
      const { error } = await supabase
        .from("signup_requests")
        .update({
          status: "rejected",
          rejected_at: new Date().toISOString(),
          approved_at: null,
        })
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    const email = requestRow.email as string;

    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from("signup_requests")
      .update({
        status: "invited",
        approved_at: new Date().toISOString(),
        invited_at: new Date().toISOString(),
        rejected_at: null,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}