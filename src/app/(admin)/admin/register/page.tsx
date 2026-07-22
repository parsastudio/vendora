"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminRegisterPage() {
  const [tenantName, setTenantName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName,
          subdomain,
          adminName,
          adminEmail,
          adminPassword,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error?.message || "Registration failed.");
      } else {
        router.push("/admin/login");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6 py-12 dark:bg-[#09090b]">
      <div className="w-full max-w-xl space-y-8 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-zinc-800/40 dark:bg-zinc-950">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
            Onboarding Wizard
          </span>
          <h2 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-50">
            Deploy Storefront
          </h2>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-500/[0.04] p-4 text-xs font-bold text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Organization Name
              </label>
              <input
                type="text"
                required
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Subdomain
              </label>
              <div className="flex rounded-xl shadow-none overflow-hidden border border-stone-200 dark:border-zinc-800">
                <input
                  type="text"
                  required
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  className="block w-full border-0 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:bg-zinc-900 dark:text-zinc-50 font-mono"
                />
                <span className="inline-flex items-center bg-stone-100 px-4 text-xs text-stone-400 font-bold border-l dark:bg-zinc-800 dark:border-zinc-700">
                  .vendora.com
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Owner Full Name
              </label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Secure Password
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full bg-stone-950 py-4 text-center text-xs font-bold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-950"
            >
              {isPending ? "Deploying Architecture..." : "Complete Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
