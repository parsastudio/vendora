import Link from "next/link";
import { headers } from "next/headers";

export default async function Home() {
  const headerList = await headers();
  const host = headerList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const sandboxUrl = `${protocol}://demo.${host}`;

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#09090b]">
      <header className="border-b border-stone-200/40 bg-white/70 backdrop-blur-lg dark:border-zinc-800/40 dark:bg-black/70 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <span className="text-xs font-black tracking-[0.25em] text-stone-955 dark:text-zinc-50 uppercase">
            VENDORA
          </span>
          <div className="flex items-center gap-8">
            <Link
              href="/admin/login"
              className="text-xs font-semibold text-stone-500 hover:text-stone-955 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
            >
              Console Login
            </Link>
            <Link
              href="/admin/register"
              className="rounded-full bg-stone-955 px-6 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm"
            >
              Deploy Instance
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 sm:py-32">
        <div className="max-w-4xl text-center space-y-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-600 dark:text-zinc-400">
              Interactive Portfolio Sandbox
            </span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-stone-955 dark:text-zinc-50 sm:text-7xl leading-[1.05] max-w-3xl mx-auto">
            The multi-tenant headless engine.
          </h1>

          <p className="mx-auto max-w-xl text-sm sm:text-base text-stone-500 dark:text-zinc-400 leading-relaxed font-medium">
            Architected with offline-first atomic stock allocations and visual automated webhook
            pipelines under a unified PostgreSQL database.
          </p>

          <div className="rounded-3xl border border-stone-200/60 bg-white p-8 dark:border-zinc-900/50 dark:bg-zinc-950 text-left max-w-2xl mx-auto space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-500/[0.06] border border-emerald-500/10 px-3 py-1 rounded-lg">
                Recruiter Quick Launch Pad
              </span>
              <span className="text-xs font-mono font-bold text-stone-400">1-Click Access</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-stone-950 dark:text-zinc-50">
                Explore the Sandbox Instantly
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed font-semibold">
                To simplify your review process, a pre-generated tenant workspace has been
                established. You can instantly access the multi-tenant console populated with over
                650 mock customer orders, live retention charts, inventory systems, and
                signature-signed webhooks.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                href="/admin/login"
                className="w-full sm:w-auto rounded-xl bg-stone-950 px-6 py-3.5 text-xs font-bold text-white text-center hover:bg-stone-850 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-md"
              >
                Launch Admin Dashboard Demo
              </Link>
              <a
                href={sandboxUrl}
                className="w-full sm:w-auto rounded-xl border border-stone-200 bg-stone-50 px-6 py-3.5 text-xs font-bold text-stone-900 text-center hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Launch Storefront Sandbox
              </a>
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-7xl px-6 mt-36">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-stone-200/50 bg-white p-8 text-left dark:border-zinc-900 dark:bg-zinc-950 space-y-4 shadow-sm hover:border-stone-300 dark:hover:border-zinc-800 transition-colors">
              <span className="text-xl">⚡</span>
              <h3 className="text-xs font-bold text-stone-955 dark:text-zinc-50 uppercase tracking-widest">
                Symphony Router
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
                Clean isolated routing via subdomains or subdirectories with unified tenant context
                resolving.
              </p>
            </div>
            <div className="rounded-3xl border border-stone-200/50 bg-white p-8 text-left dark:border-zinc-900 dark:bg-zinc-950 space-y-4 shadow-sm hover:border-stone-300 dark:hover:border-zinc-800 transition-colors">
              <span className="text-xl">🤖</span>
              <h3 className="text-xs font-bold text-stone-955 dark:text-zinc-50 uppercase tracking-widest">
                Fluxio Automation
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
                Visually model custom transactional event pipelines with cryptographic signature
                authentication.
              </p>
            </div>
            <div className="rounded-3xl border border-stone-200/50 bg-white p-8 text-left dark:border-zinc-900/50 bg-white p-8 text-left dark:border-zinc-900 dark:bg-zinc-950 space-y-4 shadow-sm hover:border-stone-300 dark:hover:border-zinc-800 transition-colors">
              <span className="text-xl">📦</span>
              <h3 className="text-xs font-bold text-stone-955 dark:text-zinc-50 uppercase tracking-widest">
                Atomic Stock
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
                Prevent race conditions on flash sales with row-level database locking during
                checkouts.
              </p>
            </div>
            <div className="rounded-3xl border border-stone-200/50 bg-white p-8 text-left dark:border-zinc-900/50 bg-white p-8 text-left dark:border-zinc-900 dark:bg-zinc-950 space-y-4 shadow-sm hover:border-stone-300 dark:hover:border-zinc-800 transition-colors">
              <span className="text-xl">🛡️</span>
              <h3 className="text-xs font-bold text-stone-955 dark:text-zinc-50 uppercase tracking-widest">
                Hardened Security
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed">
                Protect administrator privileges with hardware-ready TOTP two-factor configuration
                panels.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
