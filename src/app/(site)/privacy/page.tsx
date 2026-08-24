import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy Policy" };

const sections = [
  { h: "1. Information We Collect", p: "Account details (name, email, hashed password), order and payment records you submit for verification, and basic usage data such as download logs and IP addresses for security purposes." },
  { h: "2. How We Use It", p: "To process orders, verify payments, deliver purchased source code, send order-related notifications, and secure the platform against abuse." },
  { h: "3. Payment Screenshots", p: "Screenshots submitted as payment proof are stored privately and are only accessible to administrators for verification purposes." },
  { h: "4. Data Sharing", p: "We do not sell your personal data. Information is not shared with third parties except where required by law." },
  { h: "5. Data Retention", p: "Order, payment, and download records are retained as needed for support, licensing, and legal purposes." },
  { h: "6. Your Rights", p: "You may request access to or deletion of your account data by contacting us through the Contact page." },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Eyebrow className="mb-3">Legal</Eyebrow>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">Privacy Policy</h1>
      <div className="mt-8 space-y-6">
        {sections.map((s) => (
          <div key={s.h}>
            <h2 className="mb-1.5 font-[family-name:var(--font-display)] text-base font-semibold text-white">{s.h}</h2>
            <p className="text-sm leading-relaxed text-[var(--text-dim)]">{s.p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
