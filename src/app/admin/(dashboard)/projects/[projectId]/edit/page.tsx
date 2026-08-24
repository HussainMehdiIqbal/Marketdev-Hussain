import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui";
import { ProjectForm } from "@/components/admin/project-form";

export default async function EditProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin/login");

  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      technologies: { include: { technology: true } },
      installationGuide: true,
    },
  });
  if (!project) notFound();

  return (
    <div>
      <SectionHeading eyebrow="Catalog" title={`Edit: ${project.title}`} />
      <ProjectForm
        existing={{
          id: project.id,
          title: project.title,
          shortDescription: project.shortDescription,
          description: project.description,
          priceInPkr: project.priceInPkr,
          version: project.version,
          categoryId: project.categoryId,
          thumbnail: project.thumbnail,
          screenshots: project.screenshots as string[] | null,
          demoVideoUrl: project.demoVideoUrl,
          demoUrl: project.demoUrl,
          features: project.features as string[] | null,
          requirements: project.requirements as string[] | null,
          whatIsIncluded: project.whatIsIncluded as string[] | null,
          published: project.published,
          featured: project.featured,
          sourceCodePath: project.sourceCodePath,
          technologies: project.technologies,
          installationGuide: project.installationGuide
            ? { content: project.installationGuide.content as { text: string } }
            : null,
        }}
      />
    </div>
  );
}
