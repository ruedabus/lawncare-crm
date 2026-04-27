import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase/server";
import { validatePortalToken } from "../../../../lib/portal-token";
import { getPlanConfig } from "../../../../lib/plans";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_: Request, context: RouteContext) {
  const { token } = await context.params;
  const valid = await validatePortalToken(token);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 401 });
  }

  const { customerId, userId } = valid;
  const supabase = createServiceClient();

  const [
    { data: customer },
    { data: invoices },
    { data: jobs },
    { data: settings },
  ] = await Promise.all([
    supabase.from("customers").select("id, name, email, phone, address").eq("id", customerId).single(),
    supabase.from("invoices").select("id, title, amount, status, created_at, due_date").eq("customer_id", customerId).order("created_at", { ascending: false }),
    supabase.from("jobs").select("id, title, status, scheduled_date, created_at, notes").eq("customer_id", customerId).order("created_at", { ascending: false }),
    supabase.from("settings").select("business_name, business_email, business_phone, business_website, plan_name").eq("user_id", userId).maybeSingle(),
  ]);

  const planConfig = getPlanConfig(settings?.plan_name);

  return NextResponse.json({
    customer,
    invoices: invoices ?? [],
    jobs: jobs ?? [],
    business: {
      name: settings?.business_name ?? "Your Service Provider",
      email: settings?.business_email ?? "",
      phone: settings?.business_phone ?? "",
      website: settings?.business_website ?? "",
    },
    tips_enabled: planConfig.tips,
  });
}
