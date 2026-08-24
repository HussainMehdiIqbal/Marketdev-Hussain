import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatPkr } from "@/lib/utils";
import type { ProjectSummary } from "@/lib/types";

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group terminal-frame flex flex-col transition duration-300 hover:-translate-y-1 hover:border-signal/40 hover:shadow-[0_0_40px_-12px_rgba(99,242,192,0.35)]"
    >
      <div className="terminal-titlebar">
        <span className="terminal-dot bg-[#ff5f56]" />
        <span className="terminal-dot bg-[#ffbd2e]" />
        <span className="terminal-dot bg-[#27c93f]" />
        <span className="ml-2 truncate font-[family-name:var(--font-mono)] text-[11px] text-white/40">
          {project.slug}.zip
        </span>
      </div>

      <div className="relative aspect-video overflow-hidden bg-surface-2">
        {project.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnail}
            alt={project.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-mono)] text-xs text-white/20">
            no preview
          </div>
        )}
        {project.featured && (
          <span className="absolute left-3 top-3 rounded-full border border-signal/40 bg-black/60 px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wide text-signal backdrop-blur">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            {project.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-[var(--text-dim)]">{project.shortDescription}</p>
        </div>

        {project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 4).map((t) => (
              <span
                key={t.technology.name}
                className="rounded-full border border-white/10 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-white/50"
              >
                {t.technology.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
          <span className="font-[family-name:var(--font-mono)] text-base font-semibold text-white">
            {formatPkr(project.priceInPkr)}
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-signal">
            View <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
