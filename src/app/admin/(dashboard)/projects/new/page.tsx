import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SectionHeading } from "@/components/ui";
import { ProjectForm } from "@/components/admin/project-form";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin/login");

  return (
    <div>
      <SectionHeading eyebrow="Catalog" title="New Project" />
      <ProjectForm />
    </div>
  );
}
