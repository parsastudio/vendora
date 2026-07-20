"use client";

import { useState, useTransition } from "react";
import { toggleWorkflow } from "@/features/workflows/actions/workflow";

interface Workflow {
  id: string;
  tenantId: string;
  triggerEvent: string;
  actions: {
    type: string;
    config: Record<string, string>;
  }[];
  isActive: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowListProps {
  tenantId: string;
  initialWorkflows: Workflow[];
}

export function WorkflowList({ initialWorkflows }: WorkflowListProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "true" ? "false" : "true";

    startTransition(async () => {
      try {
        await toggleWorkflow(id, nextStatus);
        setWorkflows(workflows.map((w) => (w.id === id ? { ...w, isActive: nextStatus } : w)));
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
      <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Active Automation Rules</h3>
      {workflows.length === 0 ? (
        <p className="text-xs text-zinc-400 py-6">No automated workflows configured yet.</p>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div className="space-y-1">
                <span className="inline-flex items-center rounded bg-zinc-100 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 uppercase font-mono">
                  {wf.triggerEvent}
                </span>
                <p className="text-xs text-zinc-500">
                  Actions: {wf.actions.map((act) => act.type).join(", ")}
                </p>
              </div>
              <div>
                <button
                  onClick={() => handleToggle(wf.id, wf.isActive)}
                  disabled={isPending}
                  className={`rounded px-3 py-1.5 text-xs font-semibold disabled:opacity-50 transition-colors ${
                    wf.isActive === "true"
                      ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                  }`}
                >
                  {wf.isActive === "true" ? "Active" : "Disabled"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
