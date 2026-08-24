import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, technologies: { include: { technology: true } } },
  });

  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid project data." },
      { status: 400 }
    );
  }

  const { technologyIds, ...data } = parsed.data;

  let slug = slugify(data.title);
  const existing = await prisma.project.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const project = await prisma.project.create({
    data: {
      title: data.title,
      slug,
      shortDescription: data.shortDescription,
      description: data.description,
      priceInPkr: data.priceInPkr,
      version: data.version,
      categoryId: data.categoryId || null,
      thumbnail: data.thumbnail || null,
      screenshots: data.screenshots || [],
      demoVideoUrl: data.demoVideoUrl || null,
      demoUrl: data.demoUrl || null,
      features: data.features,
      requirements: data.requirements,
      whatIsIncluded: data.whatIsIncluded,
      published: data.published,
      featured: data.featured,
      technologies: {
        create: technologyIds.map((technologyId) => ({ technologyId })),
      },
    },
  });

  await prisma.adminLog.create({
    data: {
      adminId: session.user.id,
      action: "CREATE_PROJECT",
      targetType: "Project",
      targetId: project.id,
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
