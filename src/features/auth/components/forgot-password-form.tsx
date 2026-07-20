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
      <div className="rounded-lg bg-zinc-50 p-6 text-center border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Check Your Inbox</h3>
        <p className="mt-2 text-xs text-zinc-500">
          If an account with that email exists, we have generated a recovery link in our system
          console logs.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Email Address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-zinc-950 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        {isPending ? "Sending link..." : "Send Reset Link"}
      </button>
    </form>
  );
}
