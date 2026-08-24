"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Profile", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/purchases", label: "My Purchases", icon: Package },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 lg:w-56 lg:flex-col lg:overflow-visible lg:pb-0">
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition",
              active ? "bg-signal/10 text-signal" : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <l.icon className="h-4 w-4" />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
