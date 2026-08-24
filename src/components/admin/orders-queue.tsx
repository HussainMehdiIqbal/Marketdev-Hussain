"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Loader2, Eye, X } from "lucide-react";
import { Badge, SecondaryButton, PrimaryButton } from "@/components/ui";
import { formatPkr } from "@/lib/utils";

type AdminOrder = {
  id: string;
  orderNumber: string;
  status: string;
  amountPkr: number;
  verificationDeadline: string | null;
  createdAt: string;
  user: { name: string; email: string };
  project: { title: string };
  payment: {
    id: string;
    senderName: string;
    transactionId: string;
    amount: number;
    paidAt: string;
    submittedAt: string;
    paymentMethod: { name: string };
  } | null;
};

const statusTone: Record<string, "default" | "success" | "warning" | "danger"> = {
  PENDING_PAYMENT: "default",
  PAYMENT_SUBMITTED: "warning",
  PENDING_VERIFICATION: "warning",
  VERIFIED: "success",
  COMPLETED: "success",
  REJECTED: "danger",
  EXPIRED: "danger",
};

export function OrdersQueue() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING_VERIFICATION");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [previewProof, setPreviewProof] = useState<{ url: string; title: string } | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional loading flag for a fetch this effect owns
    setLoading(true);
    const params = filter ? `?status=${filter}` : "";
    fetch(`/api/admin/orders${params}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setOrders(d.orders ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter, reloadKey]);

  const load = useCallback(() => setReloadKey((k) => k + 1), []);

  async function verify(orderId: string) {
    setBusyId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        load();
      } else {
        alert(data.error || "Failed to verify order.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(orderId: string) {
    if (!reason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }
    setBusyId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        setRejectingId(null);
        setReason("");
        load();
      } else {
        alert(data.error || "Failed to reject order.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setBusyId(null);
    }
  }

  const filters = ["PENDING_VERIFICATION", "VERIFIED", "REJECTED", ""];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f || "all"}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${filter === f ? "border-signal/50 bg-signal/10 text-signal" : "border-white/10 text-white/50 hover:border-white/30"}`}
          >
            {f ? f.replace(/_/g, " ") : "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="terminal-frame p-10 text-center text-sm text-white/40">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="terminal-frame p-10 text-center text-sm text-white/50">No orders in this view.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="terminal-frame p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-[family-name:var(--font-display)] font-medium text-white">{o.project.title}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {o.orderNumber} · {o.user.name} ({o.user.email})
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-[family-name:var(--font-mono)] text-sm text-white/80">{formatPkr(o.amountPkr)}</span>
                  <Badge tone={statusTone[o.status]}>{o.status.replace(/_/g, " ")}</Badge>
                </div>
              </div>

              {o.payment && (
                <div className="mt-4 grid gap-4 border-t border-white/10 pt-4 sm:grid-cols-[1fr_auto]">
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 font-[family-name:var(--font-mono)] text-xs text-white/60">
                    <div className="flex justify-between"><dt>Method</dt><dd>{o.payment.paymentMethod.name}</dd></div>
                    <div className="flex justify-between"><dt>Sender</dt><dd>{o.payment.senderName}</dd></div>
                    <div className="flex justify-between"><dt>Txn ID</dt><dd>{o.payment.transactionId}</dd></div>
                    <div className="flex justify-between"><dt>Amount</dt><dd>{formatPkr(o.payment.amount)}</dd></div>
                    <div className="flex justify-between"><dt>Paid at</dt><dd>{new Date(o.payment.paidAt).toLocaleString()}</dd></div>
                    <div className="flex justify-between"><dt>Submitted</dt><dd>{new Date(o.payment.submittedAt).toLocaleString()}</dd></div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => setPreviewProof({
                      url: `/api/admin/payment-screenshot/${o.payment!.id}`,
                      title: `Payment Screenshot — ${o.orderNumber} (${o.payment!.senderName})`,
                    })}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-xs text-white/70 hover:border-signal/40 hover:text-signal transition"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Proof
                  </button>
                </div>
              )}

              {o.status === "PENDING_VERIFICATION" && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  {rejectingId === o.id ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason for rejection"
                        className="flex-1 rounded-lg border border-white/10 bg-surface-2 px-3 py-2 text-xs text-white focus:border-signal/50 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <SecondaryButton type="button" onClick={() => { setRejectingId(null); setReason(""); }}>Cancel</SecondaryButton>
                        <button
                          onClick={() => reject(o.id)}
                          disabled={busyId === o.id}
                          className="rounded-full bg-red-400/90 px-4 py-2 text-xs font-semibold text-black hover:brightness-110 disabled:opacity-50"
                        >
                          {busyId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm Reject"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <PrimaryButton type="button" onClick={() => verify(o.id)} disabled={busyId === o.id}>
                        {busyId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Verify Payment
                      </PrimaryButton>
                      <button
                        onClick={() => setRejectingId(o.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 px-6 py-3 text-sm font-semibold text-red-300 hover:bg-red-400/10"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject Payment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PROOF SCREENSHOT MODAL OVERLAY (SAME TAB WITH CROSS BUTTON) */}
      {previewProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-surface shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-signal" />
                <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold text-white">
                  {previewProof.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProof(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-surface-2 text-white/70 transition hover:border-signal/50 hover:bg-white/10 hover:text-white"
                title="Close (ESC)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Screenshot Content */}
            <div className="flex max-h-[78vh] items-center justify-center overflow-auto bg-black/50 p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewProof.url}
                alt="Payment proof screenshot"
                className="max-h-[70vh] w-auto max-w-full rounded-xl border border-white/10 object-contain shadow-xl"
              />
            </div>

            {/* Footer / Actions */}
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-3 bg-surface-2">
              <a
                href={previewProof.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-white/50 hover:text-signal hover:underline"
              >
                Open original file in new tab
              </a>
              <button
                type="button"
                onClick={() => setPreviewProof(null)}
                className="rounded-lg bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
