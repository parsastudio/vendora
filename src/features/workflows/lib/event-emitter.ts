import { EventEmitter } from "events";
import { db } from "@/lib/db";
import { workflowSettings } from "@/lib/db/schema/workflows";
import { eq, and } from "drizzle-orm";

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

      for (const flow of activeFlows) {
        for (const action of flow.actions) {
          if (action.type === "webhook") {
            await fetch(action.config.url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ event: triggerEvent, payload }),
            }).catch(() => {});
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
