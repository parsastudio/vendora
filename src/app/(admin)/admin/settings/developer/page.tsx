import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema/api-keys";
import { workflowSettings } from "@/lib/db/schema/workflows";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { eq, and, like } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ApiKeysManager } from "@/features/api-keys/components/api-keys-manager";
import { ApiSandbox } from "@/features/developer/components/api-sandbox";
import { ApiDocs } from "@/features/developer/components/api-docs";
import { WebhookManager } from "@/features/developer/components/webhook-manager";

export default async function AdminDeveloperSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const tenantId = session.user.tenantId;

  const keysList = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      preview: apiKeys.preview,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.tenantId, tenantId));

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Headless Engine &amp; Developer Hub
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Control developer keys, review real-time REST endpoint definitions, run tests in Sandbox,
          and connect webhooks.
        </p>
      </div>

      <ApiKeysManager initialKeys={keysList} />

      <ApiSandbox apiKeysList={keysList} />

      <ApiDocs />

      <WebhookManager initialWebhooks={mappedWebhooks} />
    </div>
  );
}
