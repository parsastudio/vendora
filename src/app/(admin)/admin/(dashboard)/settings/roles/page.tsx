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
    <div className="space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-55">
          Roles &amp; Privileges
        </h1>
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
          View and audit assigned organizational role-based access control mappings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {rolesWithPermissions.map((role) => (
          <div
            key={role.id}
            className="rounded-3xl border border-stone-200/40 bg-white p-8 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-900/50 pb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-50">
                {role.name}
              </h3>
              <span className="text-[9px] font-mono font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                ID: {role.id}
              </span>
            </div>
            <div className="space-y-3">
              <span className="text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Assigned Permissions
              </span>
              <div className="flex flex-wrap gap-2">
                {role.permissions.length === 0 ? (
                  <span className="text-xs text-stone-400 font-semibold py-1">
                    No explicit permissions mapped.
                  </span>
                ) : (
                  role.permissions.map((action) => (
                    <span
                      key={action}
                      className="rounded-lg bg-stone-50 border border-stone-150 px-3 py-1.5 text-[10px] font-bold text-stone-800 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800"
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
