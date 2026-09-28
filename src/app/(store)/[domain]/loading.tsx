export default function StorefrontLoading() {
  return (
    <div className="space-y-24 pb-32 animate-pulse">
      <div className="relative overflow-hidden bg-stone-100/60 py-32 dark:bg-zinc-900/30 border-b border-stone-200/30 dark:border-zinc-900/30">
        <div className="mx-auto max-w-5xl px-6 text-center space-y-4">
          <div className="mx-auto h-6 w-32 rounded-full bg-stone-200 dark:bg-zinc-800" />
          <div className="mx-auto h-12 w-96 max-w-full rounded-2xl bg-stone-200 dark:bg-zinc-800" />
          <div className="mx-auto h-4 w-72 rounded-xl bg-stone-200 dark:bg-zinc-800" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex items-center justify-between border-b border-stone-200/50 pb-6 dark:border-zinc-900/30">
          <div className="h-5 w-40 rounded-xl bg-stone-200 dark:bg-zinc-800" />
          <div className="h-4 w-16 rounded-xl bg-stone-200 dark:bg-zinc-800" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-y-16 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col rounded-3xl border border-stone-200/40 bg-white p-4 dark:border-zinc-900 dark:bg-zinc-950 space-y-4"
            >
              <div className="aspect-square w-full rounded-2xl bg-stone-100 dark:bg-zinc-900" />
              <div className="h-4 w-3/4 rounded-xl bg-stone-200 dark:bg-zinc-800" />
              <div className="h-3 w-1/2 rounded-xl bg-stone-200 dark:bg-zinc-800" />
              <div className="h-10 w-full rounded-full bg-stone-200 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
