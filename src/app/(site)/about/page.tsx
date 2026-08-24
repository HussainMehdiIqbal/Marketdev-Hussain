import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Eyebrow className="mb-3">About</Eyebrow>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">About MarketDev | Hussain</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--text-dim)]">
        <p>
          MarketDev | Hussain is a one-person software marketplace: every project listed here is built,
          tested, priced, and supported directly by its developer — no reseller, no middleman.
        </p>
        <p>
          The platform exists to make it straightforward to sell complete, production-ready
          codebases to developers and businesses in Pakistan, with local payment methods and a
          manual, human-verified payment process behind every download.
        </p>
        <p>
          Every purchase includes the full source code, a written installation guide, and a
          license code tied to your account — not a stripped-down demo.
        </p>
      </div>
    </div>
  );
}
