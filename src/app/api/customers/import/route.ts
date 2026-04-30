import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { getTeamContext, canWrite } from "../../../../lib/team";
import { checkCustomerLimit } from "../../../../lib/plan-guard";

/**
 * POST /api/customers/import
 *
 * Accepts an array of customer rows parsed from a CSV upload.
 * Validates, deduplicates against existing customers, and bulk-inserts.
 *
 * Body: { rows: Array<{ name, email, phone, address }> }
 * Returns: { imported, skipped, errors }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teamCtx = await getTeamContext(supabase, user.id);
    if (!canWrite(teamCtx)) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }
    const { ownerId } = teamCtx;

    const body = await request.json();
    const { rows } = body as {
      rows: Array<{ name?: string; email?: string; phone?: string; address?: string }>;
    };

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided." }, { status: 400 });
    }

    if (rows.length > 500) {
      return NextResponse.json(
        { error: "Maximum 500 customers per import. Split your file and import in batches." },
        { status: 400 }
      );
    }

    // ── Check plan limit ───────────────────────────────────────────────────────
    // Get current customer count
    const { count: currentCount } = await supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ownerId);

    const limitError = await checkCustomerLimit(ownerId);
    // If they're already at the limit, block entirely
    if (limitError && (currentCount ?? 0) >= 1) {
      return NextResponse.json({ error: limitError }, { status: 403 });
    }

    // ── Load existing emails + phones to skip duplicates ───────────────────────
    const { data: existing } = await supabase
      .from("customers")
      .select("email, phone")
      .eq("user_id", ownerId);

    const existingEmails = new Set(
      (existing ?? []).map((c) => c.email?.toLowerCase()).filter(Boolean)
    );
    const existingPhones = new Set(
      (existing ?? []).map((c) => c.phone?.replace(/\D/g, "")).filter(Boolean)
    );

    // ── Validate and prepare rows ──────────────────────────────────────────────
    const toInsert: Array<{ user_id: string; name: string; email: string | null; phone: string | null; address: string | null }> = [];
    const skipped: string[] = [];
    const rowErrors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = row.name?.trim();

      if (!name) {
        rowErrors.push(`Row ${i + 1}: missing name — skipped`);
        continue;
      }

      const email = row.email?.trim().toLowerCase() || null;
      const phone = row.phone?.trim() || null;
      const phoneDigits = phone?.replace(/\D/g, "") || null;

      // Skip if duplicate email or phone
      if (email && existingEmails.has(email)) {
        skipped.push(`${name} — email already exists`);
        continue;
      }
      if (phoneDigits && existingPhones.has(phoneDigits)) {
        skipped.push(`${name} — phone already exists`);
        continue;
      }

      toInsert.push({
        user_id: ownerId,
        name,
        email,
        phone,
        address: row.address?.trim() || null,
      });

      // Track to avoid intra-batch duplicates
      if (email) existingEmails.add(email);
      if (phoneDigits) existingPhones.add(phoneDigits);
    }

    if (toInsert.length === 0) {
      return NextResponse.json({
        imported: 0,
        skipped: skipped.length + rowErrors.length,
        skippedDetails: [...skipped, ...rowErrors],
        errors: [],
      });
    }

    // ── Bulk insert in batches of 100 ──────────────────────────────────────────
    let imported = 0;
    const insertErrors: string[] = [];

    for (let i = 0; i < toInsert.length; i += 100) {
      const batch = toInsert.slice(i, i + 100);
      const { error: insertError, data } = await supabase
        .from("customers")
        .insert(batch)
        .select("id");

      if (insertError) {
        insertErrors.push(`Batch ${Math.floor(i / 100) + 1}: ${insertError.message}`);
      } else {
        imported += data?.length ?? 0;
      }
    }

    return NextResponse.json({
      imported,
      skipped: skipped.length,
      skippedDetails: [...skipped, ...rowErrors],
      errors: insertErrors,
    });
  } catch (err) {
    console.error("[customers/import]", err);
    return NextResponse.json({ error: "Import failed. Please try again." }, { status: 500 });
  }
}
