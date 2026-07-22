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
    <div className="space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-55">
          Account Security
        </h1>
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
          Add an extra layer of protection to your console credentials using authenticator tokens.
        </p>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-8 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-8">
        <div className="flex items-center justify-between border-b border-stone-150 pb-6 dark:border-zinc-900/50">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100">
              Two-Factor Authentication (2FA)
            </h3>
            <p className="text-xs text-stone-400 dark:text-zinc-500 font-semibold">
              Protect your administrative panels from unauthorized entries.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${
              success
                ? "bg-emerald-500/[0.06] text-emerald-700 border border-emerald-500/10"
                : "bg-stone-50 text-stone-500 border dark:bg-zinc-900"
            }`}
          >
            {success ? "Active" : "Disabled"}
          </span>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-500/[0.04] p-4 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        {!success && !secret && (
          <button
            onClick={handleStartSetup}
            disabled={isPending}
            className="rounded-xl bg-stone-955 px-6 py-3 text-xs font-semibold text-white hover:bg-stone-850 h-11"
          >
            {isPending ? "Generating..." : "Configure Authenticator App"}
          </button>
        )}

        {secret && (
          <form
            onSubmit={handleVerify}
            className="rounded-2xl bg-stone-50 border p-6 dark:bg-zinc-900 dark:border-zinc-800 space-y-6"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Step 1: Save Security Secret Hex
              </span>
              <input
                type="text"
                readOnly
                value={secret}
                className="block w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs font-mono select-all focus:outline-none dark:bg-zinc-950 dark:border-zinc-850"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Step 2: Enter Verification Token
              </label>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs font-mono w-44 focus:outline-none dark:bg-zinc-950 dark:border-zinc-850"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-stone-950 px-6 py-3 text-xs font-semibold text-white hover:bg-stone-850"
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
            className="rounded-xl border border-rose-200 px-6 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-100/50"
          >
            {isPending ? "Disabling..." : "Disable 2FA Security"}
          </button>
        )}
      </div>
    </div>
  );
}
