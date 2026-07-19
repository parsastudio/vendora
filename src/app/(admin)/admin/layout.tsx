"use client";

import { type ReactNode } from "react";
import { useUIStore } from "@/features/shared/store/use-ui-store";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950",
          isSidebarOpen ? "w-64" : "w-16",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <span
            className={cn(
              "font-bold tracking-tight text-zinc-950 dark:text-zinc-50 transition-opacity duration-200",
              isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            VENDORA ADMIN
          </span>
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <span className="sr-only">Toggle Sidebar</span>
            <svg
              className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </aside>
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          isSidebarOpen ? "pl-64" : "pl-16",
        )}
      >
        <header className="flex h-16 items-center border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-1 items-center justify-between" />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
