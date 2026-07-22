import { getActiveSessions } from "@/features/staff/actions/sessions";
import { ActiveSessionsList } from "@/features/staff/components/active-sessions";

export default async function ActiveSessionsPage() {
  const initialSessions = await getActiveSessions();

  return (
    <div className="space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-50">
          Session Audits
        </h1>
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
          Monitor and revoke active authenticated tokens for your account.
        </p>
      </div>
      <ActiveSessionsList initialSessions={initialSessions} />
    </div>
  );
}
