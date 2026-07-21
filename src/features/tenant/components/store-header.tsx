"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/features/cart/store/use-cart-store";
import { CartDrawer } from "@/features/cart/components/cart-drawer";

interface StoreHeaderProps {
  tenantId: string;
  tenantName: string;
}

export function StoreHeader({ tenantId, tenantName }: StoreHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    const handle = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(handle);
  }, []);

  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/50 bg-white/70 backdrop-blur-md dark:border-zinc-850 dark:bg-black/70 transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        <span className="text-sm font-extrabold tracking-widest text-zinc-950 dark:text-zinc-50 uppercase">
          {tenantName}
        </span>

        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/90 px-5 py-2 text-xs font-bold text-zinc-950 shadow-sm transition-all duration-300 hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span>Cart</span>
          {mounted && totalItems > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950 text-[10px] font-bold text-white dark:bg-zinc-50 dark:text-zinc-950">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      <CartDrawer tenantId={tenantId} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </header>
  );
}
