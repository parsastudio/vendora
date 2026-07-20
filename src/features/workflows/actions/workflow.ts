"use server";

import { db } from "@/lib/db";
import { workflowSettings } from "@/lib/db/schema/workflows";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
