import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.adminLog.deleteMany({});
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE activity logs]", err);
    return NextResponse.json({ error: "Failed to clear logs." }, { status: 500 });
  }
}
