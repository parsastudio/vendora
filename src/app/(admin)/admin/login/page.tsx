"use client";

import { useState, useTransition, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [require2FA, setRequire2FA] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        otp,
      });

      if (result?.error) {
        if (result.error === "2FA_REQUIRED") {
          setRequire2FA(true);
        } else if (result.error === "INVALID_OTP") {
          setError("The verification code is incorrect.");
        } else {
          setError("Invalid account credentials.");
        }
      } else {
        router.push("/admin");
      }
    });
  };

  const handleDemoLogin = () => {
    setError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        redirect: false,
        email: "demo@vendora.com",
        password: "demo-password-2026",
        otp: "",
      });

      if (result?.error) {
        setError("Unable to dispatch connection request.");
      } else {
        router.push("/admin");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-[#09090b] px-6 py-12">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-stone-200/50 bg-white p-8 dark:border-zinc-800/40 dark:bg-zinc-950 shadow-sm">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 dark:text-zinc-500">
            Console Gate
          </span>
          <h2 className="text-3xl font-black tracking-tight text-stone-950 dark:text-zinc-50">
            Log in to Vendora
          </h2>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-500/[0.04] p-4 text-xs font-bold text-rose-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!require2FA ? (
              <>
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-email"
                    className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest"
                  >
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-stone-950 dark:text-zinc-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest"
                  >
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 text-stone-950 dark:text-zinc-50"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <label
                  htmlFor="login-otp"
                  className="block text-[10px] font-black text-stone-400 dark:text-zinc-500 uppercase tracking-widest"
                >
                  Two-factor Verification Code
                </label>
                <input
                  id="login-otp"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit TOTP code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs focus:outline-none tracking-[0.25em] text-center font-mono dark:border-zinc-800 dark:bg-zinc-900 text-stone-950 dark:text-zinc-50"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full bg-stone-950 py-3.5 text-xs font-bold text-white hover:bg-stone-900 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {isPending ? "Connecting..." : require2FA ? "Verify Identity" : "Log In"}
            </button>

            {!require2FA && (
              <>
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-stone-200 dark:border-zinc-900"></div>
                  <span className="flex-shrink mx-4 text-stone-400 dark:text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                    Sandbox exploration
                  </span>
                  <div className="flex-grow border-t border-stone-200 dark:border-zinc-900"></div>
                </div>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isPending}
                  className="w-full rounded-full border border-stone-200 bg-white py-3 text-xs font-bold text-stone-700 hover:bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {isPending ? "Connecting..." : "Access Demo Dashboard"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
