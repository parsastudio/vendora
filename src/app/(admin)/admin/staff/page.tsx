import { db } from "@/lib/db";
import { users, roles, usersToRoles } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AddStaffDialog } from "@/components/admin/add-staff-dialog";
import { deleteStaffMember } from "@/lib/actions/staff";

export default async function StaffMembersPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const tenantId = session.user.tenantId;

  const staffList = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      roleName: roles.name,
    })
    .from(users)
    .leftJoin(usersToRoles, eq(users.id, usersToRoles.userId))
    .leftJoin(roles, eq(usersToRoles.roleId, roles.id))
    .where(eq(users.tenantId, tenantId));

  const tenantRoles = await db
    .select({
      id: roles.id,
      name: roles.name,
    })
    .from(roles)
    .where(eq(roles.tenantId, tenantId));

  const handleDelete = async (id: string) => {
    "use server";
    await deleteStaffMember(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Staff Members
          </h1>
          <p className="text-xs text-zinc-500">
            Configure roles and team permissions for administrative access.
          </p>
        </div>
        <AddStaffDialog roles={tenantRoles} />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {staffList.map((member) => (
              <tr key={member.id}>
                <td className="whitespace-nowrap px-6 py-4 text-xs font-semibold text-zinc-950 dark:text-zinc-50">
                  {member.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-xs text-zinc-500">
                  {member.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-xs">
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                    {member.roleName || "No Role"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-xs">
                  {member.id !== session.user.id && (
                    <form action={handleDelete.bind(null, member.id)}>
                      <button
                        type="submit"
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
