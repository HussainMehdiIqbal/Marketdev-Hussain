import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui";
import { ActivityLogsClient } from "./activity-logs-client";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin/login");

  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <SectionHeading eyebrow="Configuration" title="Settings" />

      <div className="terminal-frame mb-8 p-6 text-sm text-white/70">
        <p>
          Site-wide settings (currency, verification window, upload limits, SMTP) are configured via
          environment variables in <code className="rounded bg-surface-2 px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-xs text-signal">.env</code> —
          see <code className="rounded bg-surface-2 px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-xs text-signal">.env.example</code> for the full list.
        </p>
      </div>

      <ActivityLogsClient initialLogs={logs} />
    </div>
  );
}
