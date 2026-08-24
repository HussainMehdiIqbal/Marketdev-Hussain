import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui";
import { ProjectsBrowser } from "@/components/projects-browser";

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse complete software projects with source code, documentation and installation guides.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <SectionHeading
        eyebrow="Catalog"
        title="All Projects"
        description="Filter by category, technology or price to find the right codebase."
      />
      <ProjectsBrowser />
    </div>
  );
}
