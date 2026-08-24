import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-12 lg:flex-row">
        <DashboardSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </main>
      <Footer />
    </>
  );
}
