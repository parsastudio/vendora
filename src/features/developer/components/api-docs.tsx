"use client";

import { useState } from "react";

export function ApiDocs() {
  const [selectedLang, setSelectedLang] = useState<"curl" | "javascript" | "python">("curl");

  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/products",
      desc: "Resolves all active products linked to the authenticated tenant storefront.",
      curl: `curl -X GET "https://api.vendora.com/api/v1/products" \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
      javascript: `fetch("https://api.vendora.com/api/v1/products", {\n  headers: {\n    "Authorization": "Bearer YOUR_API_KEY"\n  }\n})\n.then(res => res.json())\n.then(data => console.log(data));`,
      python: `import requests\n\nheaders = {\n    "Authorization": "Bearer YOUR_API_KEY"\n}\nres = requests.get("https://api.vendora.com/api/v1/products", headers=headers)\nprint(res.json())`,
    },
    {
      method: "GET",
      path: "/api/v1/categories",
      desc: "Resolves the complete category metadata taxonomy for the current workspace.",
      curl: `curl -X GET "https://api.vendora.com/api/v1/categories" \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
      javascript: `fetch("https://api.vendora.com/api/v1/categories", {\n  headers: {\n    "Authorization": "Bearer YOUR_API_KEY"\n  }\n})\n.then(res => res.json())\n.then(data => console.log(data));`,
      python: `import requests\n\nheaders = {\n    "Authorization": "Bearer YOUR_API_KEY"\n}\nres = requests.get("https://api.vendora.com/api/v1/categories", headers=headers)\nprint(res.json())`,
    },
  ];

  return (
    <div className="rounded-3xl border border-stone-200/40 bg-white p-6 dark:border-zinc-900/50 dark:bg-zinc-950 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-stone-950 dark:text-zinc-50">
            Query Definitions
          </h3>
          <p className="text-[10px] text-stone-400 dark:text-zinc-500 font-semibold">
            Integrate custom storefronts with minimal localized configuration.
          </p>
        </div>

        <div className="flex gap-1.5 bg-stone-50 p-1.5 rounded-xl border border-stone-200/40 dark:bg-zinc-900 dark:border-zinc-800">
          {(["curl", "javascript", "python"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`rounded-lg px-4 py-2 text-[10px] font-black uppercase ${
                selectedLang === lang
                  ? "bg-stone-950 text-white dark:bg-zinc-50 dark:text-zinc-950"
                  : "text-stone-450 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8 divide-y divide-stone-100 dark:divide-zinc-900/50">
        {endpoints.map((ep, i) => (
          <div key={i} className="space-y-4 pt-8 first:pt-0">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-emerald-500/[0.06] border border-emerald-500/10 px-2 py-0.5 text-[9px] font-black text-emerald-600">
                {ep.method}
              </span>
              <span className="text-xs font-mono font-black text-stone-950 dark:text-zinc-50">
                {ep.path}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-zinc-400 font-medium">{ep.desc}</p>

            <pre className="overflow-x-auto rounded-2xl bg-[#09090b] border border-zinc-800/40 p-5 text-[10px] text-[#a1a1aa] font-mono select-all">
              {ep[selectedLang]}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
