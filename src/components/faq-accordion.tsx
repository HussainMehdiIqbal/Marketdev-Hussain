"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What exactly do I get after purchase?",
    a: "The full source code as a ZIP archive, a step-by-step installation guide, and a license code tied to your account. Everything ships as production-ready code, not a demo.",
  },
  {
    q: "How does payment work?",
    a: "Pay via Easypaisa, JazzCash, or bank transfer, then upload your payment screenshot and transaction details. An admin manually checks every payment before access is granted — usually within 30 minutes.",
  },
  {
    q: "Why isn't payment verified automatically?",
    a: "Screenshots alone aren't proof. A human checks the actual transaction against what you submitted before the source code becomes downloadable, which protects both sides.",
  },
  {
    q: "Can I use a project commercially?",
    a: "Depends on the license attached to that project — personal, commercial, single-project, or multi-project. Each project page states its license before you buy.",
  },
  {
    q: "How many times can I download my purchase?",
    a: "Your purchase stays in My Purchases with a secure, authenticated download link tied to your account and license — reinstall or redownload any time.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {faqs.map((item, i) => (
        <div key={item.q}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between py-5 text-left"
            aria-expanded={open === i}
          >
            <span className="font-[family-name:var(--font-display)] text-base font-medium text-white">
              {item.q}
            </span>
            <ChevronDown
              className={cn("h-5 w-5 shrink-0 text-white/40 transition-transform", open === i && "rotate-180 text-signal")}
            />
          </button>
          {open === i && <p className="pb-5 text-sm leading-relaxed text-[var(--text-dim)]">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
