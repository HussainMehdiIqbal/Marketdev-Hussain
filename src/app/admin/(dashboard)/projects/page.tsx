import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminProjectsClient } from "./projects-client";

export default async function AdminProjectsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin/login");

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return <AdminProjectsClient initialProjects={projects} />;
}
