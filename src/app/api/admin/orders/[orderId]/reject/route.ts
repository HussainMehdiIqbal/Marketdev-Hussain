import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rejectPaymentSchema } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;
  const body = await req.json().catch(() => null);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order || !order.payment) {
    return NextResponse.json({ error: "Order or payment not found." }, { status: 404 });
  }

  const parsed = rejectPaymentSchema.safeParse({ paymentId: order.payment.id, reason: body?.reason });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "A rejection reason is required." },
      { status: 400 }
    );
  }
  if (order.status !== "PENDING_VERIFICATION") {
    return NextResponse.json({ error: "Order is not pending verification." }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: order.payment.id },
      data: { rejectedAt: new Date(), rejectionReason: parsed.data.reason },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "REJECTED" },
    }),
    prisma.notification.create({
      data: {
        userId: order.userId,
        audience: "user",
        type: "PAYMENT_REJECTED",
        title: "Payment rejected",
        message: `Your payment for order ${order.orderNumber} was rejected: ${parsed.data.reason}`,
      },
    }),
    prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "REJECT_PAYMENT",
        targetType: "Order",
        targetId: order.id,
        meta: { reason: parsed.data.reason },
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
