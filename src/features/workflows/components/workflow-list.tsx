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
    <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100">
        Live Automation Schemes
      </h3>
      {workflows.length === 0 ? (
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-semibold py-4">
          No schematics registered in database.
        </p>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-zinc-900">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0 font-semibold"
            >
              <div className="space-y-1">
                <span className="inline-flex items-center rounded-lg bg-stone-50 border border-stone-200/50 px-2.5 py-1 text-[9px] font-black text-stone-800 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800 uppercase font-mono">
                  {wf.triggerEvent}
                </span>
                <p className="text-xs text-stone-400 dark:text-zinc-500">
                  Target pipeline action: {wf.actions.map((act) => act.type).join(", ")}
                </p>
              </div>
              <div>
                <button
                  onClick={() => handleToggle(wf.id, wf.isActive)}
                  disabled={isPending}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    wf.isActive === "true"
                      ? "bg-stone-950 text-white dark:bg-zinc-50 dark:text-zinc-955"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
