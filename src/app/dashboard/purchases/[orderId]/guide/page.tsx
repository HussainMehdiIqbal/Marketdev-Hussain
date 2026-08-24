import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Eyebrow } from "@/components/ui";
import { InstallationGuideRenderer } from "@/components/installation-guide-renderer";

export default async function InstallationGuidePage({ params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { project: { include: { installationGuide: true } } },
  });

  if (!order || order.userId !== session.user.id) notFound();
  if (!["VERIFIED", "COMPLETED"].includes(order.status)) {
    return (
      <div className="terminal-frame p-10 text-center text-sm text-white/60">
        The installation guide unlocks once your payment is verified.
      </div>
    );
  }

  return (
    <div>
      <Eyebrow className="mb-2">Installation Guide</Eyebrow>
      <h1 className="mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
        {order.project.title}
      </h1>

      <div className="terminal-frame p-6 sm:p-8">
        <InstallationGuideRenderer content={order.project.installationGuide?.content} />
      </div>
    </div>
  );
}
