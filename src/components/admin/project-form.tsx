"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Plus, CheckCircle2, Image as ImageIcon, Video, Trash2, Link as LinkIcon } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/ui";

type Category = { id: string; name: string; slug: string };
type Technology = { id: string; name: string };

type ExistingProject = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  priceInPkr: number;
  version: string;
  categoryId: string | null;
  thumbnail: string | null;
  screenshots: string[] | null;
  demoVideoUrl: string | null;
  demoUrl: string | null;
  features: string[] | null;
  requirements: string[] | null;
  whatIsIncluded: string[] | null;
  published: boolean;
  featured: boolean;
  sourceCodePath: string | null;
  technologies: { technology: Technology }[];
  installationGuide?: { content: { text: string } } | null;
};

function linesToArray(text: string): string[] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

export function ProjectForm({ existing }: { existing?: ExistingProject }) {
  const router = useRouter();
  const isEdit = Boolean(existing);

  const [categories, setCategories] = useState<Category[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newTech, setNewTech] = useState("");

  const [title, setTitle] = useState(existing?.title ?? "");
  const [shortDescription, setShortDescription] = useState(existing?.shortDescription ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [priceInPkr, setPriceInPkr] = useState(existing?.priceInPkr ?? 0);
  const [version, setVersion] = useState(existing?.version ?? "1.0.0");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "");
  
  // Media States
  const [thumbnail, setThumbnail] = useState(existing?.thumbnail ?? "");
  const [screenshots, setScreenshots] = useState<string[]>((existing?.screenshots as string[]) ?? []);
  const [demoVideoUrl, setDemoVideoUrl] = useState(existing?.demoVideoUrl ?? "");
  const [demoUrl, setDemoUrl] = useState(existing?.demoUrl ?? "");

  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [features, setFeatures] = useState((existing?.features ?? []).join("\n"));
  const [requirements, setRequirements] = useState((existing?.requirements ?? []).join("\n"));
  const [whatIsIncluded, setWhatIsIncluded] = useState((existing?.whatIsIncluded ?? []).join("\n"));
  const [technologyIds, setTechnologyIds] = useState<string[]>(
    existing?.technologies.map((t) => t.technology.id) ?? []
  );
  const [published, setPublished] = useState(existing?.published ?? false);
  const [featured, setFeatured] = useState(existing?.featured ?? false);

  // Installation Guide
  const [installationGuide, setInstallationGuide] = useState(
    (existing?.installationGuide?.content as { text?: string } | null)?.text ?? ""
  );

  const [zipFile, setZipFile] = useState<File | null>(null);
  const [uploadingZip, setUploadingZip] = useState(false);
  const [zipStatus, setZipStatus] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/meta").then((r) => r.json()).then((d) => {
      setCategories(d.categories ?? []);
      setTechnologies(d.technologies ?? []);
    });
  }, []);

  async function handleFileUpload(file: File, type: "thumbnail" | "screenshot" | "video") {
    const formData = new FormData();
    formData.append("file", file);

    if (type === "thumbnail") setUploadingThumbnail(true);
    if (type === "screenshot") setUploadingScreenshot(true);
    if (type === "video") setUploadingVideo(true);

    try {
      const res = await fetch("/api/admin/projects/upload-media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "File upload failed.");
        return;
      }

      if (type === "thumbnail") setThumbnail(data.url);
      if (type === "screenshot") setScreenshots((prev) => [...prev, data.url]);
      if (type === "video") setDemoVideoUrl(data.url);
    } catch {
      alert("Network error during file upload.");
    } finally {
      if (type === "thumbnail") setUploadingThumbnail(false);
      if (type === "screenshot") setUploadingScreenshot(false);
      if (type === "video") setUploadingVideo(false);
    }
  }

  async function addCategory() {
    if (!newCategory.trim()) return;
    const res = await fetch("/api/admin/categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setCategories((c) => [...c, data.category]);
      setCategoryId(data.category.id);
      setNewCategory("");
    }
  }

  async function addTechnology() {
    if (!newTech.trim()) return;
    const res = await fetch("/api/admin/technologies", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTech.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setTechnologies((t) => [...t, data.technology]);
      setTechnologyIds((ids) => [...ids, data.technology.id]);
      setNewTech("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title,
      shortDescription,
      description,
      priceInPkr: Number(priceInPkr),
      version,
      categoryId: categoryId || undefined,
      thumbnail: thumbnail || "",
      screenshots,
      demoVideoUrl: demoVideoUrl || "",
      demoUrl: demoUrl || "",
      features: linesToArray(features),
      requirements: linesToArray(requirements),
      whatIsIncluded: linesToArray(whatIsIncluded),
      technologyIds,
      published,
      featured,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/projects/${existing!.id}` : "/api/admin/projects", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed.");
        setSaving(false);
        return;
      }

      const projectId = isEdit ? existing!.id : data.project.id;

      // Save installation guide if provided
      if (installationGuide.trim()) {
        await fetch(`/api/admin/projects/${projectId}/installation-guide`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: { text: installationGuide.trim() } }),
        });
      }

      if (zipFile) {
        await uploadZip(projectId);
      }

      router.push("/admin/projects");
      router.refresh();
    } catch {
      setError("Network error.");
      setSaving(false);
    }
  }

  async function uploadZip(projectId: string) {
    if (!zipFile) return;
    setUploadingZip(true);
    const formData = new FormData();
    formData.append("zip", zipFile);
    const res = await fetch(`/api/admin/projects/${projectId}/upload-source`, { method: "POST", body: formData });
    setUploadingZip(false);
    if (res.ok) setZipStatus("Source code uploaded.");
    else setZipStatus("Upload failed — you can retry from the edit page.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* BASIC DETAILS */}
      <div className="terminal-frame grid gap-5 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-200">Title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-white/15 bg-surface-2 px-4 py-3 text-sm text-white focus:border-signal focus:outline-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-200">Short description (max 200 chars)</label>
          <input required maxLength={200} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="w-full rounded-xl border border-white/15 bg-surface-2 px-4 py-3 text-sm text-white focus:border-signal focus:outline-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-200">Full description</label>
          <textarea required rows={6} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-white/15 bg-surface-2 px-4 py-3 text-sm text-white focus:border-signal focus:outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-200">Price (PKR)</label>
          <input type="number" required min={1} value={priceInPkr} onChange={(e) => setPriceInPkr(Number(e.target.value))} className="w-full rounded-xl border border-white/15 bg-surface-2 px-4 py-3 text-sm text-white focus:border-signal focus:outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-200">Version</label>
          <input value={version} onChange={(e) => setVersion(e.target.value)} className="w-full rounded-xl border border-white/15 bg-surface-2 px-4 py-3 text-sm text-white focus:border-signal focus:outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-200">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-xl border border-white/15 bg-surface-2 px-4 py-3 text-sm text-white focus:border-signal focus:outline-none">
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="mt-2 flex gap-2">
            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category name" className="flex-1 rounded-lg border border-white/15 bg-surface-2 px-3 py-2 text-xs text-white focus:border-signal focus:outline-none" />
            <button type="button" onClick={addCategory} className="rounded-lg border border-white/15 px-3 text-white hover:border-signal"><Plus className="h-4 w-4" /></button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-200">Live Demo URL (optional)</label>
          <input value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} placeholder="https://demo.example.com" className="w-full rounded-xl border border-white/15 bg-surface-2 px-4 py-3 text-sm text-white focus:border-signal focus:outline-none" />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-200">Technologies</label>
          <div className="flex flex-wrap gap-2">
            {technologies.map((t) => {
              const active = technologyIds.includes(t.id);
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTechnologyIds((ids) => active ? ids.filter((id) => id !== t.id) : [...ids, t.id])}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${active ? "border-signal bg-signal/15 text-signal" : "border-white/15 text-white/60 hover:border-white/30"}`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex gap-2">
            <input value={newTech} onChange={(e) => setNewTech(e.target.value)} placeholder="New technology name" className="flex-1 rounded-lg border border-white/15 bg-surface-2 px-3 py-2 text-xs text-white focus:border-signal focus:outline-none" />
            <button type="button" onClick={addTechnology} className="rounded-lg border border-white/15 px-3 text-white hover:border-signal"><Plus className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* MEDIA UPLOAD SECTION (Thumbnail Image, Screenshots & Demo Video) */}
      <div className="terminal-frame flex flex-col gap-6 p-6">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <ImageIcon className="h-5 w-5 text-signal" />
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
            Project Media & Preview Images
          </h2>
        </div>

        {/* THUMBNAIL IMAGE (Shows at the top of cards & details) */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-200">
            Main Project Thumbnail (Image displayed at the top)
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-surface-2 p-6 text-sm text-white/70 transition hover:border-signal/50 hover:bg-surface-2/80">
                <Upload className="h-5 w-5 text-signal" />
                {uploadingThumbnail ? "Uploading Image..." : "Upload Thumbnail Image (PNG, JPG, WebP)"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, "thumbnail");
                  }}
                />
              </label>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Or paste image URL (e.g. https://...)"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="flex-1 rounded-xl border border-white/15 bg-surface-2 px-3 py-2 text-xs text-white focus:border-signal focus:outline-none"
                />
              </div>
            </div>

            {/* Thumbnail Preview */}
            <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-white/15 bg-surface-2 flex items-center justify-center">
              {thumbnail ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbnail} alt="Thumbnail preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setThumbnail("")}
                    className="absolute right-2 top-2 rounded-lg bg-black/80 p-1.5 text-red-400 hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-xs text-white/30">
                  <ImageIcon className="h-8 w-8 text-white/20" />
                  No Thumbnail Uploaded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DEMO VIDEO */}
        <div className="border-t border-white/10 pt-4">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-200">
            Project Demo Video (MP4 upload or Video Link)
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-surface-2 p-5 text-sm text-white/70 transition hover:border-signal/50 hover:bg-surface-2/80">
                <Video className="h-5 w-5 text-signal" />
                {uploadingVideo ? "Uploading Video..." : "Upload Demo Video (MP4 / WebM)"}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, "video");
                  }}
                />
              </label>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Or paste video URL (MP4, YouTube, Vimeo)"
                  value={demoVideoUrl}
                  onChange={(e) => setDemoVideoUrl(e.target.value)}
                  className="flex-1 rounded-xl border border-white/15 bg-surface-2 px-3 py-2 text-xs text-white focus:border-signal focus:outline-none"
                />
              </div>
            </div>

            {/* Video Preview */}
            <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-white/15 bg-surface-2 flex items-center justify-center">
              {demoVideoUrl ? (
                <div className="relative h-full w-full">
                  <video src={demoVideoUrl} controls className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setDemoVideoUrl("")}
                    className="absolute right-2 top-2 rounded-lg bg-black/80 p-1.5 text-red-400 hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-xs text-white/30">
                  <Video className="h-8 w-8 text-white/20" />
                  No Video Uploaded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SCREENSHOTS GALLERY */}
        <div className="border-t border-white/10 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-200">
              Additional Screenshots Gallery
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-surface-2 px-3 py-1.5 text-xs text-white hover:border-signal">
              <Upload className="h-3.5 w-3.5 text-signal" />
              {uploadingScreenshot ? "Uploading..." : "Add Screenshot"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f, "screenshot");
                }}
              />
            </label>
          </div>

          {screenshots.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {screenshots.map((src, idx) => (
                <div key={idx} className="group relative aspect-video overflow-hidden rounded-xl border border-white/15 bg-surface-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Screenshot ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setScreenshots((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute right-1.5 top-1.5 rounded-lg bg-black/80 p-1 text-red-400 opacity-0 transition group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/15 p-4 text-center text-xs text-white/30">
              No additional screenshots added yet.
            </div>
          )}
        </div>
      </div>

      {/* FEATURES, REQUIREMENTS, INCLUDED */}
      <div className="terminal-frame grid gap-4 p-6 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-200">Features (one per line)</label>
          <textarea rows={6} value={features} onChange={(e) => setFeatures(e.target.value)} className="w-full rounded-xl border border-white/15 bg-surface-2 px-3 py-2.5 text-xs text-white focus:border-signal focus:outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-200">Requirements (one per line)</label>
          <textarea rows={6} value={requirements} onChange={(e) => setRequirements(e.target.value)} className="w-full rounded-xl border border-white/15 bg-surface-2 px-3 py-2.5 text-xs text-white focus:border-signal focus:outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-200">What&apos;s included (one per line)</label>
          <textarea rows={6} value={whatIsIncluded} onChange={(e) => setWhatIsIncluded(e.target.value)} className="w-full rounded-xl border border-white/15 bg-surface-2 px-3 py-2.5 text-xs text-white focus:border-signal focus:outline-none" />
        </div>
      </div>

      {/* INSTALLATION GUIDE */}
      <div className="terminal-frame p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-signal/15 text-signal text-xs font-bold">📖</span>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-200">Installation Guide</label>
          <span className="ml-1 rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/40">Optional — shown to buyers after purchase</span>
        </div>
        <p className="mb-3 text-xs text-white/40">Write step-by-step installation instructions. Supports plain text — each line becomes a step. This is only visible to users who have purchased the project.</p>
        <textarea
          rows={10}
          value={installationGuide}
          onChange={(e) => setInstallationGuide(e.target.value)}
          placeholder={`Step 1: Clone the repository\ngit clone https://github.com/...\n\nStep 2: Install dependencies\nnpm install\n\nStep 3: Configure environment\nCopy .env.example to .env and fill in your values.\n\nStep 4: Run the project\nnpm run dev`}
          className="w-full rounded-xl border border-white/15 bg-surface-2 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-signal focus:outline-none font-[family-name:var(--font-mono)] leading-relaxed"
        />
      </div>

      {/* PUBLISHED / FEATURED */}
      <div className="terminal-frame flex flex-wrap items-center gap-6 p-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-white">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 accent-[#63f2c0]" /> Published
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-white">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-[#63f2c0]" /> Featured
        </label>
      </div>

      {/* SOURCE CODE ZIP */}
      <div className="terminal-frame p-6">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-200">Source code (.zip) — stored privately, never public</label>
        {existing?.sourceCodePath && !zipFile && (
          <p className="mb-2 text-xs font-medium text-signal">A source ZIP is already uploaded for this project.</p>
        )}
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 bg-surface-2 px-4 py-4 text-sm text-white/70 hover:border-signal">
          <Upload className="h-5 w-5 text-signal" />
          {zipFile ? (
            <span className="flex items-center gap-1 font-semibold text-white"><CheckCircle2 className="h-4 w-4 text-signal" /> {zipFile.name}</span>
          ) : "Choose a .zip file"}
          <input type="file" accept=".zip" className="hidden" onChange={(e) => setZipFile(e.target.files?.[0] ?? null)} />
        </label>
        {uploadingZip && <p className="mt-2 text-xs text-white/40">Uploading source code…</p>}
        {zipStatus && <p className="mt-2 text-xs text-signal">{zipStatus}</p>}
      </div>

      {error && <p className="text-sm font-semibold text-red-400">{error}</p>}

      <div className="flex gap-3">
        <SecondaryButton type="button" onClick={() => router.push("/admin/projects")}>Cancel</SecondaryButton>
        <PrimaryButton type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Project"}
        </PrimaryButton>
      </div>
    </form>
  );
}
