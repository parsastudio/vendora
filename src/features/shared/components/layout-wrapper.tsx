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
        className={`flex flex-1 flex-col transition-all duration-300 ${
          isSidebarOpen ? "pl-64" : "pl-16"
        }`}
      >
        {isDemo && (
          <div className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-center border-b border-zinc-850 dark:border-zinc-200 flex items-center justify-center gap-2">
            <span>🛡️ Demo Sandbox Mode:</span>
            <span className="font-medium normal-case text-zinc-300 dark:text-zinc-600">
              You are exploring as Guest Admin. Write actions are sandboxed to preserve shared demo
              metrics.
            </span>
          </div>
        )}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Portal Management
          </span>
          <UserNav user={user} />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
