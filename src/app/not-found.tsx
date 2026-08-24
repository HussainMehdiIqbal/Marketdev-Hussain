import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-void px-6 text-center">
      <span className="font-[family-name:var(--font-mono)] text-sm text-signal">404</span>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-white">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--text-dim)]">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-signal px-6 py-3 text-sm font-semibold text-black hover:brightness-110"
      >
        Back to home
      </Link>
    </div>
  );
}
