import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Eyebrow } from "@/components/ui";
import { PaymentInstructions } from "@/components/payment-instructions";

export default async function PaymentInstructionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ method?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { orderId } = await params;
  const { method: methodId } = await searchParams;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== session.user.id) notFound();
  if (order.status === "PENDING_VERIFICATION") redirect(`/checkout/${order.id}/verify`);
  if (["VERIFIED", "COMPLETED"].includes(order.status)) redirect("/dashboard/purchases");

  const method = methodId ? await prisma.paymentMethod.findUnique({ where: { id: methodId } }) : null;
  if (!method || !method.enabled) redirect(`/checkout/${order.id}`);

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Eyebrow className="mb-3">Payment Instructions</Eyebrow>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
        Complete your payment
      </h1>
      <p className="mt-2 text-sm text-[var(--text-dim)]">
        Send the exact amount below, then submit your proof of payment.
      </p>

      <div className="mt-6">
        <PaymentInstructions
          orderId={order.id}
          orderNumber={order.orderNumber}
          amountPkr={order.amountPkr}
          method={method}
        />
      </div>
    </div>
  );
}
