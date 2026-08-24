import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ unreadNotifications: 0, pendingOrders: 0, unreadContacts: 0 });
  }

  try {
    const [unreadNotifications, pendingOrders, unreadContacts] = await Promise.all([
      prisma.notification.count({ where: { audience: "admin", read: false } }),
      prisma.order.count({ where: { status: "PENDING_VERIFICATION" } }),
      prisma.contactMessage.count({ where: { read: false } }),
    ]);

    return NextResponse.json({ unreadNotifications, pendingOrders, unreadContacts });
  } catch {
    return NextResponse.json({ unreadNotifications: 0, pendingOrders: 0, unreadContacts: 0 });
  }
}
