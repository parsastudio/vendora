"use client";

import { useState, useTransition, useEffect } from "react";
import {
  saveWebhookWorkflow,
  deleteWebhookWorkflow,
  triggerMockWebhook,
  getWebhookSecret,
} from "@/features/developer/actions/webhooks";

interface WebhookItem {
  id: string;
  triggerEvent: string;
  url: string;
}

interface WebhookManagerProps {
  initialWebhooks: WebhookItem[];
}

export function WebhookManager({ initialWebhooks }: WebhookManagerProps) {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(initialWebhooks);
  const [triggerEvent, setTriggerEvent] = useState("order.paid");
  const [targetUrl, setTargetUrl] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [secret, setSecret] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getWebhookSecret()
      .then(setSecret)
      .catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;

    startTransition(async () => {
      try {
        await saveWebhookWorkflow(triggerEvent, targetUrl);
        const webhookId = `wf-webhook-${triggerEvent}`;
        const updated = webhooks.filter((w) => w.id !== webhookId);
        setWebhooks([...updated, { id: webhookId, triggerEvent, url: targetUrl }]);
        setTargetUrl("");
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteWebhookWorkflow(id);
        setWebhooks(webhooks.filter((w) => w.id !== id));
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleTest = (url: string, event: string) => {
    setTestResult("Dispatching authenticated JSON payload metadata to target url...");
    startTransition(async () => {
      try {
        const result = await triggerMockWebhook(url, event);
        if (result.success) {
          setTestResult(
            `PING SUCCESS: Payload correctly acknowledged by host (Status: ${result.status})`,
          );
        } else {
          setTestResult(
            `PING FAILURE: Remote host resolved with error (Status: ${result.error || result.status})`,
          );
        }
      } catch {
        setTestResult("NETWORK FAILURE: Unable to establish handshake with host path");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-stone-950 dark:text-zinc-50">
          Outbound Rules
        </h3>

        {secret && (
          <div className="rounded-2xl bg-stone-50 border border-stone-150 p-5 dark:bg-zinc-900 dark:border-zinc-800 space-y-3">
            <span className="text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
              Webhook HMAC Secret
            </span>
            <div className="flex gap-2.5 items-center">
              <input
                type="text"
                readOnly
                value={secret}
                className="block flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs font-mono select-all focus:outline-none dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(secret)}
                className="rounded-xl bg-stone-950 text-white dark:bg-zinc-50 dark:text-zinc-950 px-5 py-3 text-xs font-semibold"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 sm:grid-cols-3 items-end">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">
              Event Trigger
            </label>
            <select
              value={triggerEvent}
              onChange={(e) => setTriggerEvent(e.target.value)}
              className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="order.created">order.created</option>
              <option value="order.paid">order.paid</option>
              <option value="product.created">product.created</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">
              Destination endpoint
            </label>
            <div className="flex gap-2.5">
              <input
                type="url"
                required
                placeholder="https://your-server.com/hooks/vendora"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="block flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 font-mono"
              />
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-stone-950 px-6 py-3 text-xs font-semibold text-white hover:bg-stone-850"
              >
                Save
              </button>
            </div>
          </div>
        </form>

        {testResult && (
          <div className="rounded-2xl bg-[#09090b] border border-zinc-800/40 p-5 text-[10px] font-mono text-[#a1a1aa] leading-relaxed">
            {testResult}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-stone-950 dark:text-zinc-50">
          Configured Listeners
        </h3>
        {webhooks.length === 0 ? (
          <p className="text-xs text-stone-400 dark:text-zinc-500 font-semibold py-2">
            No outbound listeners registered to this environment.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-stone-100 dark:border-zinc-900">
            <table className="min-w-full divide-y divide-stone-150 dark:divide-zinc-900">
              <thead className="bg-stone-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                    Event trigger
                  </th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                    Destination url
                  </th>
                  <th className="px-6 py-4 text-right text-[9px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-900/50 font-semibold text-xs">
                {webhooks.map((wh) => (
                  <tr key={wh.id}>
                    <td className="whitespace-nowrap px-6 py-4 font-mono font-black text-stone-950 dark:text-zinc-50">
                      {wh.triggerEvent}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-stone-450 dark:text-zinc-400">
                      {wh.url}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-black space-x-4">
                      <button
                        onClick={() => handleTest(wh.url, wh.triggerEvent)}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => handleDelete(wh.id)}
                        className="text-rose-600 hover:text-rose-700 font-bold"
                      >
                        Remove
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
