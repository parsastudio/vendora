"use client";

import { useState } from "react";

export function ApiDocs() {
  const [selectedLang, setSelectedLang] = useState<"curl" | "javascript" | "python">("curl");

  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/products",
      desc: "Fetches all active products linked to the authenticated tenant store.",
      curl: `curl -X GET "https://api.vendora.com/api/v1/products" \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
      javascript: `fetch("https://api.vendora.com/api/v1/products", {\n  headers: {\n    "Authorization": "Bearer YOUR_API_KEY"\n  }\n})\n.then(res => res.json())\n.then(data => console.log(data));`,
      python: `import requests\n\nheaders = {\n    "Authorization": "Bearer YOUR_API_KEY"\n}\nres = requests.get("https://api.vendora.com/api/v1/products", headers=headers)\nprint(res.json())`,
    },
    {
      method: "GET",
      path: "/api/v1/categories",
      desc: "Retrieves the complete hierarchical category tree configured for your shop.",
      curl: `curl -X GET "https://api.vendora.com/api/v1/categories" \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
      javascript: `fetch("https://api.vendora.com/api/v1/categories", {\n  headers: {\n    "Authorization": "Bearer YOUR_API_KEY"\n  }\n})\n.then(res => res.json())\n.then(data => console.log(data));`,
      python: `import requests\n\nheaders = {\n    "Authorization": "Bearer YOUR_API_KEY"\n}\nres = requests.get("https://api.vendora.com/api/v1/categories", headers=headers)\nprint(res.json())`,
    },
  ];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
            Headless Endpoint Reference
          </h3>
          <p className="text-[10px] text-zinc-500">
            Quickly implement storefront templates using standard copyable code snippets.
          </p>
        </div>

        <div className="flex gap-1 bg-zinc-50 p-1 rounded-lg border dark:bg-zinc-900 dark:border-zinc-800">
          {(["curl", "javascript", "python"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase transition-all ${
                selectedLang === lang
                  ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {endpoints.map((ep, i) => (
          <div key={i} className="space-y-2 pb-6 border-b last:border-0 last:pb-0">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                {ep.method}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-950 dark:text-zinc-50">
                {ep.path}
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{ep.desc}</p>

            <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-[10px] text-zinc-300 font-mono select-all">
              {ep[selectedLang]}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
