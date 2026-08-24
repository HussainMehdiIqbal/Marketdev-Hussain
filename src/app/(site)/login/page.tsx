"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Eyebrow, PrimaryButton } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <Eyebrow className="mb-3">Welcome back</Eyebrow>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">Log in</h1>
      <p className="mt-2 text-sm text-[var(--text-dim)]">Access your purchases and downloads.</p>

      <form onSubmit={handleSubmit} className="terminal-frame mt-8 flex flex-col gap-4 p-6">
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white focus:border-signal/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white focus:border-signal/50 focus:outline-none"
          />
          <Link href="/forgot-password" className="mt-1.5 inline-block text-xs text-signal">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <PrimaryButton type="submit" disabled={loading} className="mt-2 w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Log in
        </PrimaryButton>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        No account yet? <Link href="/register" className="text-signal">Create one</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
