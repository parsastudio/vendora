import { FlowBuilderClient } from "@/features/workflows/components/flow-builder-client";

export default function CreateWorkflowPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-50">
          Workflows Canvas Builder
        </h1>
        <p className="text-xs text-stone-400 dark:text-zinc-500 font-medium">
          Model automated transactional pipelines visually on an interactive coordinate grid.
        </p>
      </div>
      <FlowBuilderClient />
    </div>
  );
}
