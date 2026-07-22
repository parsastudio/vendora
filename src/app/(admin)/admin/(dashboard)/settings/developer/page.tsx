import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema/api-keys";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ApiKeysManager } from "@/features/api-keys/components/api-keys-manager";
import { ApiSandbox } from "@/features/developer/components/api-sandbox";
import { ApiDocs } from "@/features/developer/components/api-docs";

export default async function AdminDeveloperSettingsPage() {
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
    <div className="space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-50">
          Developer Hub
        </h1>
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
          Control developer keys, review restful definitions, and execute active sandbox procedures.
        </p>
      </div>

      <ApiKeysManager initialKeys={keysList} />

      <ApiSandbox apiKeysList={keysList} />

      <ApiDocs />
    </div>
  );
}
