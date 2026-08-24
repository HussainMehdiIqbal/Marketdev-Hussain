import Link from "next/link";
import { ShieldCheck, Zap, Lock, Code2, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading, Eyebrow } from "@/components/ui";
import { FaqAccordion } from "@/components/faq-accordion";
import { HeroSceneClient } from "@/components/hero-scene-client";
import { formatPkr } from "@/lib/utils";

export const revalidate = 60;

async function getHomeData() {
  const [featured, latest, projectCount, technologies] = await Promise.all([
    prisma.project.findMany({
      where: { published: true, featured: true },
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, slug: true, shortDescription: true, thumbnail: true,
        priceInPkr: true, featured: true, createdAt: true,
        category: { select: { name: true, slug: true } },
        technologies: { select: { technology: { select: { name: true, icon: true } } } },
      },
    }),
    prisma.project.findMany({
      where: { published: true },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, slug: true, shortDescription: true, thumbnail: true,
        priceInPkr: true, featured: true, createdAt: true,
        category: { select: { name: true, slug: true } },
        technologies: { select: { technology: { select: { name: true, icon: true } } } },
      },
    }),
    prisma.project.count({ where: { published: true } }),
    prisma.technology.findMany({ take: 12 }),
  ]);

  return { featured, latest, projectCount, technologies };
}

export default async function HomePage() {
  const { featured, latest, projectCount, technologies } = await getHomeData();
  const displayProjects = featured.length > 0 ? featured : latest.slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="grid-atmosphere absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-2 lg:items-center lg:pt-24">
          <div>
            <Eyebrow className="mb-5">Developer-built. Developer-sold.</Eyebrow>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Premium Projects.
              <br />
              <span className="text-signal">Production-Ready Code.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[var(--text-dim)]">
              Explore, purchase and download complete software projects with source
              code, documentation and installation guides.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-full bg-signal px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
              >
                Explore Projects
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/30"
              >
                View My Work
              </Link>
            </div>
            <div className="mt-10 flex gap-8 font-[family-name:var(--font-mono)] text-xs text-white/40">
              <div><span className="text-lg text-white">{projectCount}+</span><br />projects listed</div>
              <div><span className="text-lg text-white">PKR</span><br />local checkout</div>
              <div><span className="text-lg text-white">100%</span><br />manual verification</div>
            </div>
          </div>

          <div className="terminal-frame">
            <div className="terminal-titlebar">
              <span className="terminal-dot bg-[#ff5f56]" />
              <span className="terminal-dot bg-[#ffbd2e]" />
              <span className="terminal-dot bg-[#27c93f]" />
              <span className="ml-2 font-[family-name:var(--font-mono)] text-[11px] text-white/40">
                core.render()
              </span>
            </div>
            <div className="h-[380px] w-full sm:h-[440px]">
              <HeroSceneClient />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      {displayProjects.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <SectionHeading eyebrow="Featured builds" title="Featured Projects" description="A rotating shortlist of the strongest projects in the catalog." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      {/* LATEST PROJECTS */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 flex items-end justify-between">
            <SectionHeading eyebrow="Fresh off the build" title="Latest Projects" />
            <Link href="/projects" className="hidden text-sm font-medium text-signal sm:block">
              View all →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      {/* TECHNOLOGIES */}
      {technologies.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <SectionHeading eyebrow="Stack coverage" title="Technologies" align="center" />
          <div className="flex flex-wrap justify-center gap-3">
            {technologies.map((t) => (
              <span
                key={t.id}
                className="rounded-full border border-white/10 bg-surface px-4 py-2 font-[family-name:var(--font-mono)] text-xs text-white/60"
              >
                {t.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* WHY CHOOSE */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeading eyebrow="Why this platform" title="Why Choose DevMarket3D" align="center" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Code2, title: "Real, working code", desc: "Every listing ships as a complete, runnable project — not a snippet or a UI mockup." },
            { icon: ShieldCheck, title: "Manually verified payments", desc: "A human checks every transaction before source code is released. No auto-approval." },
            { icon: Lock, title: "Protected downloads", desc: "Source code is never public. Access requires a login, a verified payment, and ownership." },
            { icon: Zap, title: "Local checkout", desc: "Priced and paid in PKR through Easypaisa, JazzCash, or direct bank transfer." },
          ].map((f) => (
            <div key={f.title} className="terminal-frame p-6">
              <f.icon className="mb-4 h-6 w-6 text-signal" />
              <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-dim)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT DEVELOPER */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="terminal-frame grid gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_2fr] lg:items-center">
          <div>
            <Eyebrow className="mb-3">About the developer</Eyebrow>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
              Built and sold directly — no middleman.
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-dim)]">
            Every project in this catalog is built, tested, and supported by the same
            person selling it. That means real answers when you have a setup question,
            source code that&apos;s actually been run in production, and a payment process
            you can trust because a real person is on the other end of it.
          </p>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: "Projects listed", value: `${projectCount}+` },
            { label: "Manual verification", value: "100%" },
            { label: "Currency", value: "PKR" },
            { label: "Support channel", value: "WhatsApp" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-[family-name:var(--font-mono)] text-3xl font-semibold text-signal">{s.value}</div>
              <div className="mt-1 text-xs text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeading eyebrow="From buyers" title="What Buyers Say" align="center" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Bilal H.", role: "Full-stack developer", quote: "Clean code, and the installation guide actually matched the project. Saved me a weekend." },
            { name: "Sana K.", role: "Agency owner", quote: "Payment verification took less than the promised 30 minutes. Straightforward process." },
            { name: "Omer F.", role: "CS student", quote: "Good reference codebase for learning how a real project is structured end to end." },
          ].map((t) => (
            <div key={t.name} className="terminal-frame p-6">
              <div className="mb-3 flex gap-0.5 text-signal">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="text-sm text-white/80">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 font-[family-name:var(--font-mono)] text-xs text-white/40">{t.name} · {t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <SectionHeading eyebrow="Common questions" title="FAQ" align="center" />
        <FaqAccordion />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="terminal-frame flex flex-col items-center gap-6 p-10 text-center sm:p-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white sm:text-4xl">
            Ready to ship faster?
          </h2>
          <p className="max-w-md text-sm text-[var(--text-dim)]">
            Browse the catalog, pick a project, and get production-ready code in your
            hands after a quick, human-verified payment — starting at {formatPkr(2999)}.
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center rounded-full bg-signal px-8 py-3 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Explore Projects
          </Link>
        </div>
      </section>
    </div>
  );
}
