import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema/api-keys";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ApiKeysManager } from "@/features/api-keys/components/api-keys-manager";

export default async function ApiKeysSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const tenantId = session.user.tenantId;

  const keysList = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      preview: apiKeys.preview,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.tenantId, tenantId));

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-stone-950 dark:text-zinc-50">
          Developer API Access
        </h1>
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
          Generate secure tokens to interface with your headless storefront.
        </p>
      </div>
      <ApiKeysManager initialKeys={keysList} />
    </div>
  );
}
