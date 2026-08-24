export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#07090e] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,242,192,0.08),transparent_60%)]" />
      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </main>
  );
}
