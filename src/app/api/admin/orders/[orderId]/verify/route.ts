import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLicenseCode } from "@/lib/codes";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, project: true },
  });

  if (!order || !order.payment) {
    return NextResponse.json({ error: "Order or payment not found." }, { status: 404 });
  }
  if (order.status !== "PENDING_VERIFICATION") {
    return NextResponse.json({ error: "Order is not pending verification." }, { status: 409 });
  }

  const licenseCode = generateLicenseCode();

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: order.payment.id },
      data: { verifiedAt: new Date(), verifiedByAdminId: session.user.id },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "VERIFIED" },
    }),
    prisma.license.create({
      data: {
        licenseCode,
        orderId: order.id,
        userId: order.userId,
        type: order.project.license,
      },
    }),
    prisma.notification.create({
      data: {
        userId: order.userId,
        audience: "user",
        type: "PAYMENT_VERIFIED",
        title: "Payment verified",
        message: `Your payment for order ${order.orderNumber} has been verified. Your download is now available.`,
      },
    }),
    prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "VERIFY_PAYMENT",
        targetType: "Order",
        targetId: order.id,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
