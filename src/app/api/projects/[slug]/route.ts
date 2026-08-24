import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const project = await prisma.project.findFirst({
    where: { slug, published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      description: true,
      features: true,
      requirements: true,
      whatIsIncluded: true,
      thumbnail: true,
      screenshots: true,
      demoVideoUrl: true,
      demoUrl: true,
      priceInPkr: true,
      version: true,
      license: true,
      updatedAt: true,
      category: { select: { name: true, slug: true } },
      technologies: { select: { technology: { select: { name: true, icon: true } } } },
      installationGuide: {
        select: { privateToPurchasers: true, content: true },
      },
      // sourceCodePath intentionally excluded — never sent to the client
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  // Strip the installation guide content if it's gated to purchasers only —
  // the details page only shows a locked preview, not the full guide.
  const responseProject = {
    ...project,
    installationGuide: project.installationGuide
      ? {
          privateToPurchasers: project.installationGuide.privateToPurchasers,
          content: project.installationGuide.privateToPurchasers
            ? null
            : project.installationGuide.content,
        }
      : null,
  };

  return NextResponse.json({ project: responseProject });
}
