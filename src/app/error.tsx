"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function StorefrontError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const domain = (params?.domain as string) || "";

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-stone-50 px-6 py-32 text-center dark:bg-black min-h-[60vh]">
      <div className="max-w-md space-y-6">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-500">
          Storefront Interruption
        </span>
        <h2 className="text-3xl font-black tracking-tight text-stone-900 dark:text-zinc-50">
          Catalog Unavailable
        </h2>
        <p className="text-xs text-stone-400 dark:text-zinc-500 leading-relaxed font-semibold">
          We encountered an issue communicating with the catalog cluster. Please retry your request.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={() => reset()}
            className="rounded-full bg-stone-950 px-6 py-3 text-xs font-bold text-white hover:bg-stone-800 dark:bg-zinc-50 dark:text-zinc-950"
          >
            Retry Connection
          </button>
          <Link
            href={`/${domain}`}
            className="rounded-full border border-stone-200 bg-white px-6 py-3 text-xs font-bold text-stone-900 hover:bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          >
            Storefront Home
          </Link>
        </div>
      </div>
    </div>
  );
}
