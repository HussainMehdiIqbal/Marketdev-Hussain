"use client";

import { useState, useTransition } from "react";
import { MessageSquare, Mail, Trash2, CheckCheck, Clock, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date | string;
}

export function AdminContactsClient({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [isPending, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function markRead(id: string, read: boolean) {
    await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read } : m));
    if (selected?.id === id) setSelected((s) => s ? { ...s, read } : s);
  }

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  function formatDate(iso: Date | string) {
    return new Date(iso).toLocaleString("en-PK", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-signal">Contact Messages</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">
            Contacts
            {unreadCount > 0 && (
              <span className="ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-signal text-xs font-bold text-black">
                {unreadCount}
              </span>
            )}
          </h1>
        </div>
        <button
          onClick={refresh}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/60 hover:border-white/30 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "unread", "read"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
              filter === f
                ? "bg-signal text-black"
                : "border border-white/15 text-white/50 hover:border-white/30 hover:text-white"
            }`}
          >
            {f === "all" ? `All (${messages.length})` : f === "unread" ? `Unread (${unreadCount})` : `Read (${messages.length - unreadCount})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="terminal-frame flex flex-col items-center gap-3 py-20 text-center">
          <MessageSquare className="h-10 w-10 text-white/20" />
          <p className="text-sm text-white/40">No {filter !== "all" ? filter : ""} messages yet.</p>
          <p className="text-xs text-white/25">When users submit the contact form, messages will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
          {/* Message List */}
          <div className="terminal-frame space-y-1 overflow-y-auto p-2" style={{ maxHeight: "70vh" }}>
            {filtered.map((msg) => (
              <button
                key={msg.id}
                onClick={() => {
                  setSelected(msg);
                  if (!msg.read) markRead(msg.id, true);
                }}
                className={`w-full rounded-lg px-4 py-3 text-left transition ${
                  selected?.id === msg.id
                    ? "bg-signal/10 border border-signal/30"
                    : "border border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {!msg.read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-signal" />
                    )}
                    <div className="overflow-hidden">
                      <p className={`truncate text-sm font-semibold ${msg.read ? "text-white/70" : "text-white"}`}>
                        {msg.name}
                      </p>
                      <p className="truncate text-xs text-white/40">{msg.email}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-white/30">
                    {new Date(msg.createdAt).toLocaleDateString("en-PK")}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-xs text-white/50 pl-4">{msg.subject}</p>
              </button>
            ))}
          </div>

          {/* Message Detail */}
          {selected ? (
            <div className="terminal-frame p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">{selected.subject}</h2>
                  <div className="mt-1 flex items-center gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selected.email}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(selected.createdAt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => markRead(selected.id, !selected.read)}
                    title={selected.read ? "Mark as unread" : "Mark as read"}
                    className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/60 hover:border-signal/50 hover:text-signal transition"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    {selected.read ? "Unread" : "Mark Read"}
                  </button>
                  <button
                    onClick={() => deleteMessage(selected.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/40 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-surface-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">From</p>
                <p className="text-sm font-semibold text-white">{selected.name}</p>
                <p className="text-xs text-white/50">{selected.email}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-surface-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Message</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">{selected.message}</p>
              </div>

              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                className="inline-flex items-center gap-2 rounded-lg bg-signal px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-signal/90"
              >
                <Mail className="h-4 w-4" /> Reply via Email
              </a>
            </div>
          ) : (
            <div className="terminal-frame flex flex-col items-center justify-center gap-3 text-center">
              <MessageSquare className="h-10 w-10 text-white/10" />
              <p className="text-sm text-white/30">Select a message to read</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
