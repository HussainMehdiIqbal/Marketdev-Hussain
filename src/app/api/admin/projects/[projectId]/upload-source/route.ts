import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveSourceCodeZip } from "@/lib/storage";

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

  const formData = await req.formData();
  const file = formData.get("zip");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "A .zip file is required." }, { status: 400 });
  }

  let storedPath: string;
  try {
    storedPath = await saveSourceCodeZip(file);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 400 }
    );
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { sourceCodePath: storedPath },
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
