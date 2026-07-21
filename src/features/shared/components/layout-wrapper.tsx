"use client";

import { ReactNode } from "react";
import { useUIStore } from "@/features/shared/store/use-ui-store";
import { AdminSidebar } from "./sidebar";
import { UserNav } from "@/features/auth/components/user-nav";

interface AdminLayoutWrapperProps {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function AdminLayoutWrapper({ children, user }: AdminLayoutWrapperProps) {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const isDemo = user.email === "demo@vendora.com";

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <AdminSidebar />
      <div
        className={`flex flex-1 flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isSidebarOpen ? "pl-64" : "pl-16"
        }`}
      >
        {isDemo && (
          <div className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-center border-b border-zinc-850 dark:border-zinc-200 flex items-center justify-center gap-2">
            <span>🛡️ Demo Sandbox Mode:</span>
            <span className="font-medium normal-case text-zinc-400 dark:text-zinc-500">
              You are exploring as Guest Admin. Write actions are sandboxed to preserve shared demo
              metrics.
            </span>
          </div>
        )}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200/50 bg-white/80 backdrop-blur-md px-6 dark:border-zinc-800/40 dark:bg-black/80">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Portal Management
          </span>
          <UserNav user={user} />
        </header>
        <main className="flex-1 p-6 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
