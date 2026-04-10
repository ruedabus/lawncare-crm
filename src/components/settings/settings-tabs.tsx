"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

type Settings = {
  business_name?: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  business_website?: string;
  service_city?: string;
  service_state?: string;
  service_lat?: number;
  service_lon?: number;
  notify_new_job?: boolean;
  notify_unpaid_invoice?: boolean;
  notify_upcoming_task?: boolean;
  notify_new_lead?: boolean;
};

type UserInfo = {
  id: string;
  email: string;
  name: string;
};

type Tab = "business" | "account" | "location" | "notifications";

const TABS: { id: Tab; label: string }[] = [
  { id: "business", label: "Business Profile" },
  { id: "account", label: "Account" },
  { id: "location", label: "Service Location" },
  { id: "notifications", label: "Notifications" },
];

export function SettingsTabs({
  user,
  settings: initialSettings,
}: {
  user: UserInfo;
  settings: Settings | null;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("business");
  const settings = initialSettings ?? {};

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
      {activeTab === "notifications" && (
        <NotificationsTab settings={settings} />
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

        <SaveRow status={status} errorMsg={errorMsg} />
      </form>
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
  const [form, setForm] = useState({
    service_city: settings.service_city ?? "Brooksville",
    service_state: settings.service_state ?? "FL",
    service_lat: settings.service_lat ?? 28.5553,
    service_lon: settings.service_lon ?? -82.3882,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error" | "geocoding">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function geocode() {
    if (!form.service_city || !form.service_state) return;
    setStatus("geocoding");
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          form.service_city + " " + form.service_state
        )}&count=1&language=en&format=json`
      );
      const data = await res.json();
      const result = data?.results?.[0];
      if (result) {
        setForm((f) => ({
          ...f,
          service_lat: parseFloat(result.latitude.toFixed(4)),
          service_lon: parseFloat(result.longitude.toFixed(4)),
        }));
        setStatus("idle");
      } else {
        setErrorMsg("City not found. Enter coordinates manually.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Geocode failed. Enter coordinates manually.");
      setStatus("error");
    }
  }

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
      title="Service Location"
      description="Used for weather on the dashboard and future route planning."
    >
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Field label="City">
              <input
                type="text"
                value={form.service_city}
                onChange={(e) => setForm({ ...form, service_city: e.target.value })}
                placeholder="Brooksville"
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="State">
            <input
              type="text"
              value={form.service_state}
              onChange={(e) => setForm({ ...form, service_state: e.target.value })}
              placeholder="FL"
              maxLength={2}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Field label="Latitude">
              <input
                type="number"
                step="0.0001"
                value={form.service_lat}
                onChange={(e) =>
                  setForm({ ...form, service_lat: parseFloat(e.target.value) })
                }
                className={inputCls}
              />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="Longitude">
              <input
                type="number"
                step="0.0001"
                value={form.service_lon}
                onChange={(e) =>
                  setForm({ ...form, service_lon: parseFloat(e.target.value) })
                }
                className={inputCls}
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={geocode}
            disabled={status === "geocoding"}
            className="mb-0.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            {status === "geocoding" ? "Looking up…" : "Auto-fill coords"}
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Type your city &amp; state, click "Auto-fill coords" to look them up automatically, then save.
        </p>

        <SaveRow
          status={status === "geocoding" ? "idle" : status}
          errorMsg={errorMsg}
        />
      </form>
    </SettingsCard>
  );
}

// ── Notifications ────────────────────────────────────────────────────────────

function NotificationsTab({ settings }: { settings: Settings }) {
  const [form, setForm] = useState({
    notify_new_job: settings.notify_new_job ?? true,
    notify_unpaid_invoice: settings.notify_unpaid_invoice ?? true,
    notify_upcoming_task: settings.notify_upcoming_task ?? true,
    notify_new_lead: settings.notify_new_lead ?? true,
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
        <SaveRow status={status} errorMsg={errorMsg} />
      </form>
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
