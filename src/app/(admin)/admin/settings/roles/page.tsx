import { db } from "@/lib/db";
import { roles, rolesToPermissions, permissions } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";

export default async function RolesAccessPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const tenantId = session.user.tenantId;

  const rolesList = await db
    .select({
      id: roles.id,
      name: roles.name,
    })
    .from(roles)
    .where(eq(roles.tenantId, tenantId));

  const rolesWithPermissions = await Promise.all(
    rolesList.map(async (role) => {
      const perms = await db
        .select({
          action: permissions.action,
        })
        .from(rolesToPermissions)
        .innerJoin(permissions, eq(rolesToPermissions.permissionId, permissions.id))
        .where(eq(rolesToPermissions.roleId, role.id));

      return {
        ...role,
        permissions: perms.map((p) => p.action),
      };
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Roles &amp; Privileges
        </h1>
        <p className="text-xs text-zinc-500">View authorized organizational access mappings.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {rolesWithPermissions.map((role) => (
          <div
            key={role.id}
            className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">{role.name}</h3>
              <span className="text-[10px] text-zinc-400">ID: {role.id}</span>
            </div>
            <div className="mt-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Assigned Actions
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {role.permissions.length === 0 ? (
                  <span className="text-xs text-zinc-400">No explicit actions assigned.</span>
                ) : (
                  role.permissions.map((action) => (
                    <span
                      key={action}
                      className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                    >
                      {action}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
