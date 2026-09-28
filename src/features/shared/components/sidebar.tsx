"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/features/shared/store/use-ui-store";
import {
  LayoutDashboard,
  BarChart3,
  ShoppingBag,
  Package,
  FolderTree,
  Warehouse,
  TicketPercent,
  Users,
  ShieldCheck,
  Terminal,
  Webhook,
  Workflow,
  Menu,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      name: "Metrics & Analytics",
      href: "/admin/analytics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: <ShoppingBag className="h-4 w-4" />,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: <Package className="h-4 w-4" />,
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: <FolderTree className="h-4 w-4" />,
    },
    {
      name: "Inventory Hubs",
      href: "/admin/inventory",
      icon: <Warehouse className="h-4 w-4" />,
    },
    {
      name: "Discounts & Coupons",
      href: "/admin/discounts",
      icon: <TicketPercent className="h-4 w-4" />,
    },
    {
      name: "Staff Members",
      href: "/admin/staff",
      icon: <Users className="h-4 w-4" />,
    },
    {
      name: "Roles & Access",
      href: "/admin/settings/roles",
      icon: <ShieldCheck className="h-4 w-4" />,
    },
    {
      name: "Developer Settings",
      href: "/admin/settings/developer",
      icon: <Terminal className="h-4 w-4" />,
    },
    {
      name: "Webhooks & Events",
      href: "/admin/settings/webhooks",
      icon: <Webhook className="h-4 w-4" />,
    },
    {
      name: "Fluxio Automation",
      href: "/admin/workflows",
      icon: <Workflow className="h-4 w-4" />,
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-stone-200/50 bg-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] dark:border-zinc-800/40 dark:bg-zinc-950 ${
        isSidebarOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex h-20 items-center justify-between px-4 border-b border-stone-200/30 dark:border-zinc-900/30">
        {isSidebarOpen && (
          <span className="text-[10px] font-black tracking-[0.2em] text-stone-950 dark:text-zinc-50 uppercase pl-2">
            VENDORA
          </span>
        )}
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          className="rounded-xl p-2 hover:bg-stone-50 dark:hover:bg-zinc-900 mx-auto transition-colors"
        >
          <Menu className="h-4 w-4 text-stone-600 dark:text-zinc-400" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-xs font-bold ${
                isActive
                  ? "bg-stone-950 text-white dark:bg-zinc-50 dark:text-zinc-950 shadow-sm"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-950 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-50"
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {isSidebarOpen && <span className="tracking-wide">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
