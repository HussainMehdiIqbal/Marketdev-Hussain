import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma, OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as OrderStatus | null;

  const where: Prisma.OrderWhereInput = status ? { status } : {};

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, title: true, slug: true } },
      payment: { include: { paymentMethod: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
