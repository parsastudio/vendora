"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import { getInvitationDetails, acceptInvitation } from "@/features/staff/actions/invitation";
import { useRouter, useSearchParams } from "next/navigation";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!token) return;
    getInvitationDetails(token)
      .then((details) => {
        setEmail(details.email);
        setName(details.name);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Invalid invitation link.");
      });
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) return;

    startTransition(async () => {
      try {
        await acceptInvitation(token, password);
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/login");
        }, 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to accept invitation.");
      }
    });
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
        <div className="text-center text-sm text-zinc-500">No invitation token provided.</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 text-center space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Welcome Aboard!</h2>
          <p className="text-xs text-zinc-500">
            Your account was successfully registered. Redirecting to login portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Invitation Acceptance
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Complete Your Registration
          </h2>
          {name && (
            <p className="mt-1 text-xs text-zinc-500">
              Hi {name}, choose a password to join your organization workspace.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="mt-1 block w-full rounded-md border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Secure Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-zinc-950 py-2.5 text-center text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {isPending ? "Configuring Account..." : "Accept Invitation"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
          <div className="text-center text-sm text-zinc-500">Loading invitation...</div>
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
