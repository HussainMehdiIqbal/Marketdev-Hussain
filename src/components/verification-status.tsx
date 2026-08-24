"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { CountdownTimer } from "@/components/countdown-timer";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import type { OrderStatus } from "@/lib/types";

type OrderInfo = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  verificationDeadline: string | null;
  project: { slug: string; title: string };
  payment: { rejectionReason: string | null } | null;
};

export function VerificationStatus({ orderId, initialOrder }: { orderId: string; initialOrder: OrderInfo }) {
  const [order, setOrder] = useState(initialOrder);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.order) {
        setOrder({
          id: data.order.id,
          orderNumber: data.order.orderNumber,
          status: data.order.status,
          verificationDeadline: data.order.verificationDeadline,
          project: { slug: data.order.project?.slug, title: data.order.project?.title },
          payment: data.order.payment ? { rejectionReason: data.order.payment.rejectionReason } : null,
        });
      }
    } catch {
      // Silent — keep showing the last known state and retry on the next interval.
    }
  }, [orderId]);

  useEffect(() => {
    if (order.status !== "PENDING_VERIFICATION") return;
    poll();
    const interval = setInterval(poll, 2500);
    return () => clearInterval(interval);
  }, [order.status, poll]);

  if (order.status === "VERIFIED" || order.status === "COMPLETED") {
    return (
      <div className="terminal-frame flex flex-col items-center gap-4 p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-signal" />
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">Payment verified</h2>
        <p className="text-sm text-white/60">
          Your purchase of <span className="text-white">{order.project.title}</span> is ready to download.
        </p>
        <Link href="/dashboard/purchases">
          <PrimaryButton>Go to My Purchases</PrimaryButton>
        </Link>
      </div>
    );
  }

  if (order.status === "REJECTED") {
    return (
      <div className="terminal-frame flex flex-col items-center gap-5 p-8 sm:p-10 text-center border-red-500/30 bg-red-950/20">
        <XCircle className="h-12 w-12 text-red-400" />
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
            Payment Submission Rejected
          </h2>
          <p className="mt-1 text-xs text-white/50">
            The administrator could not verify your payment submission.
          </p>
        </div>

        {order.payment?.rejectionReason && (
          <div className="w-full max-w-md rounded-xl border border-red-500/30 bg-black/50 p-4 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
              Rejection Reason from Admin:
            </p>
            <p className="text-sm leading-relaxed text-white/90 font-medium">
              &quot;{order.payment.rejectionReason}&quot;
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
          <Link href={`/checkout/${order.id}`}>
            <PrimaryButton className="w-full">Resubmit Payment Proof</PrimaryButton>
          </Link>
          <Link href="/contact" className="text-xs text-white/40 hover:text-white transition py-1">
            Need help? Contact support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-frame flex flex-col items-center gap-6 p-10 text-center">
      <Clock className="h-10 w-10 text-signal" />
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
          Your payment proof has been submitted.
        </h2>
        <p className="mt-2 text-sm text-white/60">Verification usually takes up to 30 minutes.</p>
      </div>

      {order.verificationDeadline && <CountdownTimer deadline={order.verificationDeadline} />}

      <p className="max-w-sm text-xs text-white/30">
        This page updates automatically once an admin reviews your payment — no need to refresh.
      </p>
    </div>
  );
}
