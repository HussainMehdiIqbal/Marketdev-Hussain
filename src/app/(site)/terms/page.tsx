import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "Terms & Conditions" };

const sections = [
  { h: "1. Acceptance of Terms", p: "By creating an account or purchasing a project on this platform, you agree to these Terms & Conditions in full." },
  { h: "2. What You're Buying", p: "Each purchase grants access to a specific project's source code, installation guide, and documentation under the license type stated on that project's page (personal, commercial, single-project, or multiple-projects)." },
  { h: "3. Payment & Verification", p: "All payments are manually verified by an administrator before source code access is granted. Submitting a payment screenshot does not guarantee approval — the actual transaction is checked against what you submit." },
  { h: "4. License Restrictions", p: "Unless your project's license explicitly allows it, you may not resell, sublicense, or redistribute the source code as your own product." },
  { h: "5. Refunds", p: "Refunds are handled per the separate Refund Policy linked in the footer." },
  { h: "6. Account Responsibility", p: "You are responsible for keeping your account credentials secure and for all activity under your account." },
  { h: "7. Changes to These Terms", p: "These terms may be updated periodically; continued use of the platform after changes constitutes acceptance of the revised terms." },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Eyebrow className="mb-3">Legal</Eyebrow>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">Terms &amp; Conditions</h1>
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
