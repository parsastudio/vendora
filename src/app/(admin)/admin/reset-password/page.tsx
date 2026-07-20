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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-center">
          <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase dark:text-zinc-600">
            Password Recovery
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Define New Password
          </h2>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
