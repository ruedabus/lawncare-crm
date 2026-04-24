"use client";

import { useState, useEffect, useCallback } from "react";

type TeamRole = "admin" | "dispatcher" | "technician";

type TeamMember = {
  id: string;
  email: string;
  name: string | null;
  role: TeamRole;
  status: "pending" | "active";
  invited_at: string;
  accepted_at: string | null;
};

const ROLE_LABELS: Record<TeamRole, string> = {
  admin: "Admin",
  dispatcher: "Dispatcher",
  technician: "Technician",
};

const ROLE_COLORS: Record<TeamRole, string> = {
  admin: "bg-purple-100 text-purple-700",
  dispatcher: "bg-blue-100 text-blue-700",
  technician: "bg-green-100 text-green-700",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
};

export function TeamTab() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("dispatcher");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    const res = await fetch("/api/team");
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError(null);
    setInviteSuccess(false);

    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, name: inviteName, role: inviteRole }),
    });

    const data = await res.json();
    if (res.ok) {
      setInviteSuccess(true);
      setInviteEmail("");
      setInviteName("");
      fetchMembers();
      setTimeout(() => setInviteSuccess(false), 4000);
    } else {
      setInviteError(data.error ?? "Failed to invite member.");
    }
    setInviting(false);
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this team member? They will lose access immediately.")) return;
    setRemovingId(id);
    await fetch(`/api/team/${id}`, { method: "DELETE" });
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setRemovingId(null);
  }

  async function handleRoleChange(id: string, role: TeamRole) {
    await fetch(`/api/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, role } : m));
  }

  return (
    <div className="space-y-8">
      {/* Invite form */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-neutral-900">Invite a team member</h2>
        <p className="mb-5 text-sm text-neutral-500">
          Team members can log in with their own account and access your CRM data.
          Admins have full access except billing. Dispatchers can manage jobs and schedule.
          Technicians can view and update their assigned jobs.
        </p>

        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Name (optional)</label>
              <input
                type="text"
                placeholder="Jane Smith"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email address *</label>
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Role</label>
            <div className="grid grid-cols-3 gap-3">
              {(["admin", "dispatcher", "technician"] as TeamRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setInviteRole(role)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                    inviteRole === role
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  <div className="font-semibold">{ROLE_LABELS[role]}</div>
                  <div className="mt-0.5 text-xs text-neutral-500">
                    {role === "admin" && "Full access except billing"}
                    {role === "dispatcher" && "Jobs, schedule, customers"}
                    {role === "technician" && "Assigned jobs only"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {inviteError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {inviteError}
            </p>
          )}
          {inviteSuccess && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
              Invite sent! They&apos;ll receive an email with a link to set up their account.
            </p>
          )}

          <button
            type="submit"
            disabled={inviting || !inviteEmail}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {inviting ? "Sending invite…" : "Send Invite"}
          </button>
        </form>
      </div>

      {/* Member list */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-neutral-900">Team members</h2>

        {loading ? (
          <p className="text-sm text-neutral-400">Loading…</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-neutral-500">No team members yet. Invite someone above.</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-neutral-900">
                      {member.name || member.email}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[member.role]}`}>
                      {ROLE_LABELS[member.role]}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${member.accepted_at ? STATUS_COLORS["active"] : STATUS_COLORS["pending"]}`}>
                      {member.accepted_at ? "Active" : "Invite pending"}
                    </span>
                  </div>
                  {member.name && (
                    <p className="mt-0.5 text-xs text-neutral-500">{member.email}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                    className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs text-neutral-700 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="technician">Technician</option>
                  </select>

                  <button
                    onClick={() => handleRemove(member.id)}
                    disabled={removingId === member.id}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
