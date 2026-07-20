"use client";

import { useState, useTransition } from "react";
import { generateApiKey, revokeApiKey } from "@/features/api-keys/actions/api-keys";
import { formatDateTime } from "@/features/shared/utils/format";

interface ApiKeyItem {
  id: string;
  name: string;
  preview: string;
  createdAt: Date;
}

interface ApiKeysManagerProps {
  initialKeys: ApiKeyItem[];
}

export function ApiKeysManager({ initialKeys }: ApiKeysManagerProps) {
  const [keys, setKeys] = useState<ApiKeyItem[]>(initialKeys);
  const [name, setName] = useState("");
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    startTransition(async () => {
      try {
        const result = await generateApiKey(name);
        if (result.success && result.secret) {
          setNewSecret(result.secret);
          setName("");
          window.location.reload();
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleRevoke = (id: string) => {
    startTransition(async () => {
      try {
        await revokeApiKey(id);
        setKeys(keys.filter((k) => k.id !== id));
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Create New API Key</h3>
        <form onSubmit={handleGenerate} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Key Identifier Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Next.js Headless Frontend"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 h-9"
          >
            Generate Token
          </button>
        </form>

        {newSecret && (
          <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800 space-y-2">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
              Copy your key now! It will not be shown again for security reasons.
            </p>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                readOnly
                value={newSecret}
                className="block w-full rounded border border-emerald-300 bg-white px-3 py-1.5 text-xs font-mono select-all focus:outline-none dark:bg-zinc-900 dark:border-zinc-850"
              />
              <button
                onClick={() => navigator.clipboard.writeText(newSecret)}
                className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Active Developer Keys</h3>
        {keys.length === 0 ? (
          <p className="text-xs text-zinc-400">
            No API keys registered yet. Generate one above to access headless APIs.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-100 dark:border-zinc-900">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                    Preview Prefix
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                    Created
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-zinc-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {keys.map((key) => (
                  <tr key={key.id}>
                    <td className="whitespace-nowrap px-4 py-2 text-xs font-semibold text-zinc-950 dark:text-zinc-50">
                      {key.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-xs font-mono text-zinc-500">
                      {key.preview}...
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-400">
                      {formatDateTime(key.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right text-xs">
                      <button
                        onClick={() => handleRevoke(key.id)}
                        className="text-red-600 hover:underline font-bold"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
