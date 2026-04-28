import { createServiceClient } from "../../../../lib/supabase/server";
import { notFound } from "next/navigation";
import { CaptureForm } from "./capture-form";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeadCapturePage({ params }: Props) {
  const { slug } = await params;

  const supabase = createServiceClient();

  // Check lead_capture_codes first, then fall back to settings.lead_capture_slug
  let businessName = "Your Local Lawn Care Pro";

  const { data: codeRow } = await supabase
    .from("lead_capture_codes")
    .select("user_id")
    .eq("slug", slug)
    .maybeSingle();

  if (codeRow) {
    const { data: settingsRow } = await supabase
      .from("settings")
      .select("business_name")
      .eq("user_id", codeRow.user_id)
      .maybeSingle();
    businessName = settingsRow?.business_name || businessName;
  } else {
    const { data: settings } = await supabase
      .from("settings")
      .select("business_name")
      .eq("lead_capture_slug", slug)
      .maybeSingle();
    if (!settings) notFound();
    businessName = settings.business_name || businessName;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg">
            <svg
              className="h-9 w-9 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{businessName}</h1>
          <p className="mt-2 text-slate-500">
            Interested in our services? Leave your info and we&apos;ll be in touch!
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <CaptureForm slug={slug} businessName={businessName} />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Powered by{" "}
          <span className="font-semibold text-emerald-600">YardPilot</span>
        </p>
      </div>
    </div>
  );
}
