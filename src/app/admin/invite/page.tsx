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
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-black px-6">
        <div className="text-center text-xs font-black uppercase tracking-widest text-stone-400">
          No invitation token mapped
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-black px-6">
        <div className="w-full max-w-md rounded-3xl border border-stone-200/50 bg-white p-8 text-center space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-stone-900">Welcome Aboard</h2>
          <p className="text-xs text-stone-400 font-semibold leading-relaxed">
            Your staff account has been successfully configured. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-black px-6">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
            Console Invitation
          </span>
          <h2 className="text-2xl font-black tracking-tight text-stone-900 dark:text-zinc-50">
            Complete Registration
          </h2>
          {name && (
            <p className="text-xs text-stone-400 font-semibold leading-relaxed">
              Hello {name}, establish a secure password to activate your access.
            </p>
          )}
        </div>

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
              disabled
              value={email}
              className="block w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-xs text-stone-400 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">
              Secure Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-stone-950 py-3.5 text-center text-xs font-bold text-white hover:bg-stone-850 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
          >
            {isPending ? "Configuring Access..." : "Accept Invitation"}
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
        <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-black px-6">
          <div className="text-center text-xs font-black uppercase tracking-widest text-stone-400 animate-pulse">
            Resolving invitation metadata...
          </div>
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
