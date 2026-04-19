import { NextResponse } from "next/server";
import { createServiceClient } from "../../../lib/supabase/server";
import { sendEmail } from "../../../lib/email/send";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const full_name = String(body.full_name ?? "").trim();
    const company_name = String(body.company_name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();

    if (!full_name || !email) {
      return NextResponse.json(
        { error: "Full name and email are required." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase.from("signup_requests").insert([
      {
        full_name,
        company_name: company_name || null,
        email,
        phone: phone || null,
        status: "pending",
      },
    ]);

    if (error) {
      console.log("❌ DB INSERT ERROR:", error);

      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email has already requested access." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error.message || "Failed to save signup request." },
        { status: 500 }
      );
    }

    // Notify admin of new signup request
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (adminEmails.length > 0) {
      try {
        await sendEmail({
          fromName: "YardPilot",
          to: adminEmails,
          subject: `New signup request: ${full_name}${company_name ? " — " + company_name : ""}`,
          html: `
            <p>A new user has requested access to YardPilot.</p>
            <ul>
              <li><strong>Name:</strong> ${full_name}</li>
              <li><strong>Company:</strong> ${company_name || "—"}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Phone:</strong> ${phone || "—"}</li>
            </ul>
            <p>Review and approve or deny the request in your <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/admin/signup-requests">YardPilot admin panel</a>.</p>
          `,
        });
      } catch (emailError) {
        // Non-fatal — signup was saved; admin email is best-effort
        console.error("Admin notification email failed:", emailError);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ ROUTE ERROR:", err);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}