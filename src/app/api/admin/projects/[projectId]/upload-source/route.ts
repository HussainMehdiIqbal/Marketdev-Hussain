import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { url } = await req.json().catch(() => ({ url: null }));
  if (!url || typeof url !== "string" || !url.includes(".blob.vercel-storage.com/")) {
    return NextResponse.json({ error: "A valid uploaded file URL is required." }, { status: 400 });
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { sourceCodePath: url },
  });

  await prisma.adminLog.create({
    data: {
      adminId: session.user.id,
      action: "UPLOAD_SOURCE_CODE",
      targetType: "Project",
      targetId: projectId,
    },
  });

  return NextResponse.json({ success: true });
}
