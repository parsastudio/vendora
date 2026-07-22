import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function AdminForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6 py-12 dark:bg-black">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-zinc-800/40 dark:bg-zinc-950">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
            Security Gate
          </span>
          <h2 className="text-3xl font-black tracking-tight text-stone-955 dark:text-zinc-50">
            Forgot Password
          </h2>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
