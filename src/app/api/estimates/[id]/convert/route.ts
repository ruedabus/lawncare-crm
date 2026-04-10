import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Fetch the estimate
    const { data: estimate, error: fetchError } = await supabase
      .from("estimates")
      .select("*, customers(id, name)")
      .eq("id", id)
      .single();

    if (fetchError || !estimate) {
      return NextResponse.json({ error: "Estimate not found." }, { status: 404 });
    }

    // Build job notes from line items
    const items = Array.isArray(estimate.line_items) ? estimate.line_items : [];
    const lineItemSummary = items.length
      ? items
          .map((item: { description?: string; quantity?: number; unit_price?: number; amount?: number }) =>
            `• ${item.description ?? "Item"}${item.quantity && item.quantity !== 1 ? ` (x${item.quantity})` : ""} — $${Number(item.amount ?? 0).toFixed(2)}`
          )
          .join("\n")
      : null;

    const jobNotes = [
      estimate.description,
      lineItemSummary ? `Line items:\n${lineItemSummary}` : null,
      estimate.notes ? `Notes: ${estimate.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    // Create the job
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert([{
        customer_id: estimate.customer_id,
        title: estimate.title,
        notes: jobNotes || null,
        status: "scheduled",
      }])
      .select()
      .single();

    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 500 });
    }

    // Mark estimate as converted
    await supabase
      .from("estimates")
      .update({ status: "converted", updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ job });
  } catch (err) {
    console.error("API ESTIMATE CONVERT ERROR:", err);
    return NextResponse.json({ error: "Failed to convert estimate." }, { status: 500 });
  }
}
