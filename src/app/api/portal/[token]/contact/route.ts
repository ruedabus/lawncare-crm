import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../../lib/supabase/server";
import { validatePortalToken } from "../../../../../lib/portal-token";

type RouteContext = { params: Promise<{ token: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const valid = await validatePortalToken(token);
  if (!valid) return NextResponse.json({ error: "Invalid or expired link." }, { status: 401 });

  const body = await request.json();
  const { name, email, phone, address } = body;

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("customers")
    .update({
      name: name?.trim() || undefined,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
    })
    .eq("id", valid.customerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
