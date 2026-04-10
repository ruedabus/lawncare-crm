import Link from "next/link";

type InvoiceActionsProps = {
  invoiceId: string;
  customerId?: string;
  invoiceNumber?: string;
  pdfUrl?: string | null;
  canEdit?: boolean;
  canDelete?: boolean;
  canMarkPaid?: boolean;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function InvoiceActions({
  invoiceId,
  customerId,
  invoiceNumber,
  pdfUrl,
  canEdit = true,
  canDelete = false,
  canMarkPaid = false,
}: InvoiceActionsProps) {
  const buttonBase =
    "inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30";

  const neutralButton = cx(
    buttonBase,
    "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
  );

  const primaryButton = cx(
    buttonBase,
    "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
  );

  const dangerButton = cx(
    buttonBase,
    "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
  );

  const editHref = customerId
    ? `/customers/${customerId}/invoices/${invoiceId}/edit`
    : `/invoices/${invoiceId}/edit`;

  const viewHref = customerId
    ? `/customers/${customerId}/invoices/${invoiceId}`
    : `/invoices/${invoiceId}`;

  const markPaidHref = customerId
    ? `/customers/${customerId}/invoices/${invoiceId}/mark-paid`
    : `/invoices/${invoiceId}/mark-paid`;

  const deleteHref = customerId
    ? `/customers/${customerId}/invoices/${invoiceId}/delete`
    : `/invoices/${invoiceId}/delete`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={viewHref} className={neutralButton}>
        View
      </Link>

      {canEdit && (
        <Link href={editHref} className={neutralButton}>
          Edit
        </Link>
      )}

      {pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className={primaryButton}
        >
          Download PDF
        </a>
      )}

      {canMarkPaid && (
        <form action={markPaidHref}>
          <button type="submit" className={primaryButton}>
            Mark Paid
          </button>
        </form>
      )}

      {canDelete && (
        <form action={deleteHref}>
          <button type="submit" className={dangerButton}>
            Delete
          </button>
        </form>
      )}

      {invoiceNumber && (
        <span className="ml-1 text-xs text-zinc-500">
          Invoice #{invoiceNumber}
        </span>
      )}
    </div>
  );
}