import { type ReactNode } from "react";

interface StoreLayoutProps {
  children: ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 font-sans dark:bg-black selection:bg-stone-900 selection:text-white">
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
