"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import { formatPkr } from "@/lib/utils";

type Method = {
  id: string;
  name: string;
  accountHolder: string;
  bankOrWallet: string;
  accountNumber: string;
  iban: string | null;
  instructions: string | null;
  qrCodeUrl: string | null;
};

export function PaymentInstructions({
  orderId,
  orderNumber,
  amountPkr,
  method,
}: {
  orderId: string;
  orderNumber: string;
  amountPkr: number;
  method: Method;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [senderName, setSenderName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!screenshot) {
      setError("Please attach your payment screenshot.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("paymentMethodId", method.id);
    formData.append("senderName", senderName);
    formData.append("transactionId", transactionId);
    formData.append("amount", String(amountPkr));
    formData.append("paidAt", paidAt);
    formData.append("screenshot", screenshot);

    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/checkout/${orderId}/verify`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (!showForm) {
    return (
      <div className="terminal-frame p-6">
        <div className="terminal-titlebar -m-6 mb-6">
          <span className="terminal-dot bg-[#ff5f56]" />
          <span className="terminal-dot bg-[#ffbd2e]" />
          <span className="terminal-dot bg-[#27c93f]" />
          <span className="ml-2 font-[family-name:var(--font-mono)] text-[11px] text-white/40">
            payment-instructions.txt
          </span>
        </div>

        <dl className="space-y-3 font-[family-name:var(--font-mono)] text-sm">
          <Row label="Payment Method" value={method.name} />
          <Row label="Account Name" value={method.accountHolder} />
          <Row label="Bank / Wallet" value={method.bankOrWallet} />
          <Row label="Account Number" value={method.accountNumber} />
          {method.iban && <Row label="IBAN" value={method.iban} />}
          <Row label="Amount" value={formatPkr(amountPkr)} highlight />
          <Row label="Order ID" value={orderNumber} />
        </dl>

        {method.instructions && (
          <p className="mt-4 rounded-lg border border-white/10 bg-surface-2 p-3 text-xs text-white/60">
            {method.instructions}
          </p>
        )}

        {method.qrCodeUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={method.qrCodeUrl} alt="Payment QR code" className="mt-4 h-40 w-40 rounded-lg border border-white/10" />
        )}

        <PrimaryButton onClick={() => setShowForm(true)} className="mt-6 w-full">
          I Have Made the Payment
        </PrimaryButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="terminal-frame flex flex-col gap-4 p-6">
      <p className="text-sm text-white/70">
        Enter your transaction details and attach a screenshot of the payment confirmation.
      </p>

      <div>
        <label className="mb-1.5 block text-xs text-white/50">Sender name</label>
        <input
          required
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white focus:border-signal/50 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-white/50">Transaction ID</label>
        <input
          required
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white focus:border-signal/50 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-white/50">Payment date &amp; time</label>
        <input
          type="datetime-local"
          required
          value={paidAt}
          onChange={(e) => setPaidAt(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white focus:border-signal/50 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-white/50">Payment screenshot (JPG, PNG or WebP)</label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/20 bg-surface-2 px-3 py-4 text-sm text-white/50 hover:border-signal/40">
          <Upload className="h-4 w-4" />
          {screenshot ? (
            <span className="flex items-center gap-1 text-white/80">
              <CheckCircle2 className="h-4 w-4 text-signal" /> {screenshot.name}
            </span>
          ) : (
            "Choose a file"
          )}
          <input
            type="file"
            required
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="mt-2 flex gap-3">
        <SecondaryButton type="button" onClick={() => setShowForm(false)} disabled={submitting}>
          Back
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={submitting} className="flex-1">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Payment Proof
        </PrimaryButton>
      </div>
    </form>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <dt className="text-white/40">{label}</dt>
      <dd className={highlight ? "font-semibold text-signal" : "text-white/90"}>{value}</dd>
    </div>
  );
}
