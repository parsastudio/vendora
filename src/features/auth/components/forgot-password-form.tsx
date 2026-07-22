"use client";

import { useState, useTransition } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const result = await res.json();
        if (result.success) {
          setSuccess(true);
        } else {
          setError(result.error || "Failed to submit request.");
        }
      } catch {
        setError("A network error occurred. Please try again.");
      }
    });
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center dark:bg-zinc-950 dark:border-zinc-800 space-y-1">
        <h3 className="text-xs font-black uppercase tracking-widest text-stone-950 dark:text-zinc-50">
          Check Your Inbox
        </h3>
        <p className="text-[11px] text-stone-400 font-semibold leading-relaxed">
          If an account exists with the provided address, a recovery URL has been generated in our
          system logs.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-500/[0.04] p-4 text-xs font-bold text-rose-700">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">
          Email Address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-stone-950 py-3.5 text-xs font-bold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-950"
      >
        {isPending ? "Sending parameters..." : "Send Recovery Link"}
      </button>
    </form>
  );
}
