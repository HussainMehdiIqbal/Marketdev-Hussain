"use client";

import { useEffect, useState } from "react";

function format(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function CountdownTimer({ deadline }: { deadline: string }) {
  const target = new Date(deadline).getTime();
  const [remaining, setRemaining] = useState(() => target - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(target - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const expired = remaining <= 0;

  return (
    <div className="text-center">
      <div className="font-[family-name:var(--font-mono)] text-4xl font-semibold tabular-nums text-signal">
        {expired ? "00:00" : format(remaining)}
      </div>
      <p className="mt-1 text-xs text-white/40">
        {expired
          ? "Verification is taking a little longer than usual — you'll be notified the moment it's done."
          : "Estimated time remaining for manual verification"}
      </p>
    </div>
  );
}
