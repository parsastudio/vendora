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
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
        Authenticated Access Tokens
      </h3>
      {sessions.length === 0 ? (
        <p className="text-xs text-zinc-400 py-6">No active sessions tracked.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-100 dark:border-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                  Device / User-Agent
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                  IP Address
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                  Authenticated At
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-zinc-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {sessions.map((s) => (
                <tr key={s.jti}>
                  <td className="px-4 py-2.5 font-medium text-zinc-950 dark:text-zinc-50 max-w-xs truncate">
                    {s.userAgent}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-zinc-505">{s.ip}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{formatDateTime(s.createdAt)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => handleRevoke(s.jti)}
                      disabled={isPending}
                      className="text-red-600 hover:underline font-bold disabled:opacity-50"
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
