import { db } from "@/lib/db";
import { workflowSettings } from "@/lib/db/schema/workflows";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { WorkflowList } from "@/features/workflows/components/workflow-list";
import Link from "next/link";
import { deleteWorkflow } from "@/features/workflows/actions/workflow";

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

  const handleDelete = async (id: string) => {
    "use server";
    await deleteWorkflow(id);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Fluxio Automated Workflows
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage triggered events and backend automation protocols for your storefront.
          </p>
        </div>
        <Link
          href="/admin/workflows/create"
          className="rounded-md bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Create Visual Flow
        </Link>
      </div>

      <WorkflowList tenantId={tenantId} initialWorkflows={workflows} />

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 font-mono">
          Current Active Pipelines
        </h3>
        {workflows.length === 0 ? (
          <p className="text-xs text-zinc-400">
            No pipelines registered. Click &quot;Create Visual Flow&quot; to build one.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-100 dark:border-zinc-900">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-2 text-left text-zinc-500 uppercase">Trigger</th>
                  <th className="px-4 py-2 text-left text-zinc-500 uppercase">Endpoint</th>
                  <th className="px-4 py-2 text-right text-zinc-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {workflows.map((wf) => (
                  <tr key={wf.id}>
                    <td className="px-4 py-2.5 font-bold font-mono uppercase">{wf.triggerEvent}</td>
                    <td className="px-4 py-2.5 font-mono text-zinc-500">
                      {wf.actions[0]?.config?.url || "N/A"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <form action={handleDelete.bind(null, wf.id)}>
                        <button type="submit" className="text-red-600 hover:underline font-bold">
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
    </div>
  );
}
