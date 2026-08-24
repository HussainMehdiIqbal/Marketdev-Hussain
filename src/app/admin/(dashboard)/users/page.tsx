import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin/login");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <SectionHeading eyebrow="Accounts" title="Users" />
      <div className="terminal-frame overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Orders</th>
              <th className="px-5 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3 font-medium text-white">{u.name}</td>
                <td className="px-5 py-3 text-white/60">{u.email}</td>
                <td className="px-5 py-3 text-white/60">{u.role}</td>
                <td className="px-5 py-3 text-white/60">{u._count.orders}</td>
                <td className="px-5 py-3 text-white/40">{u.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
