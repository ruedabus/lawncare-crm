"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function MfaVerifyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Get the first enrolled TOTP factor
      const { data: factors, error: listError } =
        await supabase.auth.mfa.listFactors();

      if (listError) throw listError;

      const totpFactor = factors?.totp?.[0];
      if (!totpFactor) {
        throw new Error("No authenticator app found. Please contact support.");
      }

      // Challenge then verify in one call
      const { error: verifyError } =
        await supabase.auth.mfa.challengeAndVerify({
          factorId: totpFactor.id,
          code: code.replace(/\s/g, ""),
        });

      if (verifyError) throw verifyError;

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Verification failed"
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <svg
              className="h-7 w-7 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Two-Factor Verification
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Open your authenticator app and enter the 6-digit code.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          {/* Code input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Authentication Code
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

          {/* Error */}
          {errorMessage && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || code.replace(/\s/g, "").length < 6}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify & Sign In"}
          </button>

          {/* Back link */}
          <p className="text-center text-xs text-slate-400">
            Wrong account?{" "}
            <a
              href="/login"
              className="text-slate-600 underline underline-offset-2 hover:text-slate-900"
            >
              Sign out and try again
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
