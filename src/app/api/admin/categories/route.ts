import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = (body?.name as string | undefined)?.trim();
  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Category name is required." }, { status: 400 });
  }

  const slug = slugify(name);
  const category = await prisma.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });

  return NextResponse.json({ category }, { status: 201 });
}
