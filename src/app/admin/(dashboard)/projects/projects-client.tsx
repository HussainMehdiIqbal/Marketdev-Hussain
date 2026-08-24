"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SectionHeading, Badge, PrimaryButton } from "@/components/ui";
import { formatPkr } from "@/lib/utils";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";

interface Project {
  id: string;
  title: string;
  priceInPkr: number;
  published: boolean;
  featured: boolean;
  sourceCodePath: string | null;
  category: { id: string; name: string } | null;
}

export function AdminProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?\n\nThis will permanently remove the project, source code, and all related orders.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        startTransition(() => router.refresh());
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete project.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <SectionHeading eyebrow="Catalog" title="Projects" />
        <Link href="/admin/projects/new">
          <PrimaryButton><Plus className="h-4 w-4" /> New Project</PrimaryButton>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="terminal-frame p-10 text-center text-sm text-white/50">No projects yet.</div>
      ) : (
        <div className="terminal-frame overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projects.map((p) => (
                <tr key={p.id} className="group transition hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-medium text-white">{p.title}</td>
                  <td className="px-5 py-3 text-white/50">{p.category?.name ?? "—"}</td>
                  <td className="px-5 py-3 font-[family-name:var(--font-mono)] text-white/70">
                    {formatPkr(p.priceInPkr)}
                  </td>
                  <td className="px-5 py-3">
                    {p.sourceCodePath
                      ? <Badge tone="success">Uploaded</Badge>
                      : <Badge tone="warning">Missing</Badge>}
                  </td>
                  <td className="px-5 py-3">
                    {p.published
                      ? <Badge tone="success">Published</Badge>
                      : <Badge>Draft</Badge>}
                    {p.featured && <span className="ml-1"><Badge tone="warning">Featured</Badge></span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/projects/${p.id}/edit`}
                        className="flex items-center gap-1.5 text-sm text-signal hover:text-signal/80 transition"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        disabled={deletingId === p.id}
                        className="flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 transition hover:border-red-500/50 hover:bg-red-950/40 disabled:opacity-50"
                      >
                        {deletingId === p.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
