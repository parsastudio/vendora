"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white border border-zinc-200 shadow-sm hover:scale-105 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-800"
      >
        {initial}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-56 origin-top-right rounded-xl border border-zinc-200 bg-white p-2.5 shadow-xl dark:border-zinc-850 dark:bg-zinc-950 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="px-2 py-1.5">
            <p className="text-xs font-extrabold text-zinc-950 dark:text-zinc-50">
              {user.name || "Administrator"}
            </p>
            <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{user.email}</p>
          </div>
          <div className="my-2 border-t border-zinc-100 dark:border-zinc-900" />
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center rounded-lg px-2 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
