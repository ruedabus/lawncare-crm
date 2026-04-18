import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
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

    const updates =
      action === "approve"
        ? {
            status: "approved",
            approved_at: new Date().toISOString(),
            rejected_at: null,
          }
        : {
            status: "rejected",
            rejected_at: new Date().toISOString(),
            approved_at: null,
          };

    const { error } = await supabase
      .from("signup_requests")
      .update(updates)
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update request." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}