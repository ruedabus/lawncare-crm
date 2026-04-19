import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { SignupRequestActions } from "../../../components/admin/signup-request-actions";
import { isAdminEmail } from "../../../lib/auth/admin";

type SignupRequest = {
  id: string;
  created_at: string;
  full_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  team_size: string | null;
  city: string | null;
  state: string | null;
  message: string | null;
  status: string;
  invited_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
};

function getStatusClasses(status: string) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "invited":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

export default async function SignupRequestsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  const { data, error } = await supabase
    .from("signup_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Signup Requests
          </h1>
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            Failed to load requests: {error.message}
          </div>
        </div>
      </div>
    );
  }

  const requests = (data ?? []) as SignupRequest[];

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Admin
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
            Signup Requests
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Review incoming trial requests and prepare invites.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total requests</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {requests.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {requests.filter((r) => r.status === "pending").length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Approved</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {requests.filter((r) => r.status === "approved").length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Rejected</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {requests.filter((r) => r.status === "rejected").length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">

              {/* HEADER */}
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-sm text-slate-600">
                  <th className="px-5 py-4 font-semibold">Created</th>
                  <th className="px-5 py-4 font-semibold">Contact</th>
                  <th className="px-5 py-4 font-semibold">Business</th>
                  <th className="px-5 py-4 font-semibold">Location</th>
                  <th className="px-5 py-4 font-semibold">Team Size</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                      No signup requests yet.
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="border-b border-slate-100 align-top">

                      {/* Created */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {new Date(request.created_at).toLocaleString()}
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {request.full_name}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {request.email}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {request.phone || "—"}
                        </div>

                        {request.message && (
                          <div className="mt-3 max-w-sm rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                            {request.message}
                          </div>
                        )}
                      </td>

                      {/* Business */}
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {request.company_name || "—"}
                      </td>

                      {/* Location */}
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {[request.city, request.state].filter(Boolean).join(", ") || "—"}
                      </td>

                      {/* Team Size */}
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {request.team_size || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusClasses(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4">
                        <SignupRequestActions
                          id={request.id}
                          status={request.status}
                        />
                      </td>

                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </div>
  );
}