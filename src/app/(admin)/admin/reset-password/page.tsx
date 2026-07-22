import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { redirect } from "next/navigation";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AdminResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const resolvedParams = await searchParams;
  const token = resolvedParams.token;
  if (!token) {
    redirect("/admin/login");
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6 py-12 dark:bg-[#09090b]">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-zinc-850 dark:bg-zinc-950">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
            Security Recovery
          </span>
          <h2 className="text-3xl font-black tracking-tight text-stone-955 dark:text-zinc-50">
            Define Password
          </h2>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
