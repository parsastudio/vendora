import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema/tenants";
import { users, roles, permissions, rolesToPermissions, usersToRoles } from "@/lib/db/schema/users";
import { hashPassword } from "@/features/auth/lib/auth-utils";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantName, subdomain, adminName, adminEmail, adminPassword } = body;

    if (!tenantName || !subdomain || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Missing required fields" } },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(adminPassword);
    const tenantId = `tenant-${randomUUID()}`;
    const userId = `user-${randomUUID()}`;
    const roleId = `role-admin-${randomUUID()}`;

    await db.transaction(async (tx) => {
      await tx.insert(tenants).values({
        id: tenantId,
        name: tenantName,
        subdomain: subdomain,
        subscriptionStatus: "trial",
        themeSettings: {
          primaryColor: "#18181b",
          secondaryColor: "#f4f4f5",
          fontFamily: "Geist",
        },
      });

      await tx.insert(users).values({
        id: userId,
        tenantId: tenantId,
        name: adminName,
        email: adminEmail,
        passwordHash: passwordHash,
      });

      await tx.insert(roles).values({
        id: roleId,
        tenantId: tenantId,
        name: "Administrator",
      });

      const allPermissions = await tx.select().from(permissions);
      if (allPermissions.length > 0) {
        const rtpValues = allPermissions.map((p) => ({
          roleId: roleId,
          permissionId: p.id,
        }));
        await tx.insert(rolesToPermissions).values(rtpValues);
      }

      await tx.insert(usersToRoles).values({
        userId: userId,
        roleId: roleId,
      });
    });

    return NextResponse.json({ success: true, data: { tenantId, userId } });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Onboarding transaction failed" } },
      { status: 500 },
    );
  }
}
