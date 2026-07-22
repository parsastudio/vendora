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
      className={`rounded-2xl border p-5 shadow-sm w-60 text-left transition-all ${
        isTrigger
          ? "bg-stone-950 border-stone-800 text-white dark:bg-zinc-50 dark:border-zinc-200 dark:text-zinc-950"
          : "bg-white border-stone-200/60 text-stone-950 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50"
      }`}
    >
      <span
        className={`text-[9px] font-black uppercase tracking-widest ${
          isTrigger ? "text-stone-400 dark:text-zinc-500" : "text-stone-500"
        }`}
      >
        {data.type} Node
      </span>
      <p className="text-xs font-bold mt-1.5 font-mono">{data.label}</p>
      {data.description && (
        <p className="text-[10px] text-stone-400 dark:text-zinc-505 font-medium mt-1 leading-normal">
          {data.description}
        </p>
      )}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-2.5 h-2.5 bg-stone-400 border border-white"
        />
      )}
      {isTrigger && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-2.5 h-2.5 bg-stone-950 dark:bg-zinc-100 border border-white"
        />
      )}
    </div>
  );
}
