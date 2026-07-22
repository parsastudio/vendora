"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6 py-32 text-center dark:bg-black font-sans antialiased">
        <div className="max-w-md space-y-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-600">
            Runtime Aborted
          </span>
          <h2 className="text-3xl font-black tracking-tight text-stone-955 dark:text-zinc-50">
            Critical Failure Blocked
          </h2>
          <p className="text-xs text-stone-400 dark:text-zinc-500 leading-relaxed font-semibold">
            A root level execution breakdown has been intercepted. Restarting the application
            instance is required.
          </p>
          <div className="pt-4">
            <button
              onClick={() => reset()}
              className="rounded-full bg-stone-950 px-8 py-3.5 text-xs font-bold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-955"
            >
              Restart Environment
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
