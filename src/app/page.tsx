import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-zinc-900/50 dark:bg-black/80 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <span className="text-xs font-black tracking-widest text-zinc-950 dark:text-zinc-50 uppercase">
            VENDORA ENGINE
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="text-xs font-bold text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Sign In
            </Link>
            <Link
              href="/admin/register"
              className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Deploy Storefront
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
        <div className="max-w-3xl space-y-8">
          <span className="inline-flex items-center rounded-full bg-zinc-900/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:bg-zinc-50/10 dark:text-zinc-400">
            Next-Gen Headless Engine
          </span>
          <h1 className="text-5xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-7xl leading-none">
            The Multi-Tenant Commerce Architecture
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Orchestrate stunning storefronts, real-time inventory allocation, and automated event
            pipelines under a single unified database core.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/admin/register"
              className="w-full sm:w-auto rounded-full bg-zinc-950 px-8 py-4 text-xs font-bold text-white shadow-lg transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Create Your Merchant Instance
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto rounded-full bg-indigo-600 px-8 py-4 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700 dark:bg-indigo-500 dark:text-zinc-950 dark:hover:bg-indigo-400"
            >
              Visit Demo Storefront
            </Link>
            <Link
              href="/admin/login"
              className="w-full sm:w-auto rounded-full border border-zinc-200 bg-white px-8 py-4 text-xs font-bold text-zinc-950 shadow-sm transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Explore Demo Sandbox
            </Link>
          </div>
        </div>

        <section className="mx-auto max-w-7xl px-6 mt-32">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 text-left dark:border-zinc-900 dark:bg-zinc-950 space-y-2">
              <span className="text-lg">⚡</span>
              <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-50 uppercase tracking-wider">
                Symphony Router
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Dynamic subdomain rewrites and subdirectory fallbacks for local-first testing.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 text-left dark:border-zinc-900 dark:bg-zinc-950 space-y-2">
              <span className="text-lg">🤖</span>
              <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-50 uppercase tracking-wider">
                Fluxio Pipelines
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Trigger custom outbound webhooks and visual flowcharts on transaction events.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 text-left dark:border-zinc-900 dark:bg-zinc-950 space-y-2">
              <span className="text-lg">📦</span>
              <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-50 uppercase tracking-wider">
                Atomic Allocation
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Safe and race-condition free stock deduction across multiple global warehouse hubs.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-6 text-left dark:border-zinc-900 dark:bg-zinc-950 space-y-2">
              <span className="text-lg">🛡️</span>
              <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-50 uppercase tracking-wider">
                Account Security
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Enforce industry standard security settings with multi-factor TOTP authorization
                keys.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
