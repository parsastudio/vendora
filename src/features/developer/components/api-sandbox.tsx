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
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">API Developer Sandbox</h3>
        <p className="text-[10px] text-zinc-500">
          Simulate frontend headless fetch triggers and inspect live REST API JSON payloads.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-[10px] font-bold text-zinc-500">
            1. Select Target Endpoint
          </label>
          <select
            value={selectedPath}
            onChange={(e) => setSelectedPath(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="/api/v1/products">GET /api/v1/products (Products List)</option>
            <option value="/api/v1/categories">GET /api/v1/categories (Categories Tree)</option>
            <option value="/api/tenant">GET /api/tenant (Active Tenant Data)</option>
          </select>
          {apiKeysList.length > 0 && (
            <span className="text-[9px] text-zinc-400 mt-1 block">
              Reference Active Keys: {apiKeysList.map((k) => k.name).join(", ")}
            </span>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-zinc-500">
            2. Input Live Token (vk_live_...)
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="password"
              placeholder="Paste your generated API key secret"
              value={typedKey}
              onChange={(e) => setTypedKey(e.target.value)}
              className="block flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 font-mono"
            />
            <button
              onClick={handleExecute}
              disabled={loading || !typedKey}
              className="rounded bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 h-8"
            >
              {loading ? "Sending..." : "Execute Request"}
            </button>
          </div>
        </div>
      </div>

      {responseStatus !== null && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Response Status:</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                responseStatus >= 200 && responseStatus < 300
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                  : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
              }`}
            >
              {responseStatus}
            </span>
          </div>

          <pre className="max-h-72 overflow-y-auto rounded-lg bg-zinc-950 p-4 text-[10px] text-zinc-300 font-mono select-all">
            {responseBody}
          </pre>
        </div>
      )}
    </div>
  );
}
