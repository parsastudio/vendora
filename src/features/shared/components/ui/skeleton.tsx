import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-stone-200/60 dark:bg-zinc-900", className)}
      {...props}
    />
  );
}
