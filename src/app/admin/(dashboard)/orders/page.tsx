import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SectionHeading } from "@/components/ui";
import { OrdersQueue } from "@/components/admin/orders-queue";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin/login");

  return (
    <div>
      <SectionHeading eyebrow="Verification queue" title="Orders & Payments" />
      <OrdersQueue />
    </div>
  );
}
