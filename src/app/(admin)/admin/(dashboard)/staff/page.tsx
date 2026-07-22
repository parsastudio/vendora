import { db } from "@/lib/db";
import { users, roles, usersToRoles } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { InviteStaffDialog } from "@/features/staff/components/invite-staff-dialog";
import { deleteStaffMember } from "@/features/staff/actions/staff";
import Link from "next/link";

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
    <div className="space-y-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-50">
            Console Staff
          </h1>
          <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
            Configure administrative permissions and monitor active console sessions.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/staff/sessions"
            className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-bold text-stone-700 shadow-sm hover:bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 h-11"
          >
            Manage Sessions
          </Link>
          <InviteStaffDialog roles={tenantRoles} />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-stone-200/40 bg-white dark:border-zinc-900/50 dark:bg-zinc-950">
        <table className="min-w-full divide-y divide-stone-150 dark:divide-zinc-900">
          <thead className="bg-stone-50 dark:bg-zinc-900">
            <tr>
              <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Name
              </th>
              <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Email Address
              </th>
              <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Console Role
              </th>
              <th className="px-6 py-4 text-right text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-zinc-900/50 font-semibold text-xs">
            {staffList.map((member) => (
              <tr key={member.id}>
                <td className="whitespace-nowrap px-6 py-5 text-stone-950 dark:text-zinc-50 font-black">
                  {member.name}
                </td>
                <td className="whitespace-nowrap px-6 py-5 text-stone-400 dark:text-zinc-500 font-mono">
                  {member.email}
                </td>
                <td className="whitespace-nowrap px-6 py-5">
                  <span className="inline-flex items-center rounded-lg bg-stone-50 border border-stone-200 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-stone-850 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-800">
                    {member.roleName || "No Role"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-5 text-right font-black">
                  {member.id !== session.user.id && (
                    <form action={handleDelete.bind(null, member.id)}>
                      <button type="submit" className="text-rose-600 hover:text-rose-700 font-bold">
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
