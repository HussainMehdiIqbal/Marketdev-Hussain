import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = (body?.name as string | undefined)?.trim();
  if (!name || name.length < 1) {
    return NextResponse.json({ error: "Technology name is required." }, { status: 400 });
  }

  const technology = await prisma.technology.upsert({
    where: { name },
    update: {},
    create: { name },
  });

  return NextResponse.json({ technology }, { status: 201 });
}
