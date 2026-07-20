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
          setError("The authenticator code is incorrect.");
        } else {
          setError("Invalid email or password combination.");
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
        setError("Failed to connect to demo gateway.");
      } else {
        router.push("/admin");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-center">
          <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase dark:text-zinc-600">
            Secure Portal
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Sign in to Vendora Admin
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4 rounded-md">
            {!require2FA ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Two-Factor Verification Token
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit authenticator code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 tracking-widest text-center focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isPending}
              className="group relative flex w-full justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer"
            >
              {isPending ? "Authenticating..." : require2FA ? "Verify Code" : "Sign In"}
            </button>

            {!require2FA && (
              <>
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                  <span className="flex-shrink mx-4 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                    Or explore first
                  </span>
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                </div>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isPending}
                  className="flex w-full justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 focus:outline-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  {isPending ? "Connecting Sandbox..." : "Explore Demo Dashboard"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
