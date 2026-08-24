"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, getSession } from "next-auth/react";
import { Loader2, ShieldCheck, KeyRound, Mail } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setLoading(false);
      setError("Invalid email or password. Please check your credentials.");
      return;
    }

    // Verify user role in session
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") {
      await signOut({ redirect: false });
      setLoading(false);
      setError("Access Denied: This account does not have Admin privileges.");
      return;
    }

    setLoading(false);
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#63f2c0] bg-[#63f2c0]/15 shadow-[0_0_30px_rgba(99,242,192,0.3)]">
          <ShieldCheck className="h-8 w-8 text-[#63f2c0]" />
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#63f2c0]/40 bg-[#63f2c0]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#63f2c0]">
          <span className="h-2 w-2 rounded-full bg-[#63f2c0] shadow-[0_0_8px_#63f2c0]" />
          Admin Control Panel
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Admin Login
        </h1>
        <p className="mt-2 text-sm font-medium text-[#94a3b8]">
          Sign in to access order approvals, analytics, and project inventory.
        </p>
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-2xl border-2 border-[#2b3348] bg-[#121624] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Titlebar */}
        <div className="flex items-center gap-2 border-b border-[#2b3348] bg-[#1a2030] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2 font-mono text-xs font-semibold text-[#cbd5e1]">
            admin.session.authenticate
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 sm:p-8">
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffffff]">
              <Mail className="h-4 w-4 text-[#63f2c0]" />
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-[#3b4768] bg-[#1d2436] px-4 py-3.5 text-base font-medium text-white placeholder:text-[#94a3b8] transition-all focus:border-[#63f2c0] focus:bg-[#232b40] focus:outline-none focus:ring-2 focus:ring-[#63f2c0]/40"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffffff]">
              <KeyRound className="h-4 w-4 text-[#63f2c0]" />
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-2 border-[#3b4768] bg-[#1d2436] px-4 py-3.5 text-base font-medium text-white placeholder:text-[#94a3b8] transition-all focus:border-[#63f2c0] focus:bg-[#232b40] focus:outline-none focus:ring-2 focus:ring-[#63f2c0]/40"
            />
          </div>

          {error && (
            <div className="rounded-xl border-2 border-red-500/50 bg-red-950/80 p-3.5 text-center text-sm font-semibold text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#63f2c0] py-4 text-base font-bold text-[#05060a] transition-all hover:bg-[#4de4b0] hover:shadow-[0_0_25px_rgba(99,242,192,0.5)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In to Admin Panel"}
          </button>

          <div className="rounded-xl border border-[#2b3348] bg-[#1a2030] p-4 text-center font-mono text-xs text-[#cbd5e1]">
            <span className="font-sans font-semibold text-[#94a3b8]">Authorized Admins:</span>
            <br />
            <span className="font-bold text-[#63f2c0]">hm2637502@gmail.com</span>
            {" or "}
            <span className="font-bold text-[#63f2c0]">admin@example.com</span>
          </div>
        </form>
      </div>
    </div>
  );
}
