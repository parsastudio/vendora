import { Handle, Position } from "@xyflow/react";

interface FlowNodeData {
  label: string;
  type: "trigger" | "action";
  description?: string;
}

export function FlowNode({ data }: { data: FlowNodeData }) {
  const isTrigger = data.type === "trigger";
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm w-56 text-left ${
        isTrigger
          ? "bg-zinc-900 border-zinc-800 text-white dark:bg-zinc-50 dark:border-zinc-200 dark:text-zinc-950"
          : "bg-white border-zinc-200 text-zinc-950 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
      }`}
    >
      <span
        className={`text-[9px] font-bold uppercase tracking-wider ${
          isTrigger ? "text-zinc-400 dark:text-zinc-505" : "text-zinc-500"
        }`}
      >
        {data.type} Node
      </span>
      <p className="text-xs font-bold mt-1">{data.label}</p>
      {data.description && <p className="text-[10px] text-zinc-400 mt-1">{data.description}</p>}
      {!isTrigger && (
        <Handle type="target" position={Position.Left} className="w-2 h-2 bg-zinc-400" />
      )}
      {isTrigger && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-2 h-2 bg-zinc-900 dark:bg-zinc-100"
        />
      )}
    </div>
  );
}
