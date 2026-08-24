"use client";

import { Search } from "lucide-react";

type Props = {
  q: string;
  setQ: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  technology: string;
  setTechnology: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  categories: { name: string; slug: string }[];
  technologies: { name: string }[];
};

export function ProjectFilters({
  q, setQ, category, setCategory, technology, setTechnology, sort, setSort, categories, technologies,
}: Props) {
  return (
    <div className="terminal-frame mb-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects..."
          className="w-full rounded-lg border border-white/10 bg-surface-2 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:border-signal/50 focus:outline-none"
        />
      </div>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white/80 focus:border-signal/50 focus:outline-none"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
      </select>

      <select
        value={technology}
        onChange={(e) => setTechnology(e.target.value)}
        className="rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white/80 focus:border-signal/50 focus:outline-none"
      >
        <option value="">All technologies</option>
        {technologies.map((t) => (
          <option key={t.name} value={t.name}>{t.name}</option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white/80 focus:border-signal/50 focus:outline-none"
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
