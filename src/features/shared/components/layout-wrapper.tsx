"use client";

import { ReactNode } from "react";
import { useUIStore } from "../store/use-ui-store";
import { AdminSidebar } from "./sidebar";
import { UserNav } from "../../auth/components/user-nav";

interface AdminLayoutWrapperProps {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function AdminLayoutWrapper({ children, user }: AdminLayoutWrapperProps) {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <AdminSidebar />
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          isSidebarOpen ? "pl-64" : "pl-16"
        }`}
      >
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
