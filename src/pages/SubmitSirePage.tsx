import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SPECIES_OPTIONS } from "@/components/SpeciesPills";

const NAVY = "#0A1628";
const GOLD = "#C9A84C";

export default function SubmitSirePage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    sire_name: "",
    breed: "",
    owner: "",
    species: "Sheep",
    semen_available: false,
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.sire_name.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("sire_submissions").insert({
      sire_name: form.sire_name.trim(),
      breed: form.breed.trim() || null,
      owner: form.owner.trim() || null,
      species: form.species,
      semen_available: form.semen_available,
      submitted_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Couldn't submit", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
    setTimeout(() => nav("/sires"), 1500);
  }

  return (
    <Layout showDiscovery={false}>
      <div className="min-h-screen" style={{ backgroundColor: "#F8F7F4" }}>
        <header
          className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-white px-4"
          style={{ height: 60 }}
        >
          <Link to="/sires" className="p-1 -ml-1" aria-label="Back">
            <ArrowLeft className="w-5 h-5" style={{ color: NAVY }} />
          </Link>
          <h1 className="text-[22px] font-bold" style={{ color: NAVY }}>Submit a Sire</h1>
        </header>

        <div className="mx-auto max-w-md px-4 py-6 pb-24">
          {done ? (
            <div className="rounded-2xl bg-white border border-border p-6 text-center">
              <div
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: GOLD }}
              >
                <Check className="w-6 h-6" style={{ color: NAVY }} strokeWidth={3} />
              </div>
              <p className="text-lg font-bold" style={{ color: NAVY }}>Thanks — we got it.</p>
              <p className="mt-1 text-sm text-muted-foreground">Returning to Sires…</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Field label="Sire Name *">
                <input
                  required
                  value={form.sire_name}
                  onChange={(e) => setForm({ ...form, sire_name: e.target.value })}
                  className="input"
                  placeholder="e.g. Smoke Bomb"
                />
              </Field>
              <Field label="Breed">
                <input
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  className="input"
                  placeholder="e.g. Crossbred"
                />
              </Field>
              <Field label="Owner / Operation">
                <input
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  className="input"
                  placeholder="e.g. Stone Show Stock"
                />
              </Field>
              <Field label="Species">
                <select
                  value={form.species}
                  onChange={(e) => setForm({ ...form, species: e.target.value })}
                  className="input"
                >
                  {SPECIES_OPTIONS.filter((s) => s !== "All").map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <label className="flex items-center gap-3 rounded-xl bg-white border border-border px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.semen_available}
                  onChange={(e) => setForm({ ...form, semen_available: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-sm font-semibold" style={{ color: NAVY }}>Semen available</span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl py-3.5 text-[15px] font-bold transition active:scale-[0.98] disabled:opacity-60"
                style={{ backgroundColor: GOLD, color: NAVY }}
              >
                {saving ? "Submitting…" : "Submit Sire"}
              </button>
            </form>
          )}
        </div>

        <style>{`
          .input {
            width: 100%;
            height: 44px;
            padding: 0 14px;
            border-radius: 12px;
            background: #FFFFFF;
            border: 1px solid hsl(var(--border));
            color: ${NAVY};
            font-size: 14px;
            outline: none;
          }
          .input:focus { border-color: ${GOLD}; }
        `}</style>
      </div>
    </Layout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: NAVY }}>
        {label}
      </label>
      {children}
    </div>
  );
}
