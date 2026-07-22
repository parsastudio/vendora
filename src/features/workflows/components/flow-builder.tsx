"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FlowNode } from "./flow-node";
import { useRouter } from "next/navigation";
import { createWorkflow } from "@/features/workflows/actions/workflow";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "custom",
    position: { x: 50, y: 150 },
    data: { label: "onOrderPaid", type: "trigger", description: "Triggered when order is paid" },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 350, y: 150 },
    data: { label: "webhook", type: "action", description: "Trigger third-party webhook URL" },
  },
];

const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

export function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [webhookUrl, setTargetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const nodeTypes = useMemo(() => ({ custom: FlowNode }), []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleReset = () => {
    setNodes(initialNodes);
  };

  const handleSave = async () => {
    if (!webhookUrl) return;
    setLoading(true);

    try {
      const res = await createWorkflow("order.paid", webhookUrl);
      if (res.success) {
        router.push("/admin/workflows");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100">
              Interactive Blueprint
            </h3>
            <p className="text-[10px] text-stone-400 dark:text-zinc-505 font-semibold">
              Drag endpoints, build pathways, and configure destination urls.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
            <button
              onClick={handleReset}
              className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              Reset Canvas
            </button>
            <input
              type="url"
              required
              placeholder="Webhook destination URL"
              value={webhookUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-stone-950 dark:text-zinc-50 font-mono w-full sm:w-64"
            />
            <button
              onClick={handleSave}
              disabled={loading || !webhookUrl}
              className="rounded-xl bg-stone-950 px-6 py-3 text-xs font-semibold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-955"
            >
              {loading ? "Deploying..." : "Deploy Schematic"}
            </button>
          </div>
        </div>

        <div className="h-[450px] w-full border border-stone-200/40 rounded-2xl overflow-hidden dark:border-zinc-900">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
