import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalProjects,
    totalUsers,
    totalOrders,
    pendingPayments,
    verifiedPayments,
    rejectedPayments,
    totalDownloads,
    revenueAgg,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING_VERIFICATION" } }),
    prisma.order.count({ where: { status: { in: ["VERIFIED", "COMPLETED"] } } }),
    prisma.order.count({ where: { status: "REJECTED" } }),
    prisma.download.count(),
    prisma.order.aggregate({
      where: { status: { in: ["VERIFIED", "COMPLETED"] } },
      _sum: { amountPkr: true },
    }),
  ]);

  // Monthly revenue for the last 6 months, computed in JS to stay DB-agnostic.
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const recentOrders = await prisma.order.findMany({
    where: { status: { in: ["VERIFIED", "COMPLETED"] }, createdAt: { gte: sixMonthsAgo } },
    select: { amountPkr: true, createdAt: true },
  });

  const monthly: Record<string, number> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    monthly[key] = 0;
  }
  for (const order of recentOrders) {
    const key = order.createdAt.toLocaleString("en-US", { month: "short", year: "2-digit" });
    if (key in monthly) monthly[key] += order.amountPkr;
  }

  return NextResponse.json({
    totalProjects,
    totalUsers,
    totalOrders,
    pendingPayments,
    verifiedPayments,
    rejectedPayments,
    totalDownloads,
    totalRevenuePkr: revenueAgg._sum.amountPkr ?? 0,
    monthlyRevenue: Object.entries(monthly).map(([month, revenue]) => ({ month, revenue })),
  });
}
