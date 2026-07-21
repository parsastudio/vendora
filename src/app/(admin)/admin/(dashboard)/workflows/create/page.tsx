import { FlowBuilder } from "@/features/workflows/components/flow-builder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";

export default async function CreateWorkflowPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Visual Flowchart Builder
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Model responsive, real-time trigger pipelines on an interactive canvas.
        </p>
      </div>
      <FlowBuilder />
    </div>
  );
}
