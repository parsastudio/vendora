import { db } from "@/lib/db";
import { workflowSettings } from "@/lib/db/schema/workflows";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { WorkflowList } from "@/features/workflows/components/workflow-list";

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

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Fluxio Automated Workflows
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage triggered events and backend automation protocols for your storefront.
        </p>
      </div>
      <WorkflowList tenantId={tenantId} initialWorkflows={workflows} />
    </div>
  );
}
