import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SectionHeading, Badge } from "@/components/ui";
import { formatPkr } from "@/lib/utils";

const statusTone: Record<string, "default" | "success" | "warning" | "danger"> = {
  PENDING_PAYMENT: "default",
  PAYMENT_SUBMITTED: "warning",
  PENDING_VERIFICATION: "warning",
  VERIFIED: "success",
  COMPLETED: "success",
  REJECTED: "danger",
  EXPIRED: "danger",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <SectionHeading eyebrow="History" title="Orders" />

      {orders.length === 0 ? (
        <div className="terminal-frame p-10 text-center text-sm text-white/50">
          No orders yet. <Link href="/projects" className="text-signal">Browse projects</Link>
        </div>
      ) : (
        <div className="terminal-frame divide-y divide-white/5">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={o.status === "PENDING_PAYMENT" ? `/checkout/${o.id}` : `/checkout/${o.id}/verify`}
              className="flex items-center justify-between gap-4 p-5 transition hover:bg-white/[0.03]"
            >
              <div>
                <p className="text-sm font-medium text-white">{o.project.title}</p>
                <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-white/40">{o.orderNumber}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-[family-name:var(--font-mono)] text-sm text-white/80">{formatPkr(o.amountPkr)}</span>
                <Badge tone={statusTone[o.status]}>{o.status.replace(/_/g, " ")}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
