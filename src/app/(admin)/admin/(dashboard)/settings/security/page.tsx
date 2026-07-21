"use client";

import { useState, useTransition } from "react";
import {
  setupTwoFactor,
  activateTwoFactor,
  disableTwoFactor,
} from "@/features/auth/actions/two-factor";

export default function SecuritySettingsPage() {
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleStartSetup = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await setupTwoFactor();
        setSecret(result.secret);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start 2FA configuration");
      }
    });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!secret) return;

    startTransition(async () => {
      try {
        await activateTwoFactor(secret, token);
        setSuccess(true);
        setSecret(null);
        setToken("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid code entered");
      }
    });
  };

  const handleDisable = () => {
    setError(null);
    startTransition(async () => {
      try {
        await disableTwoFactor();
        setSuccess(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to disable 2FA");
      }
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Account Security &amp; Access Controls
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Add an extra layer of protection to your administrator credentials using authenticator
          tokens.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Two-Factor Authentication (2FA)
            </h3>
            <p className="text-xs text-zinc-500">
              Protect your administrative panels from unauthorized entries.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
              success
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900"
            }`}
          >
            {success ? "Active" : "Disabled"}
          </span>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        {!success && !secret && (
          <button
            onClick={handleStartSetup}
            disabled={isPending}
            className="rounded-md bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
          >
            {isPending ? "Generating..." : "Configure Authenticator Application"}
          </button>
        )}

        {secret && (
          <form
            onSubmit={handleVerify}
            className="rounded-lg bg-zinc-50 border p-6 dark:bg-zinc-900 dark:border-zinc-800 space-y-4"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">
                Step 1: Save Security Secret Hex
              </span>
              <input
                type="text"
                readOnly
                value={secret}
                className="block w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs font-mono select-all dark:bg-zinc-950 dark:border-zinc-800"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase">
                Step 2: Enter Verification Token
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs font-mono w-40 focus:outline-none dark:bg-zinc-950 dark:border-zinc-800"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded bg-zinc-950 px-4 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
                >
                  {isPending ? "Verifying..." : "Verify & Enable 2FA"}
                </button>
              </div>
            </div>
          </form>
        )}

        {success && (
          <button
            onClick={handleDisable}
            disabled={isPending}
            className="rounded-md border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-950/20"
          >
            {isPending ? "Disabling..." : "Disable Multi-Factor Authentication"}
          </button>
        )}
      </div>
    </div>
  );
}
