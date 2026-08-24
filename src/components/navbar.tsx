"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User, LayoutDashboard, LogOut } from "lucide-react";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_2px_rgba(34,211,238,0.8)]" />
          MarketDev<span className="text-signal"> | Hussain</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-white/70 transition hover:text-white">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-sm text-white/70 transition hover:text-white"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-white/70 transition hover:text-white">
                Login
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-black transition hover:bg-cyan-300"
              >
                <User className="h-3.5 w-3.5" />
                Get Started
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-white/80">
                {l.label}
              </Link>
            ))}
            {session?.user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="text-white/80">
                  Dashboard
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="text-left text-white/80">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="text-white/80">
                  Login
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="text-cyan-400">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
