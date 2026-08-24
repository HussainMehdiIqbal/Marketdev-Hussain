import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const technology = searchParams.get("technology") || undefined;
  const sort = searchParams.get("sort") || "newest"; // newest | price_asc | price_desc

  const where: Prisma.ProjectWhereInput = {
    published: true,
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { shortDescription: { contains: q } },
          ],
        }
      : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(technology ? { technologies: { some: { technology: { name: technology } } } } : {}),
  };

  const orderBy: Prisma.ProjectOrderByWithRelationInput =
    sort === "price_asc"
      ? { priceInPkr: "asc" }
      : sort === "price_desc"
      ? { priceInPkr: "desc" }
      : { createdAt: "desc" };

  const projects = await prisma.project.findMany({
    where,
    orderBy,
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      thumbnail: true,
      priceInPkr: true,
      featured: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
      technologies: { select: { technology: { select: { name: true, icon: true } } } },
      // sourceCodePath intentionally excluded — never sent to the client
    },
  });

  return NextResponse.json({ projects });
}
