"use client";

import { useState, useTransition } from "react";
import { createInvitation } from "@/features/staff/actions/invitation";

interface Role {
  id: string;
  name: string;
}

interface InviteStaffDialogProps {
  roles: Role[];
}

export function InviteStaffDialog({ roles }: InviteStaffDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id || "");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInviteLink(null);

    startTransition(async () => {
      try {
        const result = await createInvitation(email, name, roleId);
        if (result.success) {
          setInviteLink(result.link);
          setName("");
          setEmail("");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create invite.");
      }
    });
  };

  return (
    <div>
      <button
        onClick={() => {
          setIsOpen(true);
          setInviteLink(null);
          setError(null);
        }}
        className="rounded-xl bg-stone-950 px-6 py-3 text-xs font-bold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-955"
      >
        Invite Teammate
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-sm font-black uppercase tracking-widest text-stone-950 dark:text-zinc-50">
              Invite Staff Member
            </h3>
            <p className="text-[10px] text-stone-400 mt-1 font-semibold">
              Generate a temporary registration link to provision access.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-500/[0.04] p-3 text-[10px] font-bold text-rose-700">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

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

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Privilege Role
                </label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-stone-955 dark:text-zinc-50"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {inviteLink && (
                <div className="rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 p-4 space-y-2">
                  <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
                    Temporary invitation link generated (expires in 24h):
                  </p>
                  <div className="flex gap-2.5 items-center">
                    <input
                      type="text"
                      readOnly
                      value={inviteLink}
                      className="block w-full rounded-xl border border-emerald-300/30 bg-white px-4 py-2.5 text-[10px] font-mono select-all focus:outline-none dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-50"
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(inviteLink)}
                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-[10px] font-black text-white hover:bg-emerald-700 whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-stone-100 px-6 py-2.5 text-xs font-bold text-stone-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-stone-950 px-6 py-2.5 text-xs font-bold text-white hover:bg-stone-900"
                >
                  {isPending ? "Generating..." : "Generate Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
