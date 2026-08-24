"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Package, ShoppingBag, CreditCard, Users, Download, Bell, Settings, LogOut, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, badgeKey: null },
  { href: "/admin/projects", label: "Projects", icon: Package, badgeKey: null },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, badgeKey: "pendingOrders" as const },
  { href: "/admin/payment-methods", label: "Payment Methods", icon: CreditCard, badgeKey: null },
  { href: "/admin/users", label: "Users", icon: Users, badgeKey: null },
  { href: "/admin/downloads", label: "Downloads", icon: Download, badgeKey: null },
  { href: "/admin/contacts", label: "Contacts", icon: MessageSquare, badgeKey: "unreadContacts" as const },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, badgeKey: "unreadNotifications" as const },
  { href: "/admin/settings", label: "Settings", icon: Settings, badgeKey: null },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<{
    unreadNotifications: number;
    pendingOrders: number;
    unreadContacts: number;
  }>({ unreadNotifications: 0, pendingOrders: 0, unreadContacts: 0 });

  useEffect(() => {
    async function loadCounts() {
      try {
        const res = await fetch("/api/admin/unread-counts");
        if (res.ok) {
          const data = await res.json();
          setCounts(data);
        }
      } catch {
        // ignore
      }
    }
    loadCounts();
    const interval = setInterval(loadCounts, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-white/10 bg-surface">
      <div className="flex items-center gap-2 px-6 py-5 font-[family-name:var(--font-display)] text-base font-semibold text-white">
        <span className="h-2 w-2 rounded-full bg-signal" /> Admin
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
          const count = l.badgeKey ? counts[l.badgeKey] : 0;

          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition",
                active ? "bg-signal/10 text-signal" : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-2.5">
                <l.icon className="h-4 w-4" /> {l.label}
              </div>
              {count > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-signal px-1.5 text-[10px] font-bold text-black">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="mx-3 mb-5 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-white/60 hover:bg-white/5 hover:text-white"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </aside>
  );
}
