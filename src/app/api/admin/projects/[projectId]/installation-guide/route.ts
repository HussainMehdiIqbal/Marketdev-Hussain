import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT — create or update installation guide for a project
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const body = await req.json();
  const { content } = body;

  if (!content) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  // Upsert — create if not exists, update if it does
  const guide = await prisma.installationGuide.upsert({
    where: { projectId },
    create: {
      projectId,
      content,
      privateToPurchasers: true,
    },
    update: {
      content,
    },
  });

  return NextResponse.json({ guide });
}

// GET — fetch installation guide for a project
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  const guide = await prisma.installationGuide.findUnique({
    where: { projectId },
  });

  return NextResponse.json({ guide });
}
