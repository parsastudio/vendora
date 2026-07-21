import { FlowBuilderClient } from "@/features/workflows/components/flow-builder-client";

export default function CreateWorkflowPage() {
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
      <FlowBuilderClient />
    </div>
  );
}
