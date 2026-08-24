import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const wantsAdmin = searchParams.get("audience") === "admin";

  if (wantsAdmin && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: wantsAdmin ? { audience: "admin" } : { userId: session.user.id, audience: "user" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ notifications });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const id = body?.id as string | undefined;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = notification.userId === session.user.id;
  const isAdminInbox = notification.audience === "admin" && session.user.role === "ADMIN";
  if (!isOwner && !isAdminInbox) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.notification.update({ where: { id }, data: { read: true } });
  return NextResponse.json({ success: true });
}
