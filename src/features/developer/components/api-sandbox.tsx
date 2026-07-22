"use client";

import { useState } from "react";

interface ApiKeyItem {
  id: string;
  name: string;
  preview: string;
}

interface ApiSandboxProps {
  apiKeysList: ApiKeyItem[];
}

export function ApiSandbox({ apiKeysList }: ApiSandboxProps) {
  const [selectedPath, setSelectedPath] = useState("/api/v1/products");
  const [typedKey, setTypedKey] = useState("");
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    if (!typedKey) return;
    setLoading(true);
    setResponseStatus(null);
    setResponseBody(null);

    try {
      const res = await fetch("/api/admin/developer/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: selectedPath, apiKey: typedKey }),
      });
      const data = (await res.json()) as { status: number; data: Record<string, unknown> };

      setResponseStatus(data.status);
      setResponseBody(JSON.stringify(data.data, null, 2));
    } catch {
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: "Failed to connect to backend proxy" }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
      <div className="space-y-1">
        <h3 className="text-sm font-black uppercase tracking-widest text-stone-950 dark:text-zinc-50">
          API Terminal Sandbox
        </h3>
        <p className="text-[10px] text-stone-400 dark:text-zinc-500 font-semibold">
          Simulate queries and review output payloads inside an isolated environment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">
            Select Endpoint
          </label>
          <select
            value={selectedPath}
            onChange={(e) => setSelectedPath(e.target.value)}
            className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="/api/v1/products">GET /api/v1/products</option>
            <option value="/api/v1/categories">GET /api/v1/categories</option>
            <option value="/api/tenant">GET /api/tenant</option>
          </select>
          {apiKeysList.length > 0 && (
            <span className="text-[9px] text-stone-400 mt-1.5 block font-semibold leading-relaxed">
              Mappable Keys: {apiKeysList.map((k) => k.name).join(", ")}
            </span>
          )}
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">
            Active Token Reference (vk_live_...)
          </label>
          <div className="flex gap-2.5">
            <input
              type="password"
              placeholder="Paste generated secret key"
              value={typedKey}
              onChange={(e) => setTypedKey(e.target.value)}
              className="block flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 font-mono"
            />
            <button
              onClick={handleExecute}
              disabled={loading || !typedKey}
              className="rounded-xl bg-stone-950 px-6 py-3 text-xs font-semibold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-950"
            >
              {loading ? "Sending..." : "Execute Query"}
            </button>
          </div>
        </div>
      </div>

      {responseStatus !== null && (
        <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-zinc-900/50">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
              Status Code:
            </span>
            <span
              className={`rounded-lg px-2 py-0.5 text-[10px] font-mono font-bold ${
                responseStatus >= 200 && responseStatus < 300
                  ? "bg-emerald-500/[0.06] text-emerald-600 border border-emerald-500/10"
                  : "bg-rose-500/[0.06] text-rose-600 border border-rose-500/10"
              }`}
            >
              {responseStatus}
            </span>
          </div>

          <pre className="max-h-72 overflow-y-auto rounded-2xl bg-[#09090b] border border-zinc-800/40 p-5 text-[10px] text-[#a1a1aa] font-mono select-all">
            {responseBody}
          </pre>
        </div>
      )}
    </div>
  );
}
