import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SectionHeading, Badge } from "@/components/ui";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id, audience: "user" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <SectionHeading eyebrow="Updates" title="Notifications" />

      {notifications.length === 0 ? (
        <div className="terminal-frame p-10 text-center text-sm text-white/50">You&apos;re all caught up.</div>
      ) : (
        <div className="terminal-frame divide-y divide-white/5">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-medium text-white">{n.title}</p>
                <p className="mt-1 text-sm text-white/50">{n.message}</p>
                <p className="mt-2 font-[family-name:var(--font-mono)] text-[11px] text-white/30">
                  {n.createdAt.toLocaleString()}
                </p>
              </div>
              {!n.read && <Badge tone="success">New</Badge>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
