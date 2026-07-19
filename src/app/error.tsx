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
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 text-center dark:bg-black">
      <div className="max-w-md">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Unexpected Error
        </h2>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          An unexpected error occurred while processing your request. Our team has been notified.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => reset()}
            className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
