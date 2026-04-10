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
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">LawnCare CRM</p>
          </td>
        </tr>

        <!-- Body -->
        ${content}

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
              This email was sent automatically by LawnCare CRM.<br />
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

    ${
      printUrl
        ? `<tr><td style="padding:0 32px 32px;">
            <a href="${printUrl}" style="display:inline-block;background:#059669;color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;">
              View Invoice
            </a>
           </td></tr>`
        : ""
    }

    <tr><td style="padding:0 32px 32px;font-size:13px;color:#64748b;">
      <p style="margin:0;">Questions? Contact us at
        <a href="mailto:${d.businessEmail}" style="color:#059669;">${d.businessEmail}</a>
        ${d.businessPhone ? ` or call ${d.businessPhone}` : ""}.
      </p>
    </td></tr>
  `;

  return emailShell(content);
}

/**
 * Sent as a reminder when the invoice is approaching or past due.
 */
export function invoiceReminderEmail(
  d: InvoiceEmailData,
  type: "upcoming" | "due_today" | "overdue"
): string {
  const accentColor = type === "overdue" ? "#dc2626" : "#d97706";

  const headings = {
    upcoming: "Friendly payment reminder",
    due_today: "Your invoice is due today",
    overdue: "Your invoice is overdue",
  };

  const subtext = {
    upcoming: `Just a heads-up — your invoice from ${d.businessName} is due soon.`,
    due_today: `Your invoice from ${d.businessName} is due today. Please arrange payment at your earliest convenience.`,
    overdue: `Your invoice from ${d.businessName} is past due. Please arrange payment as soon as possible.`,
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

    ${
      printUrl
        ? `<tr><td style="padding:0 32px 32px;">
            <a href="${printUrl}" style="display:inline-block;background:${accentColor};color:#fff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;">
              View Invoice
            </a>
           </td></tr>`
        : ""
    }

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
