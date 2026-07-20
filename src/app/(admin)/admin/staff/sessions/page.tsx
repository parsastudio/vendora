import { getActiveSessions } from "@/features/staff/actions/sessions";
import { ActiveSessionsList } from "@/features/staff/components/active-sessions";

export default async function ActiveSessionsPage() {
  const initialSessions = await getActiveSessions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Active Management Sessions
        </h1>
        <p className="text-xs text-zinc-500">
          Monitor and revoke active authenticated tokens for your user account.
        </p>
      </div>
      <ActiveSessionsList initialSessions={initialSessions} />
    </div>
  );
}
