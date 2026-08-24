import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui";
import { formatPkr } from "@/lib/utils";
import { Download, FileText } from "lucide-react";

export default async function PurchasesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id, status: { in: ["VERIFIED", "COMPLETED"] } },
    include: { project: true, license: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <SectionHeading eyebrow="Unlocked" title="My Purchases" />

      {orders.length === 0 ? (
        <div className="terminal-frame p-10 text-center text-sm text-white/50">
          Nothing here yet. <Link href="/projects" className="text-signal">Browse projects</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {orders.map((o) => (
            <div key={o.id} className="terminal-frame p-5">
              <p className="font-[family-name:var(--font-display)] font-medium text-white">{o.project.title}</p>
              <dl className="mt-3 space-y-1.5 font-[family-name:var(--font-mono)] text-xs text-white/40">
                <div className="flex justify-between"><dt>Order ID</dt><dd>{o.orderNumber}</dd></div>
                <div className="flex justify-between"><dt>Purchased</dt><dd>{o.createdAt.toLocaleDateString()}</dd></div>
                <div className="flex justify-between"><dt>Amount</dt><dd>{formatPkr(o.amountPkr)}</dd></div>
                <div className="flex justify-between"><dt>Version</dt><dd>v{o.project.version}</dd></div>
                {o.license && <div className="flex justify-between"><dt>License</dt><dd className="text-signal">{o.license.licenseCode}</dd></div>}
              </dl>
              <div className="mt-4 flex gap-2">
                <a
                  href={`/api/download/${o.id}`}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-signal px-4 py-2 text-xs font-semibold text-black hover:brightness-110"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
                <Link
                  href={`/dashboard/purchases/${o.id}/guide`}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 hover:border-white/30"
                >
                  <FileText className="h-3.5 w-3.5" /> Install Guide
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
