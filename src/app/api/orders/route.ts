import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/codes";

// Create a new order for a project ("Buy Now").
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in to purchase." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const projectId = body?.projectId as string | undefined;
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required." }, { status: 400 });
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || !project.published) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  // Reuse an existing unpaid order for this user/project instead of spawning duplicates.
  const existing = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      projectId,
      status: { in: ["PENDING_PAYMENT", "PAYMENT_SUBMITTED", "PENDING_VERIFICATION"] },
    },
  });
  if (existing) {
    return NextResponse.json({ order: existing }, { status: 200 });
  }

  const orderNumber = await generateOrderNumber();

  const [order] = await prisma.$transaction([
    prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        projectId,
        amountPkr: project.priceInPkr,
        status: "PENDING_PAYMENT",
      },
    }),
    prisma.notification.create({
      data: {
        audience: "admin",
        type: "NEW_ORDER",
        title: "🛒 New Order Placed",
        message: `Order #${orderNumber} for "${project.title}" was placed by ${session.user.name || session.user.email} (Rs ${project.priceInPkr.toLocaleString()}).`,
      },
    }),
  ]);

  return NextResponse.json({ order }, { status: 201 });
}

// List the current user's orders.
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { project: true, payment: true, license: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
