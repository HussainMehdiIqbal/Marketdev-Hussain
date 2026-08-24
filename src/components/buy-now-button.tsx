"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PrimaryButton } from "@/components/ui";
import { Loader2, ShoppingCart, Download, FileText, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface BuyNowButtonProps {
  projectId: string;
  userOrder?: {
    id: string;
    status: string;
  } | null;
}

export function BuyNowButton({ projectId, userOrder }: BuyNowButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (userOrder) {
    if (["VERIFIED", "COMPLETED"].includes(userOrder.status)) {
      return (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-signal/30 bg-signal/15 px-4 py-2.5 text-center text-xs font-semibold text-signal flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> You own this project
          </div>
          <a
            href={`/api/download/${userOrder.id}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-signal px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
          >
            <Download className="h-4 w-4" /> Download Source Code
          </a>
          <Link
            href={`/dashboard/purchases/${userOrder.id}/guide`}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-surface-2 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-signal/50"
          >
            <FileText className="h-4 w-4 text-signal" /> View Installation Guide
          </Link>
        </div>
      );
    }

    if (["PENDING_VERIFICATION", "PAYMENT_SUBMITTED"].includes(userOrder.status)) {
      return (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center text-xs font-semibold text-amber-400 flex items-center justify-center gap-2">
            <Clock className="h-3.5 w-3.5" /> Payment Under Verification
          </div>
          <Link
            href={`/checkout/${userOrder.id}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-surface-2 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-signal/50"
          >
            View Order Status
          </Link>
        </div>
      );
    }

    if (userOrder.status === "PENDING_PAYMENT") {
      return (
        <div className="flex flex-col gap-3">
          <Link
            href={`/checkout/${userOrder.id}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-signal px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300"
          >
            Complete Payment
          </Link>
        </div>
      );
    }
  }

  async function handleBuy() {
    setError(null);

    if (status !== "authenticated" || !session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start checkout.");
        return;
      }
      router.push(`/checkout/${data.order.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PrimaryButton onClick={handleBuy} disabled={loading} className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
        Buy Now
      </PrimaryButton>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
