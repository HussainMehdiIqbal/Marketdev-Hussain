import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Lock, Layers, FileText, Video as VideoIcon, Image as ImageIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatPkr } from "@/lib/utils";
import { Badge, Eyebrow } from "@/components/ui";
import { BuyNowButton } from "@/components/buy-now-button";
import { InstallationGuideRenderer } from "@/components/installation-guide-renderer";

export const revalidate = 60;

async function getProject(slug: string) {
  return prisma.project.findFirst({
    where: { slug, published: true },
    include: {
      category: true,
      technologies: { include: { technology: true } },
      installationGuide: true,
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.shortDescription,
    openGraph: { title: project.title, description: project.shortDescription },
  };
}

export default async function ProjectDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const session = await auth();
  let userOrder = null;
  if (session?.user?.id) {
    userOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        projectId: project.id,
        status: { notIn: ["EXPIRED", "REJECTED"] },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true },
    });
  }

  const features = (project.features as string[] | null) ?? [];
  const requirements = (project.requirements as string[] | null) ?? [];
  const whatIsIncluded = (project.whatIsIncluded as string[] | null) ?? [];
  const screenshots = (project.screenshots as string[] | null) ?? [];

  const isPurchased = userOrder ? ["VERIFIED", "COMPLETED"].includes(userOrder.status) : false;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Eyebrow className="mb-3">{project.category?.name ?? "Project"}</Eyebrow>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white sm:text-4xl">
            {project.title}
          </h1>
          <p className="mt-3 text-base text-[var(--text-dim)]">{project.shortDescription}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.technologies.map((t) => (
              <span
                key={t.technology.id}
                className="rounded-full border border-white/10 px-2.5 py-1 font-[family-name:var(--font-mono)] text-[11px] text-white/60"
              >
                {t.technology.name}
              </span>
            ))}
          </div>

          {/* MAIN THUMBNAIL PREVIEW (Displayed at top) */}
          <div className="terminal-frame mt-8 overflow-hidden">
            <div className="terminal-titlebar">
              <span className="terminal-dot bg-[#ff5f56]" />
              <span className="terminal-dot bg-[#ffbd2e]" />
              <span className="terminal-dot bg-[#27c93f]" />
              <span className="ml-2 font-[family-name:var(--font-mono)] text-[11px] text-white/40">{project.slug}-preview.png</span>
            </div>
            <div className="aspect-video bg-surface-2">
              {project.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.thumbnail} alt={project.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 h-full w-full text-white/20">
                  <ImageIcon className="h-10 w-10 text-white/20" />
                  <span>No preview thumbnail uploaded</span>
                </div>
              )}
            </div>
          </div>

          {/* DEMO VIDEO PLAYER (Under main preview) */}
          {project.demoVideoUrl && (
            <div className="terminal-frame mt-6 overflow-hidden">
              <div className="terminal-titlebar">
                <span className="terminal-dot bg-[#ff5f56]" />
                <span className="terminal-dot bg-[#ffbd2e]" />
                <span className="terminal-dot bg-[#27c93f]" />
                <span className="ml-2 flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-[11px] text-signal">
                  <VideoIcon className="h-3.5 w-3.5" /> Project Demo Video
                </span>
              </div>
              <div className="aspect-video bg-black">
                {project.demoVideoUrl.includes("youtube.com") || project.demoVideoUrl.includes("youtu.be") ? (
                  <iframe
                    src={project.demoVideoUrl.replace("watch?v=", "embed/")}
                    title="Demo Video"
                    className="h-full w-full"
                    allowFullScreen
                  />
                ) : (
                  <video src={project.demoVideoUrl} controls className="h-full w-full object-contain" />
                )}
              </div>
            </div>
          )}

          {/* SCREENSHOTS GALLERY */}
          {screenshots.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                Project Screenshots
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {screenshots.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`Screenshot ${i + 1}`}
                    className="aspect-video rounded-xl border border-white/10 bg-surface-2 object-cover shadow-lg transition duration-300 hover:scale-[1.03] hover:border-signal/40"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mt-10">
            <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-white">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-dim)]">{project.description}</p>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-white">Features</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {requirements.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-3 flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                <Layers className="h-5 w-5 text-signal" /> Requirements
              </h2>
              <ul className="space-y-1.5 text-sm text-white/70">
                {requirements.map((r, i) => <li key={i}>• {r}</li>)}
              </ul>
            </div>
          )}

          {/* What's included */}
          {whatIsIncluded.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-3 flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                <FileText className="h-5 w-5 text-signal" /> What&apos;s Included
              </h2>
              <ul className="space-y-1.5 text-sm text-white/70">
                {whatIsIncluded.map((w, i) => <li key={i}>• {w}</li>)}
              </ul>
            </div>
          )}

          {/* Installation guide section */}
          <div className="mt-10">
            <h2 className="mb-3 font-[family-name:var(--font-display)] text-xl font-semibold text-white">Installation Guide</h2>
            {isPurchased ? (
              <div className="terminal-frame p-6 sm:p-8">
                <InstallationGuideRenderer content={project.installationGuide?.content} />
              </div>
            ) : (
              <div className="terminal-frame flex items-center gap-3 p-6">
                <Lock className="h-5 w-5 shrink-0 text-white/40" />
                <p className="text-sm text-[var(--text-dim)]">
                  The full step-by-step installation guide unlocks after your purchase is verified —
                  covering setup, environment variables, database import and troubleshooting.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sticky purchase panel */}
        <div className="h-fit lg:sticky lg:top-24">
          <div className="terminal-frame p-6">
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-mono)] text-2xl font-semibold text-white">
                {formatPkr(project.priceInPkr)}
              </span>
              <Badge>v{project.version}</Badge>
            </div>
            <p className="mt-1 text-xs text-white/40">One-time payment · license: {project.license.replace(/_/g, " ").toLowerCase()}</p>

            <div className="mt-6">
              <BuyNowButton projectId={project.id} userOrder={userOrder} />
            </div>

            <ul className="mt-6 space-y-2 text-xs text-white/50">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-signal" /> Full source code ZIP</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-signal" /> Installation guide access</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-signal" /> Licensed download tied to your account</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-signal" /> Manual payment verification, up to 30 min</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
