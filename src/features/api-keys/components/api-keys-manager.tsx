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
    <div className="space-y-8">
      <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100">
          Create Private API Key
        </h3>
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-1.5">
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">
              Key Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Next.js storefront gateway"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto rounded-xl bg-stone-950 px-6 py-3 text-xs font-semibold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-950 h-11"
          >
            Generate Key
          </button>
        </form>

        {newSecret && (
          <div className="rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 p-5 space-y-3">
            <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
              Securely store this secret key. It will not be revealed again.
            </p>
            <div className="flex gap-2.5 items-center">
              <input
                type="text"
                readOnly
                value={newSecret}
                className="block flex-1 rounded-xl border border-emerald-300/30 bg-white px-4 py-3 text-xs font-mono select-all focus:outline-none dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-50"
              />
              <button
                onClick={() => navigator.clipboard.writeText(newSecret)}
                className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-stone-900 dark:text-zinc-100">
          Live API Keys
        </h3>
        {keys.length === 0 ? (
          <p className="text-xs text-stone-400 dark:text-zinc-500 font-semibold py-2">
            No active API keys mapped to this environment.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-stone-100 dark:border-zinc-900">
            <table className="min-w-full divide-y divide-stone-150 dark:divide-zinc-900">
              <thead className="bg-stone-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                    Preview
                  </th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-900/50 font-semibold text-xs">
                {keys.map((key) => (
                  <tr key={key.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-stone-950 dark:text-zinc-50">
                      {key.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-stone-450 dark:text-zinc-400">
                      {key.preview}...
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-stone-400 dark:text-zinc-500 font-mono">
                      {formatDateTime(key.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-black">
                      <button
                        onClick={() => handleRevoke(key.id)}
                        className="text-rose-600 hover:text-rose-700 font-bold"
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
