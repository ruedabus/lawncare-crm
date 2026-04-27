/**
 * Email HTML templates for invoice lifecycle emails.
 * All templates are self-contained inline-styled HTML for
 * maximum email client compatibility.
 */

export type InvoiceEmailData = {
  invoiceId: string;
  invoiceNumber: string;
  invoiceTitle: string;
  amount: number;
  dueDate: string | null;
  customerName: string;
  businessName: string;
  businessEmail: string;
  businessPhone?: string;
  businessWebsite?: string;
  appUrl?: string;
  payUrl?: string;    // Stripe checkout URL — embedded directly in email
  portalUrl?: string; // Customer portal magic link
};

// ── Shared helpers ────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return `$${n.toFixed(2)}`;
}

function emailShell(content: string, accentColor = "#059669") {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Email</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">

        <!-- Header band -->
        <tr>
          <td style="background:${accentColor};padding:28px 32px;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">YardPilot</p>
          </td>
        </tr>

        <!-- Body -->
        ${content}

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
              This email was sent automatically by YardPilot.<br />
              Please do not reply directly to this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:#64748b;width:140px;">${label}</td>
      <td style="padding:8px 0;font-size:13px;color:#0f172a;font-weight:600;">${value}</td>
    </tr>`;
}

// ── Templates ─────────────────────────────────────────────────────────────────

/**
 * Sent when a new invoice is created or manually resent.
 */
export function invoiceCreatedEmail(d: InvoiceEmailData): string {
  const printUrl = d.appUrl
    ? `${d.appUrl}/invoices/${d.invoiceId}/print`
    : null;

  const content = `
    <tr><td style="padding:32px 32px 8px;">
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">
        You have a new invoice
      </p>
      <p style="margin:0;font-size:15px;color:#475569;">
        Hi ${d.customerName}, ${d.businessName} has sent you an invoice. Details are below.
      </p>
    </td></tr>

    <tr><td style="padding:24px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:20px;">
        <tr><tbody>
          ${row("Invoice #", d.invoiceNumber)}
          ${row("Description", d.invoiceTitle)}
          ${row("Amount Due", formatCurrency(d.amount))}
          ${row("Due Date", d.dueDate ?? "Upon receipt")}
        </tbody></tr>
      </table>
    </td></tr>

    <tr><td style="padding:0 32px 32px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          ${d.payUrl
            ? `<td style="padding-right:12px;">
                <a href="${d.payUrl}" style="display:inline-block;background:#059669;color:#fff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
                  Pay Now
                </a>
               </td>`
            : ""}
          ${d.portalUrl
            ? `<td style="padding-right:12px;">
                <a href="${d.portalUrl}" style="display:inline-block;background:#0f172a;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;">
                  View My Portal
                </a>
               </td>`
            : ""}
          ${printUrl
            ? `<td>
                <a href="${printUrl}" style="display:inline-block;background:#f1f5f9;color:#334155;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;border:1px solid #e2e8f0;">
                  View Invoice
                </a>
               </td>`
            : ""}
        </tr>
      </table>
    </td></tr>

    ${d.businessEmail || d.businessPhone
      ? `<tr><td style="padding:0 32px 32px;font-size:13px;color:#64748b;">
          <p style="margin:0;">Questions? ${d.businessEmail
            ? `Contact us at <a href="mailto:${d.businessEmail}" style="color:#059669;">${d.businessEmail}</a>`
            : ""}${d.businessPhone ? ` or call ${d.businessPhone}` : ""}.
          </p>
         </td></tr>`
      : ""}
  `;

  return emailShell(content);
}

/**
 * Sent as a reminder when the invoice is approaching or past due.
 */
export function invoiceReminderEmail(
  d: InvoiceEmailData,
  type: "upcoming" | "due_today" | "overdue",
  daysUnpaid?: number
): string {
  const accentColor = type === "overdue" ? "#dc2626" : "#d97706";

  const headings = {
    upcoming: "Friendly payment reminder",
    due_today: "Your invoice is due today",
    overdue: daysUnpaid === 14
      ? "Second notice — invoice still unpaid"
      : "Friendly reminder — invoice unpaid",
  };

  const subtext = {
    upcoming: `Just a heads-up — your invoice from ${d.businessName} is due soon.`,
    due_today: `Your invoice from ${d.businessName} is due today. Please arrange payment at your earliest convenience.`,
    overdue: daysUnpaid === 14
      ? `This is a second notice. Your invoice from ${d.businessName} has been unpaid for 14 days. Please arrange payment as soon as possible.`
      : `Just a friendly reminder that your invoice from ${d.businessName} has been unpaid for 7 days. Please arrange payment at your earliest convenience.`,
  };

  const printUrl = d.appUrl
    ? `${d.appUrl}/invoices/${d.invoiceId}/print`
    : null;

  const content = `
    <tr><td style="padding:32px 32px 8px;">
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">
        ${headings[type]}
      </p>
      <p style="margin:0;font-size:15px;color:#475569;">${subtext[type]}</p>
    </td></tr>

    <tr><td style="padding:24px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:20px;">
        <tr><tbody>
          ${row("Invoice #", d.invoiceNumber)}
          ${row("Description", d.invoiceTitle)}
          ${row("Balance Due", formatCurrency(d.amount))}
          ${row("Due Date", d.dueDate ?? "Upon receipt")}
        </tbody></tr>
      </table>
    </td></tr>

    <tr><td style="padding:0 32px 32px;">
      <table cellpadding="0" cellspacing="0"><tr>
        ${d.payUrl
          ? `<td style="padding-right:12px;">
              <a href="${d.payUrl}" style="display:inline-block;background:${accentColor};color:#fff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
                Pay Now
              </a>
             </td>`
          : ""}
        ${d.portalUrl
          ? `<td style="padding-right:12px;">
              <a href="${d.portalUrl}" style="display:inline-block;background:#0f172a;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;">
                View My Portal
              </a>
             </td>`
          : ""}
        ${printUrl
          ? `<td>
              <a href="${printUrl}" style="display:inline-block;background:#f1f5f9;color:#334155;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;border:1px solid #e2e8f0;">
                View Invoice
              </a>
             </td>`
          : ""}
      </tr></table>
    </td></tr>

    <tr><td style="padding:0 32px 32px;font-size:13px;color:#64748b;">
      <p style="margin:0;">Questions? Contact us at
        <a href="mailto:${d.businessEmail}" style="color:#059669;">${d.businessEmail}</a>
        ${d.businessPhone ? ` or call ${d.businessPhone}` : ""}.
      </p>
    </td></tr>
  `;

  return emailShell(content, accentColor);
}

/**
 * Sent when an invoice is marked as paid.
 */
export function invoicePaidEmail(d: InvoiceEmailData): string {
  const content = `
    <tr><td style="padding:32px 32px 8px;">
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">
        Payment received — thank you!
      </p>
      <p style="margin:0;font-size:15px;color:#475569;">
        Hi ${d.customerName}, we've received your payment. We appreciate your business!
      </p>
    </td></tr>

    <tr><td style="padding:24px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:12px;padding:20px;">
        <tr><tbody>
          ${row("Invoice #", d.invoiceNumber)}
          ${row("Description", d.invoiceTitle)}
          ${row("Amount Paid", formatCurrency(d.amount))}
          ${row("Status", "✅ Paid in full")}
        </tbody></tr>
      </table>
    </td></tr>

    <tr><td style="padding:0 32px 32px;font-size:13px;color:#64748b;">
      <p style="margin:0;">
        Thank you for choosing ${d.businessName}. We look forward to serving you again.<br />
        ${d.businessEmail ? `<a href="mailto:${d.businessEmail}" style="color:#059669;">${d.businessEmail}</a>` : ""}
        ${d.businessPhone ? ` · ${d.businessPhone}` : ""}
      </p>
    </td></tr>
  `;

  return emailShell(content, "#059669");
}

// ── Estimate sent ─────────────────────────────────────────────────────────────

type LineItem = {
  description?: string;
  quantity?: number;
  unit_price?: number;
  amount?: number;
};

export type EstimateEmailData = {
  estimateId: string;
  estimateNumber: string;
  estimateTitle: string;
  lineItems: LineItem[];
  total: number;
  validUntil: string | null;
  customerName: string;
  businessName: string;
  businessEmail: string;
  businessPhone?: string;
  appUrl?: string;
};

export function estimateSentEmail(d: EstimateEmailData): string {
  const printUrl = d.appUrl ? `${d.appUrl}/estimates/${d.estimateId}/print` : null;

  const lineItemRows = d.lineItems.length
    ? d.lineItems
        .map(
          (item) => `
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:10px 0;font-size:13px;color:#0f172a;">
              ${item.description ?? "Service"}
              ${item.quantity && item.quantity !== 1 ? `<span style="color:#94a3b8;"> × ${item.quantity}</span>` : ""}
            </td>
            <td style="padding:10px 0;font-size:13px;color:#0f172a;text-align:right;font-weight:600;">
              $${Number(item.amount ?? 0).toFixed(2)}
            </td>
          </tr>`
        )
        .join("")
    : `<tr><td colspan="2" style="padding:10px 0;font-size:13px;color:#94a3b8;">No line items</td></tr>`;

  const content = `
    <tr><td style="padding:32px 32px 8px;">
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">
        Your estimate is ready
      </p>
      <p style="margin:0;font-size:15px;color:#475569;">
        Hi ${d.customerName}, ${d.businessName} has prepared an estimate for you. Details are below.
      </p>
    </td></tr>

    <tr><td style="padding:24px 32px 0;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;">
        ${d.estimateNumber} · ${d.estimateTitle}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #e2e8f0;margin-top:8px;">
        ${lineItemRows}
        <tr style="border-top:2px solid #e2e8f0;">
          <td style="padding:12px 0;font-size:14px;font-weight:700;color:#0f172a;">Total</td>
          <td style="padding:12px 0;font-size:16px;font-weight:700;color:#0f172a;text-align:right;">
            $${d.total.toFixed(2)}
          </td>
        </tr>
      </table>
      ${d.validUntil ? `<p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">This estimate is valid until ${d.validUntil}.</p>` : ""}
    </td></tr>

    ${printUrl ? `
    <tr><td style="padding:24px 32px 32px;">
      <a href="${printUrl}" style="display:inline-block;background:#0f172a;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;">
        View Estimate
      </a>
    </td></tr>` : ""}

    <tr><td style="padding:0 32px 32px;font-size:13px;color:#64748b;">
      <p style="margin:0;">Questions? Contact us at
        <a href="mailto:${d.businessEmail}" style="color:#059669;">${d.businessEmail}</a>
        ${d.businessPhone ? ` or call ${d.businessPhone}` : ""}.
      </p>
    </td></tr>
  `;

  return emailShell(content, "#0f172a");
}

// ── Technician Daily Digest ───────────────────────────────────────────────────

export type TechJobItem = {
  type: "job";
  title: string;
  customerName: string;
  address: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  notes: string | null;
};

export type TechTaskItem = {
  type: "task";
  title: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  dueDate: string | null;
  notes: string | null;
};

export type TechReminderData = {
  techName: string;
  businessName: string;
  businessPhone?: string;
  date: string; // e.g. "Monday, April 15"
  items: (TechJobItem | TechTaskItem)[];
};

export function technicianReminderEmail(d: TechReminderData): string {
  function formatTime(iso: string | null) {
    if (!iso) return null;
    const dt = new Date(iso);
    return dt.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York",
    });
  }

  const itemRows = d.items
    .map((item, i) => {
      const startTime = formatTime(item.scheduledStart);
      const endTime = formatTime(item.scheduledEnd);
      const timeStr =
        startTime && endTime
          ? `${startTime} – ${endTime}`
          : startTime
          ? `Starts ${startTime}`
          : item.type === "task" && item.dueDate
          ? `Due ${item.dueDate}`
          : "Time TBD";

      const badge =
        item.type === "job"
          ? `<span style="background:#d1fae5;color:#065f46;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:.04em;">Job</span>`
          : `<span style="background:#e0e7ff;color:#3730a3;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:.04em;">Task</span>`;

      const detail =
        item.type === "job"
          ? `<p style="margin:4px 0 0;font-size:13px;color:#475569;">
              ${item.customerName}${item.address ? ` · ${item.address}` : ""}
             </p>`
          : "";

      const notes =
        item.notes
          ? `<p style="margin:6px 0 0;font-size:13px;color:#64748b;font-style:italic;">${item.notes}</p>`
          : "";

      const divider =
        i < d.items.length - 1
          ? `<tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #f1f5f9;margin:0;" /></td></tr>`
          : "";

      return `
        <tr><td style="padding:16px 32px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            ${badge}
            <span style="font-size:13px;color:#94a3b8;font-weight:500;">${timeStr}</span>
          </div>
          <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${item.title}</p>
          ${detail}
          ${notes}
        </td></tr>
        ${divider}
      `;
    })
    .join("");

  const content = `
    <tr><td style="padding:32px 32px 16px;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#059669;text-transform:uppercase;letter-spacing:.05em;">
        Daily Schedule
      </p>
      <p style="margin:0;font-size:22px;font-weight:700;color:#0f172a;">
        Good morning, ${d.techName}!
      </p>
      <p style="margin:8px 0 0;font-size:15px;color:#475569;">
        Here's your schedule for <strong>${d.date}</strong> from ${d.businessName}.
        You have <strong>${d.items.length} item${d.items.length !== 1 ? "s" : ""}</strong> today.
      </p>
    </td></tr>

    <tr><td style="padding:8px 32px 0;">
      <div style="background:#f8fafc;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${itemRows}
        </table>
      </div>
    </td></tr>

    <tr><td style="padding:24px 32px 32px;">
      <p style="margin:0;font-size:13px;color:#64748b;">
        Questions or changes? Contact ${d.businessName}${d.businessPhone ? ` at <strong>${d.businessPhone}</strong>` : ""}.
      </p>
    </td></tr>
  `;

  return emailShell(content, "#059669");
}

// ── Review Request Email ──────────────────────────────────────────────────────

export type ReviewRequestEmailData = {
  customerName: string;
  businessName: string;
  jobTitle: string;
  reviewUrl: string;
  beforePhotoUrl?: string | null;
  afterPhotoUrl?: string | null;
};

export function buildReviewRequestEmail(d: ReviewRequestEmailData): string {
  const photosSection = (d.beforePhotoUrl || d.afterPhotoUrl) ? `
    <tr><td style="padding:0 32px 24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Job Photos</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${d.beforePhotoUrl ? `
          <td width="48%" style="padding-right:8px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#92400e;background:#fef3c7;border:1px solid #fde68a;border-radius:6px;padding:3px 8px;display:inline-block;">Before</p><br/>
            <img src="${d.beforePhotoUrl}" alt="Before" width="100%" style="border-radius:10px;border:1px solid #e2e8f0;display:block;" />
          </td>` : "<td></td>"}
          ${d.afterPhotoUrl ? `
          <td width="48%" style="padding-left:8px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#065f46;background:#d1fae5;border:1px solid #a7f3d0;border-radius:6px;padding:3px 8px;display:inline-block;">After</p><br/>
            <img src="${d.afterPhotoUrl}" alt="After" width="100%" style="border-radius:10px;border:1px solid #e2e8f0;display:block;" />
          </td>` : "<td></td>"}
        </tr>
      </table>
    </td></tr>` : "";

  const content = `
    <tr><td style="padding:32px 32px 8px;">
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">
        How did we do, ${d.customerName.split(" ")[0]}? ⭐
      </p>
      <p style="margin:0;font-size:15px;color:#475569;line-height:1.6;">
        Thank you for choosing <strong>${d.businessName}</strong>. We just completed your <strong>${d.jobTitle}</strong> and hope everything looks great!
      </p>
      <p style="margin:16px 0 0;font-size:15px;color:#475569;line-height:1.6;">
        If you're happy with the work, it would mean the world to us if you left a quick review. It only takes 30 seconds and helps our small business grow.
      </p>
    </td></tr>

    <tr><td style="padding:24px 32px;">
      <a href="${d.reviewUrl}"
         style="display:inline-block;background:#059669;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">
        ⭐ Leave a Review
      </a>
    </td></tr>

    ${photosSection}

    <tr><td style="padding:0 32px 32px;">
      <p style="margin:0;font-size:13px;color:#94a3b8;">
        Thank you for your business — we look forward to serving you again!<br />
        — The ${d.businessName} team
      </p>
    </td></tr>
  `;

  return emailShell(content, "#059669");
}

// ── Weather Alert Email ───────────────────────────────────────────────────────

export type WeatherAlertJob = {
  title: string;
  serviceDate: string;   // YYYY-MM-DD
  customerName: string;
  weatherSummary: string; // e.g. "Rain (65%), High winds (28 mph)"
};

export type WeatherAlertEmailData = {
  businessName: string;
  ownerEmail: string;
  jobs: WeatherAlertJob[];
  appUrl?: string;
};

function fmtAlertDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

export function weatherAlertEmail(data: WeatherAlertEmailData): string {
  const { businessName, jobs, appUrl = "https://app.yardpilot.net" } = data;
  const count = jobs.length;

  const jobRows = jobs.map((job) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">${job.title}</p>
        <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${job.customerName} &middot; ${fmtAlertDate(job.serviceDate)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#dc2626;font-weight:500;">&#9888;&#65039; ${job.weatherSummary}</p>
      </td>
    </tr>
  `).join("");

  const content = `
    <tr><td style="padding:32px 32px 8px;">
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">
        Weather Alert &mdash; ${count} Job${count !== 1 ? "s" : ""} at Risk
      </p>
      <p style="margin:0;font-size:15px;color:#475569;line-height:1.6;">
        Hi ${businessName} team, our daily weather check flagged <strong>${count} upcoming job${count !== 1 ? "s" : ""}</strong> that may be affected by bad weather. Review and reschedule as needed.
      </p>
    </td></tr>

    <tr><td style="padding:16px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${jobRows}
      </table>
    </td></tr>

    <tr><td style="padding:8px 32px 32px;">
      <a href="${appUrl}/jobs"
         style="display:inline-block;background:#0f172a;color:#fff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
        View Jobs &rarr;
      </a>
      <p style="margin:16px 0 0;font-size:13px;color:#94a3b8;">
        These jobs have been flagged in YardPilot so you can easily find them. No jobs have been automatically moved.
      </p>
    </td></tr>
  `;

  return emailShell(content, "#1e40af");
}
