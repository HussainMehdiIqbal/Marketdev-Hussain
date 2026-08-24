import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPkr } from "@/lib/utils";
import { SectionHeading } from "@/components/ui";
import { RevenueChart } from "@/components/admin/revenue-chart";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin/login");

  const [
    totalProjects, totalUsers, totalOrders, pendingPayments, verifiedPayments,
    rejectedPayments, totalDownloads, revenueAgg,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING_VERIFICATION" } }),
    prisma.order.count({ where: { status: { in: ["VERIFIED", "COMPLETED"] } } }),
    prisma.order.count({ where: { status: "REJECTED" } }),
    prisma.download.count(),
    prisma.order.aggregate({ where: { status: { in: ["VERIFIED", "COMPLETED"] } }, _sum: { amountPkr: true } }),
  ]);

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
    monthly[d.toLocaleString("en-US", { month: "short", year: "2-digit" })] = 0;
  }
  for (const order of recentOrders) {
    const key = order.createdAt.toLocaleString("en-US", { month: "short", year: "2-digit" });
    if (key in monthly) monthly[key] += order.amountPkr;
  }
  const chartData = Object.entries(monthly).map(([month, revenue]) => ({ month, revenue }));

  const stats = [
    { label: "Total Projects", value: totalProjects },
    { label: "Total Users", value: totalUsers },
    { label: "Total Orders", value: totalOrders },
    { label: "Pending Payments", value: pendingPayments },
    { label: "Verified Payments", value: verifiedPayments },
    { label: "Rejected Payments", value: rejectedPayments },
    { label: "Total Revenue", value: formatPkr(revenueAgg._sum.amountPkr ?? 0) },
    { label: "Downloads", value: totalDownloads },
  ];

  return (
    <div>
      <SectionHeading eyebrow="Overview" title="Admin Dashboard" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="terminal-frame p-5">
            <div className="font-[family-name:var(--font-mono)] text-xl font-semibold text-white">{s.value}</div>
            <div className="mt-1 text-xs text-white/40">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="terminal-frame mt-8 p-6">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-white">
          Revenue — Last 6 Months
        </h2>
        <RevenueChart data={chartData} />
      </div>
    </div>
  );
}
