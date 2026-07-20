"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const result = await res.json();
        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            router.push("/admin/login");
          }, 3000);
        } else {
          setError(result.error || "Reset password request failed.");
        }
      } catch {
        setError("A network error occurred. Please try again.");
      }
    });
  };

  if (success) {
    return (
      <div className="rounded-lg bg-zinc-50 p-6 text-center border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Password Restored</h3>
        <p className="mt-2 text-xs text-zinc-500">
          Your password has been successfully reset. Redirecting to login...
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
          New Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Confirm New Password
        </label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-zinc-950 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        {isPending ? "Restoring..." : "Restore Password"}
      </button>
    </form>
  );
}
