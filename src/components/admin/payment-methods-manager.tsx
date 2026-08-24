"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/ui";

type Method = {
  id: string; name: string; accountHolder: string; bankOrWallet: string;
  accountNumber: string; iban: string | null; instructions: string | null; enabled: boolean;
};

const empty = { name: "", accountHolder: "", bankOrWallet: "", accountNumber: "", iban: "", instructions: "" };

export function PaymentMethodsManager() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional loading flag for a fetch this effect owns
    setLoading(true);
    fetch("/api/admin/payment-methods")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setMethods(d.methods ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function load() {
    setReloadKey((k) => k + 1);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/payment-methods", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Could not save."); return; }
    setForm(empty);
    setShowForm(false);
    load();
  }

  async function toggleEnabled(m: Method) {
    await fetch(`/api/admin/payment-methods/${m.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !m.enabled }),
    });
    load();
  }

  async function remove(m: Method) {
    if (!confirm(`Delete "${m.name}"?`)) return;
    await fetch(`/api/admin/payment-methods/${m.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <PrimaryButton type="button" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Add Payment Method
        </PrimaryButton>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="terminal-frame mb-6 grid gap-4 p-6 sm:grid-cols-2">
          {([
            ["name", "Method name (e.g. JazzCash)"],
            ["accountHolder", "Account holder name"],
            ["bankOrWallet", "Bank / wallet name"],
            ["accountNumber", "Account number"],
            ["iban", "IBAN (optional)"],
          ] as const).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1.5 block text-xs text-white/50">{label}</label>
              <input
                required={key !== "iban"}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white focus:border-signal/50 focus:outline-none"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs text-white/50">Instructions (optional)</label>
            <textarea
              rows={3}
              value={form.instructions}
              onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white focus:border-signal/50 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
          <div className="flex gap-3 sm:col-span-2">
            <SecondaryButton type="button" onClick={() => setShowForm(false)}>Cancel</SecondaryButton>
            <PrimaryButton type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Method
            </PrimaryButton>
          </div>
        </form>
      )}

      {loading ? (
        <div className="terminal-frame p-10 text-center text-sm text-white/40">Loading…</div>
      ) : methods.length === 0 ? (
        <div className="terminal-frame p-10 text-center text-sm text-white/50">No payment methods configured yet.</div>
      ) : (
        <div className="terminal-frame divide-y divide-white/5">
          {methods.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="text-sm font-medium text-white">{m.name}</p>
                <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-white/40">
                  {m.accountHolder} · {m.bankOrWallet} · {m.accountNumber}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleEnabled(m)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${m.enabled ? "border-signal/40 text-signal" : "border-white/15 text-white/40"}`}
                >
                  {m.enabled ? "Enabled" : "Disabled"}
                </button>
                <button onClick={() => remove(m)} className="text-white/40 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
