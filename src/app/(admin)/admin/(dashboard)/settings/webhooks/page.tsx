import { db } from "@/lib/db";
import { workflowSettings } from "@/lib/db/schema/workflows";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { eq, and, like } from "drizzle-orm";
import { redirect } from "next/navigation";
import { WebhookManager } from "@/features/developer/components/webhook-manager";

export default async function WebhooksSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const tenantId = session.user.tenantId;

  const workflowsList = await db
    .select()
    .from(workflowSettings)
    .where(and(eq(workflowSettings.tenantId, tenantId), like(workflowSettings.id, "wf-webhook-%")));

  const mappedWebhooks = workflowsList.map((wf) => {
    const actionsList = wf.actions as { type: string; config: Record<string, string> }[];
    const webhookAction = actionsList.find((a) => a.type === "webhook");
    return {
      id: wf.id,
      triggerEvent: wf.triggerEvent,
      url: webhookAction?.config?.url || "",
    };
  });

  return (
    <div className="space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-50">
          Webhooks Configuration
        </h1>
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
          Configure and validate secure outbound payloads triggered by system execution metrics.
        </p>
      </div>
      <WebhookManager initialWebhooks={mappedWebhooks} />
    </div>
  );
}
