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
        className="rounded-md bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        Invite Teammate
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Invite Staff Member
            </h3>
            <p className="text-[10px] text-zinc-400">
              Generate a secure registration token to invite team members.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="rounded bg-red-50 p-2 text-[10px] text-red-600 dark:bg-red-950/25">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-zinc-500">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500">
                  Access Level Role
                </label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {inviteLink && (
                <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900 space-y-2">
                  <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                    Copy invitation link and send it to the teammate (expires in 24h):
                  </p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      readOnly
                      value={inviteLink}
                      className="block w-full rounded border border-emerald-300 bg-white px-3 py-1 text-[10px] font-mono select-all focus:outline-none dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-50"
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(inviteLink)}
                      className="rounded bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-emerald-700 whitespace-nowrap"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
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
