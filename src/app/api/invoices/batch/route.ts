import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { getTeamContext, canWrite } from "../../../../lib/team";
import { getPlanConfig } from "../../../../lib/plans";

type BatchItem = {
  jobId: string;
  amount: number;
};

/**
 * POST /api/invoices/batch
 *
 * Creates one invoice per job from a list of { jobId, amount } pairs.
 * Requires Pro or Premier plan.
 * Each invoice gets:
 *   - title: job title
 *   - customer_id: job's customer
 *   - job_id: linked job id
 *   - amount: provided by caller (pre-computed from template line items or manual)
 *   - status: "unpaid"
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamCtx = await getTeamContext(supabase, user.id);
  if (!canWrite(teamCtx)) return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  const { ownerId } = teamCtx;

  // Plan gate
  const { data: settings } = await supabase
    .from("settings")
    .select("plan_name")
    .eq("user_id", ownerId)
    .maybeSingle();
  if (!getPlanConfig(settings?.plan_name).jobTemplates) {
    return NextResponse.json({ error: "Batch invoicing requires Pro or Premier plan." }, { status: 403 });
  }

  const body = await request.json();
  const items: BatchItem[] = Array.isArray(body.items) ? body.items : [];

  if (items.length === 0) {
    return NextResponse.json({ error: "No jobs provided." }, { status: 400 });
  }
  if (items.length > 100) {
    return NextResponse.json({ error: "Maximum 100 invoices per batch." }, { status: 400 });
  }

  // Fetch all jobs in one query — verify ownership
  const jobIds = items.map((i) => i.jobId);
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title, customer_id")
    .in("id", jobIds)
    .eq("user_id", ownerId);

  if (jobsError) return NextResponse.json({ error: jobsError.message }, { status: 500 });

  const jobMap = new Map((jobs ?? []).map((j) => [j.id, j]));

  const now = new Date().toISOString();
  const created: string[] = [];
  const errors: string[] = [];

  for (const item of items) {
    const job = jobMap.get(item.jobId);
    if (!job) {
      errors.push(`Job ${item.jobId}: not found or access denied`);
      continue;
    }

    const amount = Math.max(0, Number(item.amount) || 0);

    const { data: invoice, error: invError } = await supabase
      .from("invoices")
      .insert({
        user_id: ownerId,
        customer_id: job.customer_id,
        job_id: job.id,
        title: job.title,
        amount,
        status: "unpaid",
        created_at: now,
      })
      .select("id")
      .single();

    if (invError) {
      errors.push(`Job "${job.title}": ${invError.message}`);
    } else if (invoice) {
      created.push(invoice.id);
    }
  }

  return NextResponse.json(
    { created: created.length, errors },
    { status: created.length > 0 ? 201 : 400 }
  );
}
