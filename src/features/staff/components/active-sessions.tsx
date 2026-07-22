"use client";

import { useState, useTransition } from "react";
import { revokeSession } from "@/features/staff/actions/sessions";
import { formatDateTime } from "@/features/shared/utils/format";

interface SessionItem {
  jti: string;
  userAgent: string;
  ip: string;
  createdAt: string;
}

interface ActiveSessionsListProps {
  initialSessions: SessionItem[];
}

export function ActiveSessionsList({ initialSessions }: ActiveSessionsListProps) {
  const [sessions, setSessions] = useState<SessionItem[]>(initialSessions);
  const [isPending, startTransition] = useTransition();

  const handleRevoke = (jti: string) => {
    startTransition(async () => {
      try {
        await revokeSession(jti);
        setSessions(sessions.filter((s) => s.jti !== jti));
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100">
        Console Tokens
      </h3>
      {sessions.length === 0 ? (
        <p className="text-xs text-stone-400 font-semibold py-4">No active sessions tracked.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-100 dark:border-zinc-900">
          <table className="min-w-full divide-y divide-stone-150 dark:divide-zinc-900">
            <thead className="bg-stone-50 dark:bg-zinc-900">
              <tr>
                <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Device / Agent
                </th>
                <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  IP address
                </th>
                <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Authorized At
                </th>
                <th className="px-6 py-4 text-right text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-900/50 font-semibold text-xs">
              {sessions.map((s) => (
                <tr key={s.jti}>
                  <td className="px-6 py-4 text-stone-950 dark:text-zinc-50 max-w-xs truncate font-bold">
                    {s.userAgent}
                  </td>
                  <td className="px-6 py-4 font-mono text-stone-450 dark:text-zinc-400">{s.ip}</td>
                  <td className="px-6 py-4 text-stone-400 dark:text-zinc-500 font-mono">
                    {formatDateTime(s.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRevoke(s.jti)}
                      disabled={isPending}
                      className="text-rose-600 hover:text-rose-700 font-bold disabled:opacity-50"
                    >
                      Revoke Session
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
