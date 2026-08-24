import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui";
import { formatPkr } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function DashboardHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, orderCount, purchaseCount, totalSpentAgg] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, createdAt: true } }),
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.order.count({ where: { userId: session.user.id, status: { in: ["VERIFIED", "COMPLETED"] } } }),
    prisma.order.aggregate({
      where: { userId: session.user.id, status: { in: ["VERIFIED", "COMPLETED"] } },
      _sum: { amountPkr: true },
    }),
  ]);

  return (
    <div>
      <SectionHeading eyebrow="Account" title="Profile" />

      <div className="terminal-frame max-w-lg p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/5 pb-3">
            <dt className="text-white/40">Name</dt>
            <dd className="text-white">{user?.name}</dd>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-3">
            <dt className="text-white/40">Email</dt>
            <dd className="text-white">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/40">Member since</dt>
            <dd className="text-white">{user?.createdAt.toLocaleDateString()}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {[
          { label: "Total orders", value: orderCount },
          { label: "Purchases", value: purchaseCount },
          { label: "Total spent", value: formatPkr(totalSpentAgg._sum.amountPkr ?? 0) },
        ].map((s) => (
          <div key={s.label} className="terminal-frame p-5 text-center">
            <div className="font-[family-name:var(--font-mono)] text-xl font-semibold text-signal">{s.value}</div>
            <div className="mt-1 text-xs text-white/40">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
