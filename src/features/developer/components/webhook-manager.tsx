"use client";

import { useState, useTransition } from "react";
import {
  saveWebhookWorkflow,
  deleteWebhookWorkflow,
  triggerMockWebhook,
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
  const [isPending, startTransition] = useTransition();

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
    setTestResult("Connecting and dispatching simulated JSON payload...");
    startTransition(async () => {
      try {
        const result = await triggerMockWebhook(url, event);
        if (result.success) {
          setTestResult(`SUCCESS: Webhook successfully accepted (Status: ${result.status})`);
        } else {
          setTestResult(`FAILURE: ${result.error || `Server responded with ${result.status}`}`);
        }
      } catch {
        setTestResult("CONNECTION FAILURE: Webhook target URL unreachable");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
          Configure Outbound Webhook
        </h3>
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Trigger Event Type
            </label>
            <select
              value={triggerEvent}
              onChange={(e) => setTriggerEvent(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="order.created">order.created</option>
              <option value="order.paid">order.paid</option>
              <option value="product.created">product.created</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              HTTPS Target Payload URL
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="url"
                required
                placeholder="https://your-server.com/webhooks/vendora"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="block flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 font-mono"
              />
              <button
                type="submit"
                disabled={isPending}
                className="rounded bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 h-9"
              >
                Register
              </button>
            </div>
          </div>
        </form>

        {testResult && (
          <div className="rounded-lg bg-zinc-50 border p-4 text-xs font-mono text-zinc-800 dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-300">
            {testResult}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
          Active Webhook Listeners
        </h3>
        {webhooks.length === 0 ? (
          <p className="text-xs text-zinc-400">
            No outbound webhook endpoints registered. Define one above.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-100 dark:border-zinc-900">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                    Event Trigger
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500 uppercase">
                    Target endpoint URL
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-zinc-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {webhooks.map((wh) => (
                  <tr key={wh.id}>
                    <td className="whitespace-nowrap px-4 py-2 text-xs font-bold text-zinc-950 dark:text-zinc-50 font-mono">
                      {wh.triggerEvent}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-xs font-mono text-zinc-500">
                      {wh.url}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right text-xs space-x-3">
                      <button
                        onClick={() => handleTest(wh.url, wh.triggerEvent)}
                        className="text-emerald-600 hover:underline font-bold"
                      >
                        Send Test Ping
                      </button>
                      <button
                        onClick={() => handleDelete(wh.id)}
                        className="text-red-600 hover:underline font-bold"
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
