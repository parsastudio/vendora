import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/features/auth/lib/auth";
import { ReactNode } from "react";
import { AdminLayoutWrapper } from "@/features/shared/components/layout-wrapper";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return <AdminLayoutWrapper user={session.user}>{children}</AdminLayoutWrapper>;
}
