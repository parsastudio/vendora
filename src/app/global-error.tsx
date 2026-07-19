"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-24 text-center dark:bg-black">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Critical Failure
          </h2>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            A critical system failure occurred. Please reload the application.
          </p>
          <div className="mt-8">
            <button
              onClick={() => reset()}
              className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
