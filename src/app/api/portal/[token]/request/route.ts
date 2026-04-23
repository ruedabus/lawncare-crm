import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../../lib/supabase/server";
import { validatePortalToken } from "../../../../../lib/portal-token";

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const valid = await validatePortalToken(token);
  if (!valid) return NextResponse.json({ error: "Invalid or expired link." }, { status: 401 });

  const body = await request.json();
  const { service, notes } = body;

  if (!service?.trim()) {
    return NextResponse.json({ error: "Please describe the service you need." }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Fetch customer info to populate lead
  const { data: customer } = await supabase
    .from("customers")
    .select("name, email, phone")
    .eq("id", valid.customerId)
    .single();

  const { error } = await supabase.from("leads").insert({
    user_id: valid.userId,
    name: customer?.name ?? "Portal Request",
    email: customer?.email ?? null,
    phone: customer?.phone ?? null,
    service: service.trim(),
    notes: notes?.trim() || null,
    source: "Customer Portal",
    status: "new",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
