"use client";

import { useEffect, useState, useCallback } from "react";
import { ProjectCard } from "@/components/project-card";
import { ProjectFilters } from "@/components/project-filters";
import type { ProjectSummary } from "@/lib/types";

export function ProjectsBrowser() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [technologies, setTechnologies] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [technology, setTechnology] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetch("/api/meta")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories ?? []);
        setTechnologies(d.technologies ?? []);
      })
      .catch(() => {});
  }, []);

  const fetchProjects = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (technology) params.set("technology", technology);
    if (sort) params.set("sort", sort);

    fetch(`/api/projects?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setProjects(d.projects ?? []))
      .finally(() => setLoading(false));
  }, [q, category, technology, sort]);

  useEffect(() => {
    const timeout = setTimeout(fetchProjects, 250);
    return () => clearTimeout(timeout);
  }, [fetchProjects]);

  return (
    <div>
      <ProjectFilters
        q={q} setQ={setQ}
        category={category} setCategory={setCategory}
        technology={technology} setTechnology={setTechnology}
        sort={sort} setSort={setSort}
        categories={categories}
        technologies={technologies}
      />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="terminal-frame h-80 animate-pulse bg-surface-2" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="terminal-frame flex flex-col items-center gap-2 p-16 text-center">
          <p className="font-[family-name:var(--font-display)] text-lg text-white">No projects match those filters.</p>
          <p className="text-sm text-[var(--text-dim)]">Try clearing a filter or searching a different term.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
