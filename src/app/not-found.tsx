import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-stone-50 px-6 py-32 text-center dark:bg-black min-h-screen">
      <div className="max-w-md space-y-6">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
          Error Index 404
        </span>
        <h1 className="text-4xl font-black tracking-tight text-stone-950 dark:text-zinc-50 sm:text-5xl">
          Lost in Space
        </h1>
        <p className="text-xs text-stone-450 dark:text-zinc-500 leading-relaxed font-semibold max-w-sm mx-auto">
          The requested storefront subdirectory or system path does not exist or has been relocated
          under a different tenant domain.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="rounded-full bg-stone-950 px-8 py-3.5 text-xs font-bold text-white hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-955"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
