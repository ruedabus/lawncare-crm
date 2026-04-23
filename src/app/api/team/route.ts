import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "../../../lib/supabase/server";
import { getTeamContext, canManageTeam } from "../../../lib/team";
import { checkTeamMemberLimit } from "../../../lib/plan-guard";
import { sendEmail } from "../../../lib/email/send";

// ── GET — list team members for this account ──────────────────────────────────
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only the owner can manage team — but members can see the list for context
  const { ownerId } = await getTeamContext(supabase, user.id);

  const { data: members, error } = await supabase
    .from("team_members")
    .select("id, email, name, role, status, invited_at, accepted_at")
    .eq("owner_user_id", ownerId)
    .order("invited_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ members: members ?? [] });
}

// ── POST — invite a new team member ──────────────────────────────────────────
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamCtx = await getTeamContext(supabase, user.id);
  if (!canManageTeam(teamCtx)) {
    return NextResponse.json({ error: "Only the account owner can invite team members." }, { status: 403 });
  }

  const body = await request.json();
  const { email, name, role } = body;

  if (!email?.trim()) return NextResponse.json({ error: "Email is required." }, { status: 400 });
  const validRoles = ["admin", "dispatcher", "technician"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Role must be admin, dispatcher, or technician." }, { status: 400 });
  }

  // Check plan limit before doing anything
  const limitError = await checkTeamMemberLimit(user.id);
  if (limitError) return NextResponse.json({ error: limitError }, { status: 403 });

  // Check if already a member
  const { data: existing } = await supabase
    .from("team_members")
    .select("id, status")
    .eq("owner_user_id", user.id)
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (existing && existing.status !== "removed") {
    return NextResponse.json({ error: "This email is already on your team." }, { status: 409 });
  }

  // Get business name for the email
  const { data: settings } = await supabase
    .from("settings")
    .select("business_name")
    .eq("user_id", user.id)
    .maybeSingle();
  const businessName = settings?.business_name ?? "YardPilot";

  // Create the team_members record first
  const service = createServiceClient();
  const { data: member, error: insertError } = await service
    .from("team_members")
    .insert({
      owner_user_id: user.id,
      email: email.trim().toLowerCase(),
      name: name?.trim() || null,
      role,
      status: "pending",
    })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  // Invite via Supabase Auth (sends magic link)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const { data: inviteData, error: inviteError } = await service.auth.admin.inviteUserByEmail(
    email.trim().toLowerCase(),
    {
      data: { full_name: name?.trim() || "" },
      redirectTo: `${appUrl}/auth/callback?next=/dashboard`,
    }
  );

  if (inviteError && !inviteError.message.includes("already registered")) {
    // Clean up the record if invite fails
    await service.from("team_members").delete().eq("id", member.id);
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }

  // Link the Supabase auth user ID immediately — inviteUserByEmail creates the user
  // right away, so we can store member_user_id now. Without this, getTeamContext()
  // can't identify the member when they log in (it queries by member_user_id).
  // We also set status = 'active' here because getTeamContext filters by status = 'active'.
  // The invite is still "pending acceptance" visually (accepted_at is null), but the
  // member_user_id link must exist and status must be active for auth to work on login.
  if (!inviteError && inviteData?.user?.id) {
    await service
      .from("team_members")
      .update({ member_user_id: inviteData.user.id, status: "active" })
      .eq("id", member.id);
  }

  // If already registered, link their existing account
  if (inviteError?.message.includes("already registered")) {
    const { data: existingUsers } = await service.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
    );
    if (existingUser) {
      await service
        .from("team_members")
        .update({ member_user_id: existingUser.id, status: "active", accepted_at: new Date().toISOString() })
        .eq("id", member.id);

      // Send a notification email instead
      await sendEmail({
        to: email.trim().toLowerCase(),
        fromName: businessName,
        subject: `You've been added to ${businessName} on YardPilot`,
        html: buildTeamInviteEmail({ name: name?.trim() || email, businessName, appUrl, role }),
      }).catch(console.error);
    }
  } else {
    // Send branded welcome email alongside the Supabase invite
    await sendEmail({
      to: email.trim().toLowerCase(),
      fromName: businessName,
      subject: `${businessName} has invited you to YardPilot`,
      html: buildTeamInviteEmail({ name: name?.trim() || email, businessName, appUrl, role }),
    }).catch(console.error);
  }

  return NextResponse.json({ member }, { status: 201 });
}

// ── Email template ────────────────────────────────────────────────────────────
function buildTeamInviteEmail({
  name, businessName, appUrl, role,
}: { name: string; businessName: string; appUrl: string; role: string }) {
  const roleLabel = role === "admin" ? "Admin" : role === "dispatcher" ? "Dispatcher" : "Technician";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#059669;padding:28px 32px;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">YardPilot</p>
          </td>
        </tr>
        <tr><td style="padding:32px 32px 8px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">You've been invited to join ${businessName}</p>
          <p style="margin:0;font-size:15px;color:#475569;">
            Hi ${name}, <strong>${businessName}</strong> has added you to their YardPilot account as a <strong>${roleLabel}</strong>.
          </p>
          <p style="margin:12px 0 0;font-size:15px;color:#475569;">
            Check your email for a separate link from Supabase to set your password, then log in to get started.
          </p>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <a href="${appUrl}/login" style="display:inline-block;background:#059669;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">
            Go to YardPilot
          </a>
        </td></tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">YardPilot · Lawn Care Management Software</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
