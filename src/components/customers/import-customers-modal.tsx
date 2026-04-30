"use client";

import { useState, useRef, useCallback } from "react";

type RawRow = Record<string, string>;

type MappedRow = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type ImportResult = {
  imported: number;
  skipped: number;
  skippedDetails: string[];
  errors: string[];
};

// ── CSV parser (handles quoted fields) ────────────────────────────────────────
function parseCsv(text: string): { headers: string[]; rows: RawRow[] } {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length === 0) return { headers: [], rows: [] };

  function parseRow(line: string): string[] {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    return cells;
  }

  const headers = parseRow(lines[0]);
  const rows: RawRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cells = parseRow(lines[i]);
    const row: RawRow = {};
    headers.forEach((h, idx) => { row[h] = cells[idx] ?? ""; });
    rows.push(row);
  }
  return { headers, rows };
}

// ── Auto-detect column mapping ────────────────────────────────────────────────
function autoDetect(headers: string[]): Record<string, string> {
  const lower = headers.map((h) => h.toLowerCase());
  const find = (...keywords: string[]) =>
    headers[lower.findIndex((h) => keywords.some((k) => h.includes(k)))] ?? "";

  return {
    name: find("name", "full name", "client", "customer"),
    email: find("email", "e-mail", "mail"),
    phone: find("phone", "mobile", "cell", "tel", "contact"),
    address: find("address", "street", "location", "service address"),
  };
}

const FIELDS: { key: keyof MappedRow; label: string; required: boolean }[] = [
  { key: "name", label: "Full Name", required: true },
  { key: "email", label: "Email", required: false },
  { key: "phone", label: "Phone", required: false },
  { key: "address", label: "Address", required: false },
];

// ── Main component ─────────────────────────────────────────────────────────────
export function ImportCustomersModal({ onClose, onImported }: {
  onClose: () => void;
  onImported: () => void;
}) {
  const [step, setStep] = useState<"upload" | "map" | "preview" | "done">("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<RawRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // ── File handling ────────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    setFileError("");
    if (!file.name.endsWith(".csv")) {
      setFileError("Please upload a .csv file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows } = parseCsv(text);
      if (h.length === 0 || rows.length === 0) {
        setFileError("Could not read the file. Make sure it has a header row and at least one data row.");
        return;
      }
      setHeaders(h);
      setRawRows(rows);
      setMapping(autoDetect(h));
      setStep("map");
    };
    reader.readAsText(file);
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  // ── Mapped preview rows ──────────────────────────────────────────────────────
  const mappedRows: MappedRow[] = rawRows.map((row) => ({
    name: mapping.name ? row[mapping.name] ?? "" : "",
    email: mapping.email ? row[mapping.email] ?? "" : "",
    phone: mapping.phone ? row[mapping.phone] ?? "" : "",
    address: mapping.address ? row[mapping.address] ?? "" : "",
  }));

  const validRows = mappedRows.filter((r) => r.name.trim());

  // ── Import ───────────────────────────────────────────────────────────────────
  async function handleImport() {
    setImporting(true);
    try {
      const res = await fetch("/api/customers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setResult(data);
      setStep("done");
      onImported();
    } catch (err) {
      setResult({
        imported: 0,
        skipped: 0,
        skippedDetails: [],
        errors: [err instanceof Error ? err.message : "Import failed"],
      });
      setStep("done");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Import Customers</h2>
            <p className="text-xs text-slate-500">
              {step === "upload" && "Upload a CSV file from Jobber, Yardbook, QuickBooks, or any spreadsheet"}
              {step === "map" && "Match your CSV columns to YardPilot fields"}
              {step === "preview" && `Preview ${validRows.length} customers ready to import`}
              {step === "done" && "Import complete"}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">

          {/* ── Step 1: Upload ── */}
          {step === "upload" && (
            <div className="space-y-4">
              <div
                className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 transition cursor-pointer ${dragOver ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">Drop your CSV file here, or click to browse</p>
                  <p className="mt-1 text-xs text-slate-400">Supports exports from Jobber, Yardbook, QuickBooks, Google Sheets, Excel</p>
                </div>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
              {fileError && <p className="text-sm text-red-600">{fileError}</p>}

              {/* Sample format */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="mb-2 text-xs font-semibold text-slate-500">Expected CSV format (any order is fine):</p>
                <code className="text-xs text-slate-600">Name, Email, Phone, Address<br />John Smith, john@email.com, 555-1234, 123 Main St</code>
              </div>
            </div>
          )}

          {/* ── Step 2: Column mapping ── */}
          {step === "map" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                We found <span className="font-semibold">{rawRows.length} rows</span> in your file. Match each field below:
              </p>
              <div className="space-y-3">
                {FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center gap-3">
                    <label className="w-28 shrink-0 text-sm font-medium text-slate-700">
                      {field.label}
                      {field.required && <span className="ml-0.5 text-red-500">*</span>}
                    </label>
                    <select
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      value={mapping[field.key] ?? ""}
                      onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                    >
                      <option value="">— skip this field —</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              {!mapping.name && (
                <p className="text-xs text-red-500">Name column is required to proceed.</p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setStep("upload")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Back</button>
                <button
                  disabled={!mapping.name}
                  onClick={() => setStep("preview")}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
                >
                  Preview Import →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Preview ── */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-emerald-800">
                  <span className="font-semibold">{validRows.length} customers</span> ready to import
                  {rawRows.length - validRows.length > 0 && (
                    <span className="ml-1 text-emerald-600">({rawRows.length - validRows.length} rows skipped — missing name)</span>
                  )}
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Email</th>
                      <th className="px-3 py-2 text-left">Phone</th>
                      <th className="px-3 py-2 text-left">Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {validRows.slice(0, 50).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-800">{row.name}</td>
                        <td className="px-3 py-2 text-slate-500">{row.email || "—"}</td>
                        <td className="px-3 py-2 text-slate-500">{row.phone || "—"}</td>
                        <td className="max-w-[180px] truncate px-3 py-2 text-slate-500">{row.address || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {validRows.length > 50 && (
                  <p className="px-3 py-2 text-center text-xs text-slate-400">Showing first 50 of {validRows.length}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setStep("map")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Back</button>
                <button
                  onClick={handleImport}
                  disabled={importing || validRows.length === 0}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
                >
                  {importing ? "Importing…" : `Import ${validRows.length} Customers`}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Done ── */}
          {step === "done" && result && (
            <div className="space-y-4 text-center">
              {result.errors.length === 0 ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">Import complete!</p>
                    <p className="text-sm text-slate-500">
                      <span className="font-semibold text-emerald-600">{result.imported} customers</span> added successfully
                      {result.skipped > 0 && `, ${result.skipped} skipped (duplicates or missing name)`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">Import failed</p>
                    <p className="text-sm text-red-600">{result.errors[0]}</p>
                  </div>
                </div>
              )}

              {result.skippedDetails.length > 0 && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-left">
                  <p className="mb-1 text-xs font-semibold text-slate-500">Skipped rows:</p>
                  <ul className="space-y-0.5">
                    {result.skippedDetails.slice(0, 10).map((d, i) => (
                      <li key={i} className="text-xs text-slate-500">• {d}</li>
                    ))}
                    {result.skippedDetails.length > 10 && (
                      <li className="text-xs text-slate-400">…and {result.skippedDetails.length - 10} more</li>
                    )}
                  </ul>
                </div>
              )}

              <button
                onClick={onClose}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
