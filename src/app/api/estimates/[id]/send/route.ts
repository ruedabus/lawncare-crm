import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { sendEmail } from "../../../../../lib/email/send";
import { estimateSentEmail } from "../../../../../lib/email/templates";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [{ data: estimate }, { data: settings }] = await Promise.all([
      supabase
        .from("estimates")
        .select("*, customers(id, name, email)")
        .eq("id", id)
        .single(),
      supabase
        .from("settings")
        .select("business_name, business_email, business_phone")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (!estimate) return NextResponse.json({ error: "Estimate not found." }, { status: 404 });

    const customer = estimate.customers as { id: string; name: string; email: string | null } | null;
    if (!customer?.email) {
      return NextResponse.json(
        { error: "Customer has no email address on file." },
        { status: 422 }
      );
    }

    const biz = settings ?? {};
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const estimateNumber = `EST-${estimate.id.slice(0, 8).toUpperCase()}`;

    const result = await sendEmail({
      to: customer.email,
      fromName: biz.business_name || "LawnCare CRM",
      subject: `Estimate ${estimateNumber} from ${biz.business_name || "LawnCare CRM"}`,
      html: estimateSentEmail({
        estimateId: estimate.id,
        estimateNumber,
        estimateTitle: estimate.title,
        lineItems: Array.isArray(estimate.line_items) ? estimate.line_items : [],
        total: Number(estimate.total ?? 0),
        validUntil: estimate.valid_until
          ? new Date(estimate.valid_until + "T12:00:00").toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })
          : null,
        customerName: customer.name,
        businessName: biz.business_name || "LawnCare CRM",
        businessEmail: biz.business_email || "",
        businessPhone: biz.business_phone ?? undefined,
        appUrl,
      }),
      replyTo: biz.business_email || undefined,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "Email failed." }, { status: 500 });
    }

    await supabase
      .from("estimates")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("API ESTIMATE SEND ERROR:", err);
    return NextResponse.json({ error: "Failed to send estimate." }, { status: 500 });
  }
}
