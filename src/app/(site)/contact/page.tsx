"use client";

import { useState } from "react";
import { Eyebrow, PrimaryButton } from "@/components/ui";
import { Loader2, Send, CheckCircle2, Mail, User, FileText, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send message. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <Eyebrow className="mb-3">Get in touch</Eyebrow>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">Contact</h1>
      <p className="mt-2 text-sm text-[var(--text-dim)]">
        Questions about a project or an order? Send a message below and I&apos;ll reply within a day or two.
      </p>

      {sent ? (
        <div className="terminal-frame mt-8 flex flex-col items-center gap-4 py-12 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-signal/10">
            <CheckCircle2 className="h-7 w-7 text-signal" />
          </div>
          <h2 className="text-lg font-semibold text-white">Message Sent!</h2>
          <p className="text-sm text-white/60">
            Thanks, <strong className="text-white">{name}</strong>! Your message has been received. Expect a reply within a day or two.
          </p>
          <button
            onClick={() => { setSent(false); setName(""); setEmail(""); setSubject(""); setMessage(""); }}
            className="mt-2 text-xs text-signal hover:underline"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="terminal-frame mt-8 flex flex-col gap-5 p-6">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/50">
              <User className="h-3 w-3" /> Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white placeholder-white/25 focus:border-signal/50 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/50">
              <Mail className="h-3 w-3" /> Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white placeholder-white/25 focus:border-signal/50 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/50">
              <FileText className="h-3 w-3" /> Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What is this about?"
              className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white placeholder-white/25 focus:border-signal/50 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/50">
              <MessageSquare className="h-3 w-3" /> Message
            </label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your question or issue in detail…"
              className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white placeholder-white/25 focus:border-signal/50 focus:outline-none transition resize-none"
            />
          </div>

          <PrimaryButton type="submit" disabled={loading} className="mt-1 w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? "Sending…" : "Send Message"}
          </PrimaryButton>
        </form>
      )}
    </div>
  );
}
