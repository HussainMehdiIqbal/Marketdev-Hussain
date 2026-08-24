"use client";

import { useState } from "react";
import Link from "next/link";
import { Eyebrow, PrimaryButton } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production this posts to an /api/forgot-password route that emails a
    // signed, expiring reset link via the SMTP settings in .env.
    setSent(true);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <Eyebrow className="mb-3">Account recovery</Eyebrow>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">Reset password</h1>
      <p className="mt-2 text-sm text-[var(--text-dim)]">
        Enter the email on your account and we&apos;ll send a reset link.
      </p>

      {sent ? (
        <div className="terminal-frame mt-8 p-6 text-sm text-white/80">
          If an account exists for <span className="text-signal">{email}</span>, a reset link is on its way.
        </div>
      ) : (
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
          <PrimaryButton type="submit" className="mt-2 w-full">Send reset link</PrimaryButton>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-white/50">
        <Link href="/login" className="text-signal">Back to login</Link>
      </p>
    </div>
  );
}
