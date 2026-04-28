import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { getTeamContext, canWrite } from "../../../../lib/team";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json(
        { error: "Technician name is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const teamCtx = await getTeamContext(supabase, user.id);
    if (!canWrite(teamCtx)) return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    const { ownerId } = teamCtx;

    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.email !== undefined) updates.email = body.email?.trim() || null;
    if (body.phone !== undefined) updates.phone = body.phone?.trim() || null;
    if (body.color !== undefined) updates.color = body.color || "#2563eb";
    if (body.tax_id !== undefined) updates.tax_id = body.tax_id?.trim() || null;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    const { data, error } = await supabase
      .from("technicians")
      .update(updates)
      .eq("id", id)
      .eq("user_id", ownerId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ technician: data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update technician." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const teamCtx = await getTeamContext(supabase, user.id);
    if (!canWrite(teamCtx)) return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    const { ownerId } = teamCtx;

    const { error } = await supabase
      .from("technicians")
      .delete()
      .eq("id", id)
      .eq("user_id", ownerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete technician." },
      { status: 500 }
    );
  }
}