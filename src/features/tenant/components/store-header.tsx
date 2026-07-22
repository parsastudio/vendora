"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/features/cart/store/use-cart-store";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { useParams } from "next/navigation";
import Link from "next/link";

interface StoreHeaderProps {
  tenantId: string;
  tenantName: string;
}

export function StoreHeader({ tenantId, tenantName }: StoreHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const params = useParams();
  const domain = (params?.domain as string) || "";

  useEffect(() => {
    const handle = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(handle);
  }, []);

  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/40 bg-white/80 backdrop-blur-xl dark:border-zinc-900/30 dark:bg-black/80 transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        <Link
          href={`/${domain}`}
          className="text-xs font-black tracking-[0.25em] text-stone-950 dark:text-zinc-50 uppercase hover:opacity-80"
        >
          {tenantName}
        </Link>

        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-3 rounded-full border border-stone-200 bg-white px-6 py-3 text-xs font-bold text-stone-950 shadow-sm hover:bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span>Shopping Cart</span>
          {mounted && totalItems > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-950 text-[9px] font-black text-white dark:bg-zinc-50 dark:text-zinc-950">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      <CartDrawer tenantId={tenantId} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </header>
  );
}
