import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 text-center dark:bg-black">
      <div className="max-w-md">
        <span className="text-sm font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
          404 Page Not Found
        </span>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
          Lost in Space
        </h1>
        <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
          The resource or storefront domain you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
