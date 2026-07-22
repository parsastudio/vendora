"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-stone-50 px-6 py-32 text-center dark:bg-black min-h-screen">
      <div className="max-w-md space-y-6">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-500">
          System Aborted
        </span>
        <h2 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-50">
          Unexpected Error Resolved
        </h2>
        <p className="text-xs text-stone-400 dark:text-zinc-500 leading-relaxed font-semibold">
          An unmapped exception has occurred. Our diagnostic logs have collected the execution
          metrics.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={() => reset()}
            className="rounded-full bg-stone-950 px-6 py-3 text-xs font-bold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-955"
          >
            Reload Route
          </button>
          <Link
            href="/"
            className="rounded-full border border-stone-200 bg-white px-6 py-3 text-xs font-bold text-stone-950 hover:bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
