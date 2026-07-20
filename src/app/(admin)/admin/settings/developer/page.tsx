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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Headless Engine &amp; Developer Hub
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Control developer keys, review real-time REST endpoint definitions, and run tests in
          Sandbox.
        </p>
      </div>

      <ApiKeysManager initialKeys={keysList} />

      <ApiSandbox apiKeysList={keysList} />

      <ApiDocs />
    </div>
  );
}
