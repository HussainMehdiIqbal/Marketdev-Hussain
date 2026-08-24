import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validation";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { category: true, technologies: { include: { technology: true } }, installationGuide: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ project });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = projectSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data." },
      { status: 400 }
    );
  }

  const { technologyIds, ...data } = parsed.data;

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...data,
      thumbnail: data.thumbnail !== undefined ? (data.thumbnail || null) : undefined,
      screenshots: data.screenshots !== undefined ? data.screenshots : undefined,
      demoVideoUrl: data.demoVideoUrl !== undefined ? (data.demoVideoUrl || null) : undefined,
      demoUrl: data.demoUrl || undefined,
      ...(technologyIds
        ? {
            technologies: {
              deleteMany: {},
              create: technologyIds.map((technologyId) => ({ technologyId })),
            },
          }
        : {}),
    },
  });

  await prisma.adminLog.create({
    data: {
      adminId: session.user.id,
      action: "UPDATE_PROJECT",
      targetType: "Project",
      targetId: project.id,
    },
  });

  return NextResponse.json({ project });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  try {
    // Must delete in dependency order to avoid FK constraint errors:
    // Downloads → Licenses → Payments → Orders → InstallationGuide → ProjectTechnologies → Project

    // 1. Get all orders for this project
    const orders = await prisma.order.findMany({
      where: { projectId },
      select: { id: true },
    });
    const orderIds = orders.map((o) => o.id);

    // 2. Delete downloads linked to this project's orders (or directly to project)
    await prisma.download.deleteMany({
      where: { OR: [{ projectId }, { orderId: { in: orderIds } }] },
    });

    // 3. Delete licenses linked to those orders
    if (orderIds.length > 0) {
      await prisma.license.deleteMany({ where: { orderId: { in: orderIds } } });
    }

    // 4. Delete payments linked to those orders
    if (orderIds.length > 0) {
      await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
    }

    // 5. Delete orders
    await prisma.order.deleteMany({ where: { projectId } });

    // 6. Delete installation guide (cascades automatically but just in case)
    await prisma.installationGuide.deleteMany({ where: { projectId } });

    // 7. Delete project technology links
    await prisma.projectTechnology.deleteMany({ where: { projectId } });

    // 8. Finally delete the project itself
    await prisma.project.delete({ where: { id: projectId } });

    // 9. Log the action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "DELETE_PROJECT",
        targetType: "Project",
        targetId: projectId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE project]", err);
    return NextResponse.json({ error: "Failed to delete project." }, { status: 500 });
  }
}

