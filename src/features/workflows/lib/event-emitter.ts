import "server-only";
import { EventEmitter } from "events";
import { db } from "@/lib/db";
import { workflowSettings, auditLogs } from "@/lib/db/schema/workflows";
import { eq, and } from "drizzle-orm";
import { createHash, createHmac, randomUUID } from "crypto";

export function getTenantSigningSecret(tenantId: string): string {
  const baseSecret = process.env.NEXT_PUBLIC_APP_URL || "vendora_prod_signing_secret_key_2026";
  return createHash("sha256")
    .update(tenantId + baseSecret)
    .digest("hex");
}

class WorkflowEventEmitter extends EventEmitter {
  async emitEvent(triggerEvent: string, tenantId: string, payload: Record<string, unknown>) {
    this.emit(triggerEvent, { tenantId, payload });

    try {
      const activeFlows = await db
        .select()
        .from(workflowSettings)
        .where(
          and(
            eq(workflowSettings.tenantId, tenantId),
            eq(workflowSettings.triggerEvent, triggerEvent),
            eq(workflowSettings.isActive, "true"),
          ),
        );

      const secret = getTenantSigningSecret(tenantId);
      const bodyString = JSON.stringify({ event: triggerEvent, payload });
      const signature = createHmac("sha256", secret).update(bodyString).digest("hex");

      for (const flow of activeFlows) {
        for (const action of flow.actions) {
          if (action.type === "webhook") {
            try {
              const res = await fetch(action.config.url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Vendora-Signature": `sha256=${signature}`,
                },
                body: bodyString,
              });

              await db.insert(auditLogs).values({
                id: `log-${randomUUID()}`,
                tenantId,
                userId: null,
                action: `webhook:${triggerEvent}`,
                details: {
                  status: [res.ok ? "success" : "failed"],
                  statusCode: [res.status.toString()],
                  url: [action.config.url],
                },
                ipAddress: "127.0.0.1",
              });
            } catch (err) {
              await db.insert(auditLogs).values({
                id: `log-${randomUUID()}`,
                tenantId,
                userId: null,
                action: `webhook:${triggerEvent}`,
                details: {
                  status: ["failed"],
                  error: [err instanceof Error ? err.message : "Network error"],
                  url: [action.config.url],
                },
                ipAddress: "127.0.0.1",
              });
            }
          }
        }
      }
    } catch {}
  }
}

const globalForEmitter = global as unknown as { emitter: WorkflowEventEmitter | undefined };

export const workflowEmitter = globalForEmitter.emitter ?? new WorkflowEventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForEmitter.emitter = workflowEmitter;
}
