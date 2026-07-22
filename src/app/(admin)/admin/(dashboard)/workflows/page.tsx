import { db } from "@/lib/db";
import { workflowSettings, auditLogs } from "@/lib/db/schema/workflows";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { WorkflowList } from "@/features/workflows/components/workflow-list";
import { deleteWorkflow } from "@/features/workflows/actions/workflow";
import { formatDateTime } from "@/features/shared/utils/format";
import Link from "next/link";

export default async function WorkflowsSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const tenantId = session.user.tenantId;

  const workflows = await db
    .select()
    .from(workflowSettings)
    .where(eq(workflowSettings.tenantId, tenantId));

  const historyLogs = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.tenantId, tenantId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(10);

  const handleDelete = async (id: string) => {
    "use server";
    await deleteWorkflow(id);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-50">
            Fluxio Automation
          </h1>
          <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
            Model real-time event-driven triggers and outbound backend pipelines visually.
          </p>
        </div>
        <Link
          href="/admin/workflows/create"
          className="rounded-xl bg-stone-950 px-6 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-955 dark:hover:bg-zinc-200"
        >
          Create Visual Flow
        </Link>
      </div>

      <WorkflowList tenantId={tenantId} initialWorkflows={workflows} />

      <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100 font-mono">
          Active Pipelines
        </h3>
        {workflows.length === 0 ? (
          <p className="text-xs text-stone-400 dark:text-zinc-500 font-semibold py-4">
            No active pipelines resolved.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-stone-100 dark:border-zinc-900">
            <table className="min-w-full divide-y divide-stone-150 dark:divide-zinc-900 text-xs">
              <thead className="bg-stone-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-6 py-4 text-left text-stone-400 dark:text-zinc-500 uppercase font-black text-[9px] tracking-widest">
                    Trigger Event
                  </th>
                  <th className="px-6 py-4 text-left text-stone-400 dark:text-zinc-500 uppercase font-black text-[9px] tracking-widest">
                    Destination Host
                  </th>
                  <th className="px-6 py-4 text-right text-stone-400 dark:text-zinc-500 uppercase font-black text-[9px] tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-900/50 font-semibold text-xs">
                {workflows.map((wf) => (
                  <tr key={wf.id}>
                    <td className="px-6 py-4 font-black font-mono text-stone-950 dark:text-zinc-55">
                      {wf.triggerEvent}
                    </td>
                    <td className="px-6 py-4 font-mono text-stone-400">
                      {wf.actions[0]?.config?.url || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={handleDelete.bind(null, wf.id)}>
                        <button
                          type="submit"
                          className="text-rose-600 hover:text-rose-700 font-bold"
                        >
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100 font-mono">
          Recent Execution Logs
        </h3>
        {historyLogs.length === 0 ? (
          <p className="text-xs text-stone-400 dark:text-zinc-500 font-semibold py-4">
            No recent executions recorded.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-stone-100 dark:border-zinc-900">
            <table className="min-w-full divide-y divide-stone-150 dark:divide-zinc-900 text-xs">
              <thead className="bg-stone-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-6 py-4 text-left text-stone-400 dark:text-zinc-500 uppercase font-black text-[9px] tracking-widest">
                    Context Event
                  </th>
                  <th className="px-6 py-4 text-left text-stone-400 dark:text-zinc-500 uppercase font-black text-[9px] tracking-widest">
                    Target endpoint
                  </th>
                  <th className="px-6 py-4 text-left text-stone-400 dark:text-zinc-500 uppercase font-black text-[9px] tracking-widest">
                    Status Code
                  </th>
                  <th className="px-6 py-4 text-right text-stone-400 dark:text-zinc-500 uppercase font-black text-[9px] tracking-widest">
                    Execution Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-900/50 font-mono text-[10px] font-semibold">
                {historyLogs.map((log) => {
                  const details = log.details as Record<string, string[]>;
                  const isSuccess = details?.status?.[0] === "success";
                  return (
                    <tr key={log.id}>
                      <td className="px-6 py-4 font-black text-stone-950 dark:text-zinc-100">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 text-stone-450 dark:text-zinc-400 truncate max-w-xs">
                        {details?.url?.[0] || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase ${
                            isSuccess
                              ? "bg-emerald-500/[0.06] text-emerald-600"
                              : "bg-rose-500/[0.06] text-rose-600"
                          }`}
                        >
                          {isSuccess ? "Success" : "Failed"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-stone-400">
                        {formatDateTime(log.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
