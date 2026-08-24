import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { savePaymentScreenshot } from "@/lib/storage";
import { paymentSubmissionSchema } from "@/lib/validation";

const VERIFICATION_WINDOW_MINUTES = Number(process.env.VERIFICATION_WINDOW_MINUTES || 30);

// Customer submits payment proof: "I Have Made the Payment" -> screenshot + details.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (!["PENDING_PAYMENT", "REJECTED"].includes(order.status)) {
    return NextResponse.json(
      { error: "This order is not awaiting a new payment submission." },
      { status: 409 }
    );
  }

  const formData = await req.formData();
  const parsed = paymentSubmissionSchema.safeParse({
    orderId,
    paymentMethodId: formData.get("paymentMethodId"),
    senderName: formData.get("senderName"),
    transactionId: formData.get("transactionId"),
    amount: formData.get("amount"),
    paidAt: formData.get("paidAt"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission." },
      { status: 400 }
    );
  }

  const screenshot = formData.get("screenshot");
  if (!(screenshot instanceof File) || screenshot.size === 0) {
    return NextResponse.json({ error: "A payment screenshot is required." }, { status: 400 });
  }

  const paymentMethod = await prisma.paymentMethod.findUnique({
    where: { id: parsed.data.paymentMethodId },
  });
  if (!paymentMethod || !paymentMethod.enabled) {
    return NextResponse.json({ error: "Selected payment method is unavailable." }, { status: 400 });
  }

  let screenshotPath: string;
  try {
    screenshotPath = await savePaymentScreenshot(screenshot);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 400 }
    );
  }

  const deadline = new Date(Date.now() + VERIFICATION_WINDOW_MINUTES * 60 * 1000);

  // Payment proof is never auto-approved — it only moves the order into the admin queue.
  const [payment] = await prisma.$transaction([
    prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        paymentMethodId: paymentMethod.id,
        senderName: parsed.data.senderName,
        transactionId: parsed.data.transactionId,
        amount: parsed.data.amount,
        paidAt: new Date(parsed.data.paidAt),
        screenshotPath,
      },
      update: {
        paymentMethodId: paymentMethod.id,
        senderName: parsed.data.senderName,
        transactionId: parsed.data.transactionId,
        amount: parsed.data.amount,
        paidAt: new Date(parsed.data.paidAt),
        screenshotPath,
        submittedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "PENDING_VERIFICATION", verificationDeadline: deadline },
    }),
    prisma.notification.create({
      data: {
        audience: "admin",
        type: "PAYMENT_SUBMITTED",
        title: "Payment proof resubmitted",
        message: `Order ${order.orderNumber} has resubmitted payment proof for verification.`,
      },
    }),
  ]);

  return NextResponse.json({ payment, verificationDeadline: deadline }, { status: 201 });
}
