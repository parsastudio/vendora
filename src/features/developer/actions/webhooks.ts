"use server";

import { db } from "@/lib/db";
import { workflowSettings } from "@/lib/db/schema/workflows";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { getTenantSigningSecret } from "@/features/workflows/lib/event-emitter";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as nodeCrypto from "crypto";

export async function getWebhookSecret() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return getTenantSigningSecret(session.user.tenantId);
}

export async function saveWebhookWorkflow(triggerEvent: string, url: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;
  const id = `wf-webhook-${triggerEvent}`;

  const existing = await db
    .select()
    .from(workflowSettings)
    .where(and(eq(workflowSettings.id, id), eq(workflowSettings.tenantId, tenantId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(workflowSettings)
      .set({
        actions: [{ type: "webhook", config: { url } }],
        updatedAt: new Date(),
      })
      .where(eq(workflowSettings.id, id));
  } else {
    await db.insert(workflowSettings).values({
      id,
      tenantId,
      triggerEvent,
      actions: [{ type: "webhook", config: { url } }],
      isActive: "true",
    });
  }

  revalidatePath("/admin/settings/developer");
  return { success: true };
}

export async function deleteWebhookWorkflow(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(workflowSettings)
    .where(and(eq(workflowSettings.id, id), eq(workflowSettings.tenantId, session.user.tenantId)));

  revalidatePath("/admin/settings/developer");
  return { success: true };
}

export async function triggerMockWebhook(url: string, triggerEvent: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const secret = getTenantSigningSecret(session.user.tenantId);

  const mockPayload = {
    event: triggerEvent,
    timestamp: new Date().toISOString(),
    tenantId: session.user.tenantId,
    data: {
      id: `mock-${Date.now()}`,
      amount: "150.00",
      currency: "USD",
      status: "paid",
    },
  };

  const bodyString = JSON.stringify(mockPayload);
  const signature = nodeCrypto.createHmac("sha256", secret).update(bodyString).digest("hex");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Vendora-Signature": `sha256=${signature}`,
      },
      body: bodyString,
    });

    return {
      success: res.ok,
      status: res.status,
      statusText: res.statusText,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}
