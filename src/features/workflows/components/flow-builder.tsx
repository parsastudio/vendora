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
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Vendora Diagram Canvas
            </h3>
            <p className="text-[10px] text-zinc-505">
              Visually model triggers and map background endpoints.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={handleReset}
              className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              Reset Canvas
            </button>
            <input
              type="url"
              required
              placeholder="Webhook destination URL"
              value={webhookUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="rounded border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50"
            />
            <button
              onClick={handleSave}
              disabled={loading || !webhookUrl}
              className="rounded bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
            >
              {loading ? "Saving..." : "Deploy Flowchart"}
            </button>
          </div>
        </div>

        <div className="h-96 w-full border border-zinc-200 rounded-lg overflow-hidden dark:border-zinc-800">
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
