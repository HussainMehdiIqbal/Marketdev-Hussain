import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-signal",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_8px_2px_rgba(99,242,192,0.7)]" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("mb-10 max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-3 text-base text-[var(--text-dim)]">{description}</p>}
    </div>
  );
}

export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "success" | "warning" | "danger" }) {
  const tones: Record<string, string> = {
    default: "bg-white/5 text-white/70 border-white/10",
    success: "bg-signal/10 text-signal border-signal/30",
    warning: "bg-amber-400/10 text-amber-300 border-amber-400/30",
    danger: "bg-red-400/10 text-red-300 border-red-400/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wide",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
