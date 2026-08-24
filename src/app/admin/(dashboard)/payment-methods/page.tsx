import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SectionHeading } from "@/components/ui";
import { PaymentMethodsManager } from "@/components/admin/payment-methods-manager";

export default async function AdminPaymentMethodsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin/login");

  return (
    <div>
      <SectionHeading eyebrow="Configuration" title="Payment Methods" description="Fully database-driven — add any bank, wallet, or provider." />
      <PaymentMethodsManager />
    </div>
  );
}
