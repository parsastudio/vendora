"use server";

import "server-only";
import { db } from "@/lib/db";
import { workflowSettings } from "@/lib/db/schema/workflows";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { getTenantSigningSecret } from "@/features/workflows/lib/event-emitter";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createHmac, randomUUID } from "crypto";
import { withWriteProtection } from "@/features/shared/lib/write-protection";

export async function getWebhookSecret() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return getTenantSigningSecret(session.user.tenantId);
}

export const saveWebhookWorkflow = withWriteProtection(async function (
  triggerEvent: string,
  url: string,
) {
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
});

export const deleteWebhookWorkflow = withWriteProtection(async function (id: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(workflowSettings)
    .where(and(eq(workflowSettings.id, id), eq(workflowSettings.tenantId, session.user.tenantId)));

  revalidatePath("/admin/settings/developer");
  return { success: true };
});

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
      id: `mock-${randomUUID()}`,
      amount: "150.00",
      currency: "USD",
      status: "paid",
    },
  };

  const bodyString = JSON.stringify(mockPayload);
  const signature = createHmac("sha256", secret).update(bodyString).digest("hex");

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
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
