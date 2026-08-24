import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminNotificationsClient } from "./notifications-client";

export default async function AdminNotificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin/login");

  const notifications = await prisma.notification.findMany({
    where: { audience: "admin" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <AdminNotificationsClient initialNotifications={notifications} />;
}
