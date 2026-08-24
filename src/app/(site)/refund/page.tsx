import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "Refund Policy" };

const sections = [
  { h: "1. Before Verification", p: "If your payment has not yet been verified, you may cancel and request a refund by contacting support with your Order ID." },
  { h: "2. After Download", p: "Because source code is delivered digitally and becomes accessible immediately upon verification, refunds are not available once a project has been downloaded, except where the code is materially different from its listing." },
  { h: "3. Rejected Payments", p: "If your payment proof is rejected, no charge is retained on our side for that order — you may resubmit with a valid transaction or choose a different payment method." },
  { h: "4. How to Request a Refund", p: "Contact us via the Contact page with your Order ID and the reason for your request. Requests are reviewed on a case-by-case basis." },
];

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Eyebrow className="mb-3">Legal</Eyebrow>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">Refund Policy</h1>
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
