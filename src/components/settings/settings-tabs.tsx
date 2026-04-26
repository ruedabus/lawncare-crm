"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";
import { TeamTab } from "./team-tab";

type Settings = {
  business_name?: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  business_website?: string;
  google_review_url?: string;
  service_city?: string;
  service_state?: string;
  service_lat?: number;
  service_lon?: number;
  notify_new_job?: boolean;
  notify_unpaid_invoice?: boolean;
  notify_upcoming_task?: boolean;
  notify_new_lead?: boolean;
  payment_reminders_enabled?: boolean;
  lead_capture_slug?: string;
  stripe_account_id?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
  plan_name?: string | null;
  trial_ends_at?: string | null;
  current_period_end?: string | null;
  estimate_small_price?: number | null;
  estimate_medium_price?: number | null;
  estimate_large_price?: number | null;
  estimate_small_max_sqft?: number | null;
  estimate_large_min_sqft?: number | null;
};

type UserInfo = {
  id: string;
  email: string;
  name: string;
};

type Tab = "business" | "account" | "security" | "qrcode" | "location" | "notifications" | "payments" | "billing" | "team";

const OWNER_TABS: { id: Tab; label: string }[] = [
  { id: "business", label: "Business Profile" },
  { id: "account", label: "Account" },
  { id: "security", label: "Security" },
  { id: "qrcode", label: "QR Lead Capture" },
  { id: "location", label: "Service Location" },
  { id: "notifications", label: "Notifications" },
  { id: "payments", label: "Payments" },
  { id: "billing", label: "Billing" },
  { id: "team", label: "Team" },
];

// Tabs available to non-owner team members (admin)
const MEMBER_TABS: { id: Tab; label: string }[] = [
  { id: "business", label: "Business Profile" },
  { id: "account", label: "Account" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
];

export function SettingsTabs({
  user,
  settings: initialSettings,
  isOwner = true,
}: {
  user: UserInfo;
  settings: Settings | null;
  isOwner?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("business");
  const settings = initialSettings ?? {};
  const TABS = isOwner ? OWNER_TABS : MEMBER_TABS;

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "business" && (
        <BusinessProfileTab settings={settings} />
      )}
      {activeTab === "account" && (
        <AccountTab user={user} />
      )}
      {activeTab === "location" && (
        <ServiceLocationTab settings={settings} />
      )}
      {activeTab === "security" && <SecurityTab />}
      {activeTab === "qrcode" && (
        <QrCodeTab
          slug={settings.lead_capture_slug ?? ""}
          businessName={settings.business_name}
          onGoToBusinessProfile={() => setActiveTab("business")}
        />
      )}
      {activeTab === "notifications" && (
        <NotificationsTab settings={settings} />
      )}
      {activeTab === "payments" && (
        <PaymentsTab stripeAccountId={settings.stripe_account_id ?? null} />
      )}
      {activeTab === "billing" && (
        <BillingTab settings={settings} />
      )}
      {activeTab === "team" && isOwner && (
        <TeamTab />
      )}
    </div>
  );
}

// ── Business Profile ─────────────────────────────────────────────────────────

function BusinessProfileTab({ settings }: { settings: Settings }) {
  const [form, setForm] = useState({
    business_name: settings.business_name ?? "",
    business_address: settings.business_address ?? "",
    business_phone: settings.business_phone ?? "",
    business_email: settings.business_email ?? "",
    business_website: settings.business_website ?? "",
    google_review_url: settings.google_review_url ?? "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Save failed");
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
      setStatus("error");
    }
  }

  return (
    <>
    <SettingsCard
      title="Business Profile"
      description="This information appears on invoices and throughout the app."
    >
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Business Name" required>
            <input
              type="text"
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              placeholder="Sunshine Lawn Care"
              className={inputCls}
            />
          </Field>
          <Field label="Business Phone">
            <input
              type="tel"
              value={form.business_phone}
              onChange={(e) => setForm({ ...form, business_phone: e.target.value })}
              placeholder="(352) 555-0100"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Business Email">
          <input
            type="email"
            value={form.business_email}
            onChange={(e) => setForm({ ...form, business_email: e.target.value })}
            placeholder="info@sunshinelawn.com"
            className={inputCls}
          />
        </Field>

        <Field label="Business Address">
          <textarea
            value={form.business_address}
            onChange={(e) => setForm({ ...form, business_address: e.target.value })}
            placeholder="123 Main St, Brooksville, FL 34601"
            rows={2}
            className={inputCls}
          />
        </Field>

        <Field label="Website">
          <input
            type="url"
            value={form.business_website}
            onChange={(e) => setForm({ ...form, business_website: e.target.value })}
            placeholder="https://sunshinelawn.com"
            className={inputCls}
          />
        </Field>

        <Field label="Google Review Link">
          {settings.plan_name === "pro" || settings.plan_name === "premier" ? (
            <>
              <input
                type="url"
                value={form.google_review_url}
                onChange={(e) => setForm({ ...form, google_review_url: e.target.value })}
                placeholder="https://g.page/r/your-business/review"
                className={inputCls}
              />
              <p className="mt-1 text-xs text-slate-400">
                When a job is marked complete, the customer automatically receives a review request email with this link.
              </p>
            </>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">Automatic review requests — Pro &amp; Premier</p>
                <p className="mt-0.5 text-xs text-amber-700">
                  Upgrade to Pro or Premier and every completed job automatically sends your customer a review request email. One of the fastest ways to grow your reputation.
                </p>
                <a href="/settings?tab=billing" className="mt-2 inline-block text-xs font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900">
                  Upgrade your plan →
                </a>
              </div>
            </div>
          )}
        </Field>

        <SaveRow status={status} errorMsg={errorMsg} />
      </form>
    </SettingsCard>

    <SmartEstimateSettings settings={settings} />
    </>
  );
}

// ── Smart Estimate pricing tiers ─────────────────────────────────────────────

function SmartEstimateSettings({ settings }: { settings: Settings }) {
  const isLocked = settings.plan_name !== "pro" && settings.plan_name !== "premier";

  const [form, setForm] = useState({
    estimate_small_price: settings.estimate_small_price ?? 45,
    estimate_medium_price: settings.estimate_medium_price ?? 65,
    estimate_large_price: settings.estimate_large_price ?? 95,
    estimate_small_max_sqft: settings.estimate_small_max_sqft ?? 5000,
    estimate_large_min_sqft: settings.estimate_large_min_sqft ?? 15000,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
      setStatus("error");
    }
  }

  return (
    <SettingsCard
      title="Smart Estimate — Lot Size Pricing"
      description="Set your prices per lot tier. When you look up an address on an estimate, YardPilot fetches the lot size and suggests the right price automatically."
    >
      {isLocked ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">Smart Estimate — Pro &amp; Premier</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Type in any service address and instantly get the lot size and a suggested price. Available on Pro and Premier plans.
            </p>
            <a href="/settings?tab=billing" className="mt-1.5 inline-block text-xs font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900">
              Upgrade your plan →
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Lot size thresholds */}
          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">Lot Size Thresholds (sq ft)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Small lot — max sq ft">
                <input
                  type="number"
                  min={1000}
                  value={form.estimate_small_max_sqft}
                  onChange={(e) => setForm({ ...form, estimate_small_max_sqft: Number(e.target.value) })}
                  className={inputCls}
                />
                <p className="mt-1 text-xs text-slate-400">Lots under this size are &quot;small&quot;</p>
              </Field>
              <Field label="Large lot — min sq ft">
                <input
                  type="number"
                  min={1000}
                  value={form.estimate_large_min_sqft}
                  onChange={(e) => setForm({ ...form, estimate_large_min_sqft: Number(e.target.value) })}
                  className={inputCls}
                />
                <p className="mt-1 text-xs text-slate-400">Lots at or above this size are &quot;large&quot;</p>
              </Field>
            </div>
          </div>

          {/* Price tiers */}
          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">Suggested Prices ($)</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Small</p>
                <p className="mb-2 text-xs text-slate-400">Under {form.estimate_small_max_sqft.toLocaleString()} sq ft</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.estimate_small_price}
                    onChange={(e) => setForm({ ...form, estimate_small_price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">Medium</p>
                <p className="mb-2 text-xs text-slate-400">{form.estimate_small_max_sqft.toLocaleString()} – {form.estimate_large_min_sqft.toLocaleString()} sq ft</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.estimate_medium_price}
                    onChange={(e) => setForm({ ...form, estimate_medium_price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-emerald-200 bg-white pl-7 pr-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Large</p>
                <p className="mb-2 text-xs text-slate-400">{form.estimate_large_min_sqft.toLocaleString()}+ sq ft</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.estimate_large_price}
                    onChange={(e) => setForm({ ...form, estimate_large_price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
            </div>
          </div>

          <SaveRow status={status} errorMsg={errorMsg} />
        </form>
      )}
    </SettingsCard>
  );
}

// ── Account ──────────────────────────────────────────────────────────────────

function AccountTab({ user }: { user: UserInfo }) {
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
  });
  const [pwForm, setPwForm] = useState({
    current: "",
    newPw: "",
    confirm: "",
  });
  const [profileStatus, setProfileStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [profileError, setProfileError] = useState("");
  const [pwError, setPwError] = useState("");

  const supabase = createClient();

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileStatus("saving");
    setProfileError("");
    try {
      const { error } = await supabase.auth.updateUser({
        email: profileForm.email !== user.email ? profileForm.email : undefined,
        data: { full_name: profileForm.name },
      });
      if (error) throw error;
      setProfileStatus("saved");
      setTimeout(() => setProfileStatus("idle"), 3000);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Update failed");
      setProfileStatus("error");
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (pwForm.newPw !== pwForm.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pwForm.newPw.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    setPwStatus("saving");
    try {
      const { error } = await supabase.auth.updateUser({
        password: pwForm.newPw,
      });
      if (error) throw error;
      setPwStatus("saved");
      setPwForm({ current: "", newPw: "", confirm: "" });
      setTimeout(() => setPwStatus("idle"), 3000);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Password update failed");
      setPwStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Profile"
        description="Update your display name and email address."
      >
        <form onSubmit={handleProfileSave} className="space-y-5">
          <Field label="Full Name">
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              placeholder="Your name"
              className={inputCls}
            />
          </Field>
          <Field label="Email Address">
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              placeholder="you@example.com"
              className={inputCls}
            />
          </Field>
          {profileForm.email !== user.email && (
            <p className="text-xs text-amber-600">
              A confirmation link will be sent to the new email address.
            </p>
          )}
          <SaveRow status={profileStatus} errorMsg={profileError} />
        </form>
      </SettingsCard>

      <SettingsCard
        title="Change Password"
        description="Choose a strong password of at least 8 characters."
      >
        <form onSubmit={handlePasswordSave} className="space-y-5">
          <Field label="New Password">
            <input
              type="password"
              value={pwForm.newPw}
              onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
              placeholder="••••••••"
              className={inputCls}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm New Password">
            <input
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              placeholder="••••••••"
              className={inputCls}
              autoComplete="new-password"
            />
          </Field>
          <SaveRow status={pwStatus} errorMsg={pwError} label="Update Password" />
        </form>
      </SettingsCard>
    </div>
  );
}

// ── Service Location ─────────────────────────────────────────────────────────

function ServiceLocationTab({ settings }: { settings: Settings }) {
  const [zip, setZip] = useState("");
  const [resolved, setResolved] = useState<{ city: string; state: string } | null>(
    settings.service_city ? { city: settings.service_city, state: settings.service_state ?? "" } : null
  );
  const [form, setForm] = useState({
    service_city: settings.service_city ?? "",
    service_state: settings.service_state ?? "",
    service_lat: settings.service_lat ?? null,
    service_lon: settings.service_lon ?? null,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error" | "looking">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function lookupZip(value: string) {
    if (value.length !== 5) return;
    setStatus("looking");
    setErrorMsg("");
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${value}`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
      const place = data.places?.[0];
      if (!place) throw new Error("not found");
      const city = place["place name"];
      const state = place["state abbreviation"];
      const lat = parseFloat(parseFloat(place.latitude).toFixed(4));
      const lon = parseFloat(parseFloat(place.longitude).toFixed(4));
      setResolved({ city, state });
      setForm((f) => ({ ...f, service_city: city, service_state: state, service_lat: lat, service_lon: lon }));
      setStatus("idle");
    } catch {
      setResolved(null);
      setErrorMsg("Zip code not found. Please check and try again.");
      setStatus("error");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!resolved) { setErrorMsg("Please enter a valid zip code first."); setStatus("error"); return; }
    setStatus("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Save failed");
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
      setStatus("error");
    }
  }

  return (
    <SettingsCard
      title="Service Location"
      description="Used for weather on the dashboard and future route planning."
    >
      <form onSubmit={handleSave} className="space-y-5">
        <Field label="Zip Code">
          <input
            type="text"
            value={zip}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 5);
              setZip(val);
              setResolved(null);
              setErrorMsg("");
              setStatus("idle");
              if (val.length === 5) lookupZip(val);
            }}
            placeholder="e.g. 34609"
            maxLength={5}
            className={inputCls}
          />
        </Field>

        {status === "looking" && (
          <p className="text-sm text-slate-400">Looking up zip code…</p>
        )}

        {resolved && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {resolved.city}, {resolved.state}
          </div>
        )}

        <SaveRow
          status={status === "looking" ? "idle" : status}
          errorMsg={errorMsg}
        />
      </form>
    </SettingsCard>
  );
}

// ── Notifications ────────────────────────────────────────────────────────────

function NotificationsTab({ settings }: { settings: Settings }) {
  const planName = settings.plan_name ?? "basic";
  const hasPaymentReminders = planName === "pro" || planName === "premier";

  const [form, setForm] = useState({
    notify_new_job: settings.notify_new_job ?? true,
    notify_unpaid_invoice: settings.notify_unpaid_invoice ?? true,
    notify_upcoming_task: settings.notify_upcoming_task ?? true,
    notify_new_lead: settings.notify_new_lead ?? true,
    payment_reminders_enabled: settings.payment_reminders_enabled ?? true,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Save failed");
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
      setStatus("error");
    }
  }

  return (
    <SettingsCard
      title="Notification Preferences"
      description="Choose which events you want to be notified about. Email delivery requires a mail integration to be configured."
    >
      <form onSubmit={handleSave} className="space-y-4">
        <Toggle
          label="New Job Created"
          description="Alert when a new job is added to the system."
          checked={form.notify_new_job}
          onChange={(v) => setForm({ ...form, notify_new_job: v })}
        />
        <Toggle
          label="Unpaid Invoice Reminder"
          description="Alert when an invoice remains unpaid past its due date."
          checked={form.notify_unpaid_invoice}
          onChange={(v) => setForm({ ...form, notify_unpaid_invoice: v })}
        />
        <Toggle
          label="Upcoming Task Due"
          description="Alert when a task is due within 24 hours."
          checked={form.notify_upcoming_task}
          onChange={(v) => setForm({ ...form, notify_upcoming_task: v })}
        />
        <Toggle
          label="New Lead Added"
          description="Alert when a new lead enters the pipeline."
          checked={form.notify_new_lead}
          onChange={(v) => setForm({ ...form, notify_new_lead: v })}
        />

        {/* ── Automated Payment Reminders (Pro + Premier) ── */}
        <div className="border-t border-slate-100 pt-4">
          {hasPaymentReminders ? (
            <Toggle
              label="Automated Payment Reminders"
              description="Automatically email customers a friendly reminder at 7 days and a second notice at 14 days when an invoice remains unpaid."
              checked={form.payment_reminders_enabled}
              onChange={(v) => setForm({ ...form, payment_reminders_enabled: v })}
            />
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 opacity-60">
              <div className="mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full bg-slate-300">
                <span className="h-4 w-4 translate-x-0.5 rounded-full bg-white shadow" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Automated Payment Reminders
                  <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    Pro+
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Auto-send 7-day and 14-day follow-up emails for unpaid invoices.{" "}
                  <a href="/settings?tab=billing" className="font-medium text-emerald-600 hover:underline">
                    Upgrade to Pro
                  </a>{" "}
                  to enable.
                </p>
              </div>
            </div>
          )}
        </div>

        <SaveRow status={status} errorMsg={errorMsg} />
      </form>
    </SettingsCard>
  );
}

// ── QR Lead Capture ──────────────────────────────────────────────────────────

function QrCodeTab({ slug: initialSlug, businessName, onGoToBusinessProfile }: { slug: string; businessName?: string; onGoToBusinessProfile?: () => void }) {
  const [slug, setSlug] = useState(initialSlug);
  const [editSlug, setEditSlug] = useState(initialSlug);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error" | "generating">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.yardpilot.net";
  const captureUrl = slug ? `${baseUrl}/leads/capture/${slug}` : "";
  const qrImageUrl = captureUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(captureUrl)}&color=1a5c2a&bgcolor=ffffff&format=png`
    : "";

  async function generateSlug() {
    setStatus("generating");
    setErrorMsg("");
    try {
      const res = await fetch("/api/settings/slug", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate");
      setSlug(data.slug);
      setEditSlug(data.slug);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error");
      setStatus("error");
    }
  }

  async function saveSlug(e: React.FormEvent) {
    e.preventDefault();
    if (!editSlug.trim()) return;
    const clean = editSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_capture_slug: clean }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSlug(clean);
      setEditSlug(clean);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
      setStatus("error");
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(captureUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Warning if business name not set */}
      {!businessName && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
          </svg>
          <p className="text-sm text-blue-700">
            <strong>Tip:</strong> Set your business name in{" "}
            <button
              className="underline underline-offset-2 hover:text-blue-900"
              onClick={onGoToBusinessProfile}
            >
              Business Profile
            </button>{" "}
            first — it will appear on your capture page and be used to generate your link.
          </p>
        </div>
      )}

      <SettingsCard
        title="QR Lead Capture"
        description="Customers scan your QR code and fill out a quick form — the lead lands straight in your CRM."
      >
        {!slug ? (
          /* No slug yet — first time setup */
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">Generate your unique capture link to get started.</p>
            {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
            <button
              onClick={generateSlug}
              disabled={status === "generating"}
              className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {status === "generating" ? "Generating…" : "Generate My Capture Link"}
            </button>
          </div>
        ) : (
          /* Has slug — show QR + management */
          <div className="space-y-6">
            {/* QR Code display */}
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="shrink-0 rounded-2xl border-2 border-emerald-100 bg-white p-3 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt="QR Code"
                  width={160}
                  height={160}
                  className="rounded-lg"
                />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Your capture link</p>
                  <p className="mt-1 break-all text-sm font-medium text-slateald-800">{captureUrl}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={copyLink}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    {copied ? "✓ Copied!" : "Copy Link"}
                  </button>
                  <a
                    href={qrImageUrl}
                    download="yardpilot-qr-code.png"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Download QR
                  </a>
                  <a
                    href={captureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Preview Page
                  </a>
                </div>
              </div>
            </div>

            {/* Print tip */}
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-700">
                <strong>💡 Tip:</strong> Download the QR code and print it on truck magnets, yard signs, door hangers, or business cards. Every scan drops straight into your Leads list.
              </p>
            </div>

            {/* Slug editor */}
            <div className="border-t border-slate-100 pt-4">
              <p className="mb-3 text-sm font-medium text-slate-700">Customize your link</p>
              <form onSubmit={saveSlug} className="flex gap-2">
                <div className="flex flex-1 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-sm">
                  <span className="whitespace-nowrap px-3 text-slate-400">…/leads/capture/</span>
                  <input
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    className="flex-1 bg-transparent py-2.5 pr-3 text-slate-900 outline-none"
                    placeholder="your-business-name"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "saving" || editSlug === slug}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-40"
                >
                  {status === "saving" ? "Saving…" : "Save"}
                </button>
              </form>
              {status === "saved" && <p className="mt-2 text-sm text-emerald-600">✓ Saved</p>}
              {status === "error" && <p className="mt-2 text-sm text-red-600">{errorMsg}</p>}
            </div>
          </div>
        )}
      </SettingsCard>
    </div>
  );
}

// ── Security (MFA) ───────────────────────────────────────────────────────────

function SecurityTab() {
  const supabase = createClient();

  // Enrollment state
  const [step, setStep] = useState<"idle" | "enrolling" | "verifying" | "unenrolling">("idle");
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState(""); // SVG string
  const [secret, setSecret] = useState(""); // manual entry key
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "saved" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // Load enrollment status on mount
  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const hasTOTP = (data?.totp?.length ?? 0) > 0;
      setEnrolled(hasTOTP);
      if (hasTOTP) setFactorId(data!.totp[0].id);
      setStatus("idle");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startEnroll() {
    setStep("enrolling");
    setErrorMsg("");
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      issuer: "YardPilot",
    });
    if (error || !data) {
      setErrorMsg(error?.message ?? "Failed to start enrollment");
      setStep("idle");
      return;
    }
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);  // SVG string
    setSecret(data.totp.secret);
    setStep("verifying");
  }

  async function confirmEnroll(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: code.replace(/\s/g, ""),
    });
    if (error) {
      setErrorMsg(error.message);
      setStatus("idle");
      return;
    }
    setEnrolled(true);
    setStep("idle");
    setCode("");
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 3000);
  }

  async function unenroll() {
    if (!confirm("Are you sure you want to remove two-factor authentication? This will make your account less secure.")) return;
    setStep("unenrolling");
    setErrorMsg("");
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      setErrorMsg(error.message);
      setStep("idle");
      return;
    }
    setEnrolled(false);
    setFactorId("");
    setStep("idle");
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 3000);
  }

  if (status === "loading" && enrolled === null) {
    return (
      <SettingsCard title="Two-Factor Authentication" description="Loading…">
        <p className="text-sm text-slate-400">Checking MFA status…</p>
      </SettingsCard>
    );
  }

  // ── Enrolled ──────────────────────────────────────────────────────────────
  if (enrolled && step !== "verifying") {
    return (
      <SettingsCard
        title="Two-Factor Authentication"
        description="Your account is protected with an authenticator app."
      >
        <div className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800">2FA is Active</p>
            <p className="mt-1 text-xs text-emerald-700">
              You will be asked for a verification code each time you sign in.
            </p>
          </div>
        </div>

        {errorMsg && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{errorMsg}</p>
        )}
        {status === "saved" && (
          <p className="mt-4 text-sm text-emerald-600">✓ 2FA removed successfully.</p>
        )}

        <div className="mt-6 border-t border-slate-100 pt-4">
          <button
            onClick={unenroll}
            disabled={step === "unenrolling"}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          >
            {step === "unenrolling" ? "Removing…" : "Remove 2FA"}
          </button>
        </div>
      </SettingsCard>
    );
  }

  // ── QR Code / Verify enrollment ───────────────────────────────────────────
  if (step === "verifying") {
    return (
      <SettingsCard
        title="Set Up Authenticator App"
        description="Scan the QR code with Google Authenticator, Authy, or any TOTP app."
      >
        <div className="space-y-5">
          {/* QR code */}
          <div className="flex justify-center">
            <div
              className="rounded-xl border border-slate-200 p-3"
              dangerouslySetInnerHTML={{ __html: qrCode }}
            />
          </div>

          {/* Manual entry key */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="mb-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
              Manual entry key
            </p>
            <p className="break-all font-mono text-sm text-slate-800">{secret}</p>
          </div>

          <p className="text-sm text-slate-500">
            After scanning, enter the 6-digit code your app shows to confirm setup.
          </p>

          <form onSubmit={confirmEnroll} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                placeholder="000000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {errorMsg && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {errorMsg}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep("idle"); setCode(""); setErrorMsg(""); }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "loading" || code.replace(/\s/g, "").length < 6}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {status === "loading" ? "Verifying…" : "Activate 2FA"}
              </button>
            </div>
          </form>
        </div>
      </SettingsCard>
    );
  }

  // ── Not enrolled ──────────────────────────────────────────────────────────
  return (
    <SettingsCard
      title="Two-Factor Authentication"
      description="Add an extra layer of security to your account by requiring a code from your phone when you sign in."
    >
      <div className="flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">2FA is not enabled</p>
          <p className="mt-1 text-xs text-amber-700">
            We recommend enabling two-factor authentication to protect your business data.
          </p>
        </div>
      </div>

      {errorMsg && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{errorMsg}</p>
      )}

      <div className="mt-6">
        <button
          onClick={startEnroll}
          disabled={step === "enrolling"}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {step === "enrolling" ? "Setting up…" : "Enable 2FA with Authenticator App"}
        </button>
      </div>
    </SettingsCard>
  );
}

// ── Shared UI helpers ────────────────────────────────────────────────────────

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`h-5 w-9 rounded-full transition-colors ${
            checked ? "bg-emerald-500" : "bg-slate-300"
          }`}
        />
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </label>
  );
}

function SaveRow({
  status,
  errorMsg,
  label = "Save Changes",
}: {
  status: "idle" | "saving" | "saved" | "error";
  errorMsg: string;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div>
        {status === "error" && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}
        {status === "saved" && (
          <p className="text-sm text-emerald-600">✓ Saved successfully</p>
        )}
      </div>
      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {status === "saving" ? "Saving…" : label}
      </button>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

// ── Payments (Stripe Connect) ─────────────────────────────────────────────────

function PaymentsTab({ stripeAccountId }: { stripeAccountId: string | null }) {
  const [accountId, setAccountId] = useState(stripeAccountId);
  const [disconnecting, setDisconnecting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Pick up ?stripe= query param after OAuth redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const stripe = params.get("stripe");
    if (stripe === "connected") {
      setMsg({ type: "success", text: "Stripe account connected successfully!" });
      // Reload settings to show the new account ID
      window.history.replaceState({}, "", window.location.pathname + "?tab=payments");
    } else if (stripe === "error") {
      setMsg({ type: "error", text: "Something went wrong connecting your Stripe account. Please try again." });
      window.history.replaceState({}, "", window.location.pathname + "?tab=payments");
    } else if (stripe === "cancelled") {
      setMsg({ type: "error", text: "Stripe connection was cancelled." });
      window.history.replaceState({}, "", window.location.pathname + "?tab=payments");
    }
  }, []);

  async function handleDisconnect() {
    if (!confirm("Are you sure you want to disconnect your Stripe account? Future invoice payments will not be routed until you reconnect.")) return;
    setDisconnecting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/stripe/connect/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("Failed to disconnect");
      setAccountId(null);
      setMsg({ type: "success", text: "Stripe account disconnected." });
    } catch {
      setMsg({ type: "error", text: "Failed to disconnect. Please try again." });
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <SettingsCard title="Stripe Payments" description="Connect your Stripe account so your customers can pay invoices online and funds go directly to you.">
      {msg && (
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
          msg.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}>
          {msg.text}
        </div>
      )}

      {accountId ? (
        <div className="space-y-4">
          {/* Connected state */}
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Stripe account connected</p>
              <p className="text-xs text-emerald-600 font-mono mt-0.5">{accountId}</p>
            </div>
          </div>

          <p className="text-sm text-slate-600">
            Invoice payments from your customers will be deposited directly into your connected Stripe account. Standard Stripe fees (2.9% + 30¢) apply.
          </p>

          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {disconnecting ? "Disconnecting..." : "Disconnect Stripe account"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Disconnected state */}
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-800">No Stripe account connected</p>
              <p className="text-xs text-amber-700 mt-0.5">Online invoice payments are disabled until you connect.</p>
            </div>
          </div>

          <p className="text-sm text-slate-600">
            Connect your Stripe account to enable the <strong>Pay Now</strong> button on invoices. Your customers pay online and funds go straight to your bank — YardPilot never touches the money.
          </p>

          <ul className="space-y-1.5 text-sm text-slate-600">
            {[
              "Payments deposit directly to your bank account",
              "Standard Stripe fees: 2.9% + 30¢ per transaction",
              "No YardPilot fees on top",
              "Create a new Stripe account or connect an existing one",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.07 7.07a1 1 0 01-1.414 0L3.296 8.85A1 1 0 114.71 7.436l4.217 4.217 6.363-6.363a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <a
            href="/api/stripe/connect"
            className="inline-flex items-center gap-2 rounded-xl bg-[#635BFF] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5147e5]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
            </svg>
            Connect with Stripe
          </a>
        </div>
      )}
    </SettingsCard>
  );
}

// ── Billing ───────────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, string> = {
  basic: "Basic — $29.99/mo",
  pro: "Pro — $39.99/mo",
  premier: "Premier — $59.99/mo",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  trialing:  { label: "Free trial",   color: "text-blue-700 bg-blue-50 border-blue-200" },
  active:    { label: "Active",       color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  past_due:  { label: "Past due",     color: "text-amber-700 bg-amber-50 border-amber-200" },
  canceled:  { label: "Cancelled",    color: "text-slate-600 bg-slate-100 border-slate-200" },
  unpaid:    { label: "Unpaid",       color: "text-red-700 bg-red-50 border-red-200" },
};

function BillingTab({ settings }: { settings: Settings }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const status = settings.subscription_status ?? null;
  const statusInfo = status ? STATUS_LABELS[status] ?? { label: status, color: "text-slate-600 bg-slate-100 border-slate-200" } : null;
  const planLabel = settings.plan_name ? PLAN_LABELS[settings.plan_name] ?? settings.plan_name : null;

  const trialEnd = settings.trial_ends_at ? new Date(settings.trial_ends_at) : null;
  const periodEnd = settings.current_period_end ? new Date(settings.current_period_end) : null;

  async function openBillingPortal() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/billing-portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to open billing portal");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <SettingsCard title="Billing & Subscription" description="Manage your YardPilot plan, payment method, and billing history.">
      {!status ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">No active subscription found. Start a free trial to get access to YardPilot.</p>
          <a
            href="/start-trial"
            className="inline-flex items-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Start free trial
          </a>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Status badge */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${statusInfo?.color}`}>
              {statusInfo?.label}
            </span>
            {planLabel && (
              <span className="text-sm font-semibold text-slate-800">{planLabel}</span>
            )}
          </div>

          {/* Trial / renewal info */}
          {status === "trialing" && trialEnd && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Your free trial ends on <strong>{trialEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>. Your card will be charged automatically after that.
            </div>
          )}
          {status === "active" && periodEnd && (
            <p className="text-sm text-slate-600">
              Next billing date: <strong>{periodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>
            </p>
          )}
          {status === "past_due" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Your last payment failed. Please update your payment method to keep access.
            </div>
          )}
          {status === "canceled" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Your subscription has been cancelled. You can resubscribe at any time.
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={openBillingPortal}
            disabled={loading}
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? "Opening portal..." : "Manage billing & payment method"}
          </button>

          <p className="text-xs text-slate-400">
            You&apos;ll be redirected to Stripe&apos;s secure billing portal to update your card, change plans, or cancel.
          </p>
        </div>
      )}
    </SettingsCard>
  );
}
