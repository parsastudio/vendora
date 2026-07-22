"use client";

import { useState, useTransition } from "react";
import { createStaffMember } from "@/features/staff/actions/staff";

interface Role {
  id: string;
  name: string;
}

interface AddStaffDialogProps {
  roles: Role[];
}

export function AddStaffDialog({ roles }: AddStaffDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id || "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await createStaffMember({ name, email, password, roleId });
        setIsOpen(false);
        setName("");
        setEmail("");
        setPassword("");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    });
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-xl bg-stone-950 px-6 py-3.5 text-xs font-bold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-955"
      >
        Add Teammate
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-stone-955/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-sm font-black uppercase tracking-widest text-stone-950 dark:text-zinc-50">
              Add Staff Member
            </h3>
            <p className="text-[10px] text-stone-400 mt-1 font-semibold">
              Create credentials and define console privileges.
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
                  Password
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

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-stone-100 px-6 py-2.5 text-xs font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-stone-950 px-6 py-2.5 text-xs font-bold text-white hover:bg-stone-850"
                >
                  {isPending ? "Adding..." : "Add Teammate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
