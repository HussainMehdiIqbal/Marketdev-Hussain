import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Eyebrow } from "@/components/ui";
import { VerificationStatus } from "@/components/verification-status";

export const dynamic = "force-dynamic";

export default async function PaymentVerificationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { project: true, payment: true },
  });
  if (!order || order.userId !== session.user.id) notFound();
  if (order.status === "PENDING_PAYMENT") redirect(`/checkout/${order.id}`);

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Eyebrow className="mb-3">Payment Verification</Eyebrow>
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
        Order {order.orderNumber}
      </h1>

      <VerificationStatus
        orderId={order.id}
        initialOrder={{
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          verificationDeadline: order.verificationDeadline?.toISOString() ?? null,
          project: { slug: order.project.slug, title: order.project.title },
          payment: order.payment ? { rejectionReason: order.payment.rejectionReason } : null,
        }}
      />
    </div>
  );
}
