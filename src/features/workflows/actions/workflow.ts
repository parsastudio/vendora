"use server";

import "server-only";
import { db } from "@/lib/db";
import { workflowSettings } from "@/lib/db/schema/workflows";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function createWorkflow(triggerEvent: string, url: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;

  await db.insert(workflowSettings).values({
    id: `wf-${randomUUID()}`,
    tenantId,
    triggerEvent,
    actions: [{ type: "webhook", config: { url } }],
    isActive: "true",
  });

  revalidatePath("/admin/workflows");
  return { success: true };
}

export async function deleteWorkflow(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(workflowSettings)
    .where(and(eq(workflowSettings.id, id), eq(workflowSettings.tenantId, session.user.tenantId)));

  revalidatePath("/admin/workflows");
  return { success: true };
}

export async function toggleWorkflow(id: string, isActive: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  await db
    .update(workflowSettings)
    .set({ isActive, updatedAt: new Date() })
    .where(and(eq(workflowSettings.id, id), eq(workflowSettings.tenantId, session.user.tenantId)));

  revalidatePath("/admin/workflows");
  return { success: true };
}
