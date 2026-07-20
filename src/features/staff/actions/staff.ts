"use server";

import "server-only";
import { db } from "@/lib/db";
import { users, usersToRoles } from "@/lib/db/schema/users";
import { hashPassword } from "@/features/auth/lib/auth-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { withWriteProtection } from "@/features/shared/lib/write-protection";

export const createStaffMember = withWriteProtection(async function (formData: {
  name: string;
  email: string;
  password: string;
  roleId: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.permissions.includes("settings:write")) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;
  const hashedPassword = await hashPassword(formData.password);
  const userId = `user-${randomUUID()}`;

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: userId,
      tenantId,
      name: formData.name,
      email: formData.email,
      passwordHash: hashedPassword,
    });

    await tx.insert(usersToRoles).values({
      userId,
      roleId: formData.roleId,
    });
  });

  revalidatePath("/admin/staff");
  return { success: true };
});

export const deleteStaffMember = withWriteProtection(async function (userId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.permissions.includes("settings:write")) {
    throw new Error("Unauthorized");
  }

  const tenantId = session.user.tenantId;

  await db.transaction(async (tx) => {
    const userCheck = await tx
      .select()
      .from(users)
      .where(and(eq(users.id, userId), eq(users.tenantId, tenantId)))
      .limit(1);

    if (userCheck.length === 0) {
      throw new Error("User not found");
    }

    await tx.delete(usersToRoles).where(eq(usersToRoles.userId, userId));
    await tx.delete(users).where(eq(users.id, userId));
  });

  revalidatePath("/admin/staff");
  return { success: true };
});
