"use client";

import { useState } from "react";
import { Trash2, Loader2, History } from "lucide-react";

interface AdminLogItem {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: Date | string;
}

export function ActivityLogsClient({ initialLogs }: { initialLogs: AdminLogItem[] }) {
  const [logs, setLogs] = useState<AdminLogItem[]>(initialLogs);
  const [clearing, setClearing] = useState(false);

  async function handleClearLogs() {
    if (!confirm("Are you sure you want to clear all admin activity history? This action cannot be undone.")) {
      return;
    }

    setClearing(true);
    try {
      const res = await fetch("/api/admin/activity-logs", { method: "DELETE" });
      if (res.ok) {
        setLogs([]);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to clear activity history.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setClearing(false);
    }
  }

  function formatDate(iso: Date | string) {
    return new Date(iso).toLocaleString("en-PK", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-signal" />
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            Recent Admin Activity
          </h2>
        </div>
        {logs.length > 0 && (
          <button
            type="button"
            onClick={handleClearLogs}
            disabled={clearing}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:border-red-500/50 hover:bg-red-950/40 disabled:opacity-50"
          >
            {clearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Clear Activity History
          </button>
        )}
      </div>

      <div className="terminal-frame overflow-x-auto">
        {logs.length === 0 ? (
          <p className="p-10 text-center text-sm text-white/50">No activity logged yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
              <tr>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((l) => (
                <tr key={l.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-medium text-white/80">{l.action.replace(/_/g, " ")}</td>
                  <td className="px-5 py-3 font-[family-name:var(--font-mono)] text-xs text-white/40">
                    {l.targetType} · {l.targetId}
                  </td>
                  <td className="px-5 py-3 font-[family-name:var(--font-mono)] text-xs text-white/40">
                    {formatDate(l.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
