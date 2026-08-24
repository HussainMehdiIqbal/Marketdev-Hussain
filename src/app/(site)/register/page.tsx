"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Eyebrow, PrimaryButton } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <Eyebrow className="mb-3">Create your account</Eyebrow>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">Register</h1>
      <p className="mt-2 text-sm text-[var(--text-dim)]">Needed once, before checkout.</p>

      <form onSubmit={handleSubmit} className="terminal-frame mt-8 flex flex-col gap-4 p-6">
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Full name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white focus:border-signal/50 focus:outline-none"
          />
        </div>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white focus:border-signal/50 focus:outline-none"
          />
          <p className="mt-1 text-xs text-white/30">At least 8 characters.</p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <PrimaryButton type="submit" disabled={loading} className="mt-2 w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </PrimaryButton>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        Already have an account? <Link href="/login" className="text-signal">Log in</Link>
      </p>
    </div>
  );
}
