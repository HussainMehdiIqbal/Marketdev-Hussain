"use client";

import { useState } from "react";
import { SectionHeading, Badge } from "@/components/ui";
import { Bell, CheckCheck, ShoppingBag, CreditCard, AlertCircle } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date | string;
}

export function AdminNotificationsClient({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleMarkAllRead() {
    setLoading(true);
    await fetch("/api/admin/notifications/mark-read", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setLoading(false);
  }

  function getIcon(type: string) {
    if (type === "NEW_ORDER") return <ShoppingBag className="h-5 w-5 text-signal" />;
    if (type === "PAYMENT_SUBMITTED") return <CreditCard className="h-5 w-5 text-amber-400" />;
    return <AlertCircle className="h-5 w-5 text-cyan-400" />;
  }

  function formatDate(iso: Date | string) {
    return new Date(iso).toLocaleString("en-PK", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <SectionHeading eyebrow="Alerts" title="Notifications" />
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-white/70 hover:border-signal/50 hover:text-signal transition disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="terminal-frame flex flex-col items-center gap-3 p-12 text-center">
          <Bell className="h-10 w-10 text-white/20" />
          <p className="text-sm text-white/50">No notifications yet.</p>
        </div>
      ) : (
        <div className="terminal-frame divide-y divide-white/5 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between gap-4 p-5 transition ${
                !n.read ? "bg-signal/[0.03]" : "hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 rounded-lg border border-white/10 bg-surface-2 p-2.5">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${!n.read ? "text-white" : "text-white/80"}`}>
                      {n.title}
                    </p>
                    {!n.read && <Badge tone="success">New</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-white/60">{n.message}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="font-[family-name:var(--font-mono)] text-[11px] text-white/30">
                      {formatDate(n.createdAt)}
                    </span>
                    {n.type === "NEW_ORDER" || n.type === "PAYMENT_SUBMITTED" ? (
                      <Link href="/admin/orders" className="text-xs font-medium text-signal hover:underline">
                        View Orders →
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
