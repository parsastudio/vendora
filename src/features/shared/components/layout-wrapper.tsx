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
    <div className="flex min-h-screen bg-[#fafaf9] font-sans dark:bg-[#09090b]">
      <AdminSidebar />
      <div
        className={`flex flex-1 flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isSidebarOpen ? "pl-64" : "pl-16"
        }`}
      >
        {isDemo && (
          <div className="bg-stone-950 text-white dark:bg-white dark:text-stone-950 px-6 py-3.5 text-[9px] font-black uppercase tracking-[0.2em] text-center border-b border-stone-200/30 flex items-center justify-center gap-2">
            <span>🛡️ Sandbox Instance:</span>
            <span className="font-semibold normal-case tracking-normal text-stone-400 dark:text-zinc-500">
              You are exploring as a Guest Admin. Structural mutations are sandboxed.
            </span>
          </div>
        )}
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-stone-200/40 bg-white/70 backdrop-blur-md px-8 dark:border-zinc-800/40 dark:bg-black/70">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-zinc-500">
            Console Panel
          </span>
          <UserNav user={user} />
        </header>
        <main className="flex-1 p-8 sm:p-10 lg:p-12 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
