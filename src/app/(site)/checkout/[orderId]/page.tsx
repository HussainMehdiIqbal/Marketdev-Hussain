import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPkr } from "@/lib/utils";
import { Eyebrow, Badge } from "@/components/ui";
import { ArrowRight, Landmark, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { project: true, payment: true },
  });

  if (!order || order.userId !== session.user.id) notFound();

  const methods = await prisma.paymentMethod.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: "asc" },
  });

  if (order.status === "PENDING_VERIFICATION") redirect(`/checkout/${order.id}/verify`);
  if (["VERIFIED", "COMPLETED"].includes(order.status)) redirect("/dashboard/purchases");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Eyebrow className="mb-3">Checkout</Eyebrow>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">
        Order {order.orderNumber}
      </h1>

      {order.status === "REJECTED" && (
        <div className="terminal-frame mt-6 border-red-500/40 bg-red-950/30 p-5">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400">Previous Payment Submission Rejected</p>
              {order.payment?.rejectionReason && (
                <p className="mt-1 text-xs text-white/90">
                  <strong className="text-red-300">Reason:</strong> &quot;{order.payment.rejectionReason}&quot;
                </p>
              )}
              <p className="mt-2 text-xs text-white/50">
                Please select a payment method below and submit a valid payment proof.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="terminal-frame mt-6 flex items-center justify-between p-6">
        <div>
          <p className="font-[family-name:var(--font-display)] font-medium text-white">{order.project.title}</p>
          <p className="mt-1 text-xs text-white/40">Order ID: {order.orderNumber}</p>
        </div>
        <div className="text-right">
          <p className="font-[family-name:var(--font-mono)] text-xl font-semibold text-white">
            {formatPkr(order.amountPkr)}
          </p>
          <Badge tone={order.status === "REJECTED" ? "danger" : "warning"}>{order.status.replace(/_/g, " ")}</Badge>
        </div>
      </div>

      <h2 className="mb-4 mt-10 font-[family-name:var(--font-display)] text-lg font-semibold text-white">
        Select a payment method
      </h2>

      {methods.length === 0 ? (
        <div className="terminal-frame p-6 text-sm text-white/60">
          No payment methods are configured yet. Please check back soon.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {methods.map((m) => (
            <Link
              key={m.id}
              href={`/checkout/${order.id}/pay?method=${m.id}`}
              className="terminal-frame flex items-center justify-between p-5 transition hover:border-signal/40"
            >
              <div className="flex items-center gap-3">
                <Landmark className="h-5 w-5 text-signal" />
                <div>
                  <p className="text-sm font-medium text-white">{m.name}</p>
                  <p className="text-xs text-white/40">{m.bankOrWallet}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/30" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
