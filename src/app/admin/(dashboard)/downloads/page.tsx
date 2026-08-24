import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui";

export default async function AdminDownloadsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin/login");

  const downloads = await prisma.download.findMany({
    orderBy: { downloadedAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } }, project: { select: { title: true } }, order: { select: { orderNumber: true } } },
  });

  return (
    <div>
      <SectionHeading eyebrow="Audit" title="Downloads" description="Every download is logged with user, project, order, IP, and timestamp." />
      <div className="terminal-frame overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Project</th>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">IP</th>
              <th className="px-5 py-3">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {downloads.map((d) => (
              <tr key={d.id}>
                <td className="px-5 py-3 text-white/80">{d.user.name}</td>
                <td className="px-5 py-3 text-white/60">{d.project.title}</td>
                <td className="px-5 py-3 font-[family-name:var(--font-mono)] text-white/50">{d.order.orderNumber}</td>
                <td className="px-5 py-3 text-white/40">{d.ipAddress ?? "—"}</td>
                <td className="px-5 py-3 text-white/40">{d.downloadedAt.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {downloads.length === 0 && <p className="p-10 text-center text-sm text-white/50">No downloads yet.</p>}
      </div>
    </div>
  );
}
