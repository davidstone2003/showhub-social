import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { saveStoredLamb, type DemoLamb } from "@/data/demoLambs";
import { Check, ChevronLeft } from "lucide-react";

type Step = 1 | 2 | 3 | "done";

const SEX = ["Ewe", "Wether", "Ram"] as const;
const BREEDS = ["Crossbred", "Hampshire x", "Suffolk x", "Dorper x", "Katahdin x", "Other"];
const COLORS = ["White", "White/Black", "Black", "Brown", "Spotted", "Other"];

interface SireRow {
  id: string;
  sire_name: string;
  pedigree: string | null;
  genotype: string | null;
  breeder?: { name: string } | null;
}

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
        active
          ? "bg-[#1A4FB5] text-white border-[#1A4FB5]"
          : "bg-white text-gray-700 border-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

export default function LambRegisterPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [tag, setTag] = useState("");
  const [dob, setDob] = useState(new Date().toISOString().slice(0, 10));
  const [sex, setSex] = useState<(typeof SEX)[number]>("Ewe");
  const [breed, setBreed] = useState("Crossbred");
  const [color, setColor] = useState("White");
  const [notes, setNotes] = useState("");

  const [sireQuery, setSireQuery] = useState("");
  const [sires, setSires] = useState<SireRow[]>([]);
  const [selectedSire, setSelectedSire] = useState<SireRow | null>(null);
  const [damName, setDamName] = useState("");
  const [grandsire, setGrandsire] = useState("");

  useEffect(() => {
    if (sireQuery.trim().length < 2) {
      setSires([]);
      return;
    }
    let cancel = false;
    (async () => {
      const { data } = await supabase
        .from("catalog_sires")
        .select("id, sire_name, pedigree, genotype, breeder:catalog_breeders(name)")
        .ilike("sire_name", `%${sireQuery.trim()}%`)
        .limit(8);
      if (!cancel) setSires((data as any) || []);
    })();
    return () => {
      cancel = true;
    };
  }, [sireQuery]);

  const canNext1 = tag.trim().length > 0 && dob;
  const canNext2 = !!(selectedSire || sireQuery.trim()) && damName.trim().length > 0;
  const breederName = profile?.display_name || profile?.username || "Your Farm";

  const summary = useMemo(
    () => ({
      tag,
      dob,
      sex,
      breed,
      color,
      sireName: selectedSire?.sire_name || sireQuery.trim() || "—",
      damName,
      grandsire,
      notes,
    }),
    [tag, dob, sex, breed, color, selectedSire, sireQuery, damName, grandsire, notes],
  );

  const handleSave = () => {
    const lamb: DemoLamb = {
      tag: tag.trim(),
      breederName,
      breederLocation: profile?.bio ? "" : "",
      breederColor: "#1A4FB5",
      sireName: summary.sireName,
      damName: damName.trim(),
      grandsireDamName: grandsire.trim() || undefined,
      sex,
      breed,
      color,
      dob,
      weightLbs: 0,
      forSale: false,
      notes: notes.trim() || undefined,
      results: [],
    };
    saveStoredLamb(lamb);
    setStep("done");
  };

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Layout showDiscovery={false}>
      <div className="max-w-2xl mx-auto w-full px-4 pb-32 pt-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => (step === 1 || step === "done" ? navigate("/dashboard") : setStep((step - 1) as Step))}
            className="inline-flex items-center gap-1 text-sm text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 || step === "done" ? "Dashboard" : "Back"}
          </button>
          {step !== "done" && (
            <div className="flex gap-1.5">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className={`w-2 h-2 rounded-full ${
                    n <= (step as number) ? "bg-[#1A4FB5]" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <h1 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "Georgia, serif" }}>
              Step 1 · Tag Info
            </h1>

            <div className="text-center">
              <label className="text-[11px] text-gray-500 uppercase tracking-wide">Tag</label>
              <input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="001"
                className="block mx-auto text-center text-[28px] font-bold text-[#1A4FB5] bg-transparent border-b-2 border-gray-300 focus:border-[#1A4FB5] outline-none w-40 mt-1"
                style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wide">DOB</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="block mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wide">Sex</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {SEX.map((s) => (
                  <Pill key={s} active={sex === s} onClick={() => setSex(s)}>
                    {s}
                  </Pill>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wide">Breed</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {BREEDS.map((b) => (
                  <Pill key={b} active={breed === b} onClick={() => setBreed(b)}>
                    {b}
                  </Pill>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wide">Color</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {COLORS.map((c) => (
                  <Pill key={c} active={color === c} onClick={() => setColor(c)}>
                    {c}
                  </Pill>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wide">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. triplet, bottle lamb…"
                className="block mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h1 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "Georgia, serif" }}>
              Step 2 · Parents
            </h1>

            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wide">Sire</label>
              <input
                value={sireQuery}
                onChange={(e) => {
                  setSireQuery(e.target.value);
                  setSelectedSire(null);
                }}
                placeholder="Search sire catalog…"
                className="block mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              {selectedSire ? (
                <div className="mt-2 rounded-lg border border-[#1A4FB5] bg-[#EFF6FF] p-3">
                  <p className="text-sm font-bold text-[#1A1A2E]">{selectedSire.sire_name}</p>
                  {selectedSire.breeder?.name && (
                    <p className="text-[12px] text-gray-600">{selectedSire.breeder.name}</p>
                  )}
                  {selectedSire.pedigree && (
                    <p className="text-[12px] text-gray-500 mt-1">{selectedSire.pedigree}</p>
                  )}
                  <button
                    onClick={() => setSelectedSire(null)}
                    className="text-[11px] text-[#1A4FB5] mt-2"
                  >
                    Change
                  </button>
                </div>
              ) : sires.length > 0 ? (
                <ul className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-100 bg-white max-h-56 overflow-y-auto">
                  {sires.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSire(s);
                          setSireQuery(s.sire_name);
                        }}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                      >
                        <p className="text-sm font-semibold text-[#1A1A2E]">{s.sire_name}</p>
                        {s.breeder?.name && (
                          <p className="text-[11px] text-gray-500">{s.breeder.name}</p>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wide">Dam</label>
              <input
                value={damName}
                onChange={(e) => setDamName(e.target.value)}
                placeholder="Dam name or tag…"
                className="block mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wide">
                Grandsire (dam side) — optional
              </label>
              <input
                value={grandsire}
                onChange={(e) => setGrandsire(e.target.value)}
                placeholder="e.g. Tres Amigos"
                className="block mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h1 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "Georgia, serif" }}>
              Step 3 · Review
            </h1>
            <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
              {[
                ["Tag", `#${summary.tag}`],
                ["DOB", summary.dob],
                ["Sex", summary.sex],
                ["Breed", summary.breed],
                ["Color", summary.color],
                ["Sire", summary.sireName],
                ["Dam", summary.damName],
                ["Grandsire (dam)", summary.grandsire || "—"],
                ["Notes", summary.notes || "—"],
              ].map(([k, v]) => (
                <div key={k as string} className="flex items-start justify-between px-3 py-2 gap-3">
                  <span className="text-[11px] text-gray-500 uppercase tracking-wide w-28 shrink-0">
                    {k}
                  </span>
                  <span className="text-sm text-[#1A1A2E] text-right break-words">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="text-sm text-[#1A4FB5]">
              ← Edit details
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="text-center py-10">
            <div className="mx-auto w-20 h-20 rounded-full bg-[#1A7A3A]/10 flex items-center justify-center text-4xl">
              ✅
            </div>
            <p className="text-xl font-bold text-[#1A7A3A] mt-4">Tag #{summary.tag} Registered!</p>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-left mt-4">
              <p className="text-sm">
                <strong>{summary.sex}</strong> · {summary.breed} · {summary.color}
              </p>
              <p className="text-sm text-gray-600 mt-1">Sire: {summary.sireName}</p>
              <p className="text-sm text-gray-600">Dam: {summary.damName}</p>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => {
                  setStep(1);
                  setTag("");
                  setSireQuery("");
                  setSelectedSire(null);
                  setDamName("");
                  setGrandsire("");
                  setNotes("");
                }}
                className="flex-1 bg-[#1A4FB5] text-white font-semibold py-3 rounded-full text-sm"
              >
                Register Next Lamb
              </button>
              <Link
                to={`/lamb/${summary.tag}`}
                className="flex-1 bg-gray-200 text-[#1A1A2E] font-semibold py-3 rounded-full text-sm text-center"
              >
                View Tag
              </Link>
            </div>
          </div>
        )}

        {/* Bottom action bar */}
        {step !== "done" && (
          <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 max-w-2xl mx-auto">
            {step > 1 && (
              <button
                onClick={() => setStep((step - 1) as Step)}
                className="flex-1 bg-gray-200 text-[#1A1A2E] font-semibold py-3 rounded-full text-sm"
              >
                Back
              </button>
            )}
            {step < 3 && (
              <button
                disabled={step === 1 ? !canNext1 : !canNext2}
                onClick={() => setStep(((step as number) + 1) as Step)}
                className="flex-1 bg-[#1A4FB5] text-white font-semibold py-3 rounded-full text-sm disabled:opacity-40"
              >
                Next →
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleSave}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1A7A3A] text-white font-semibold py-3 rounded-full text-sm"
              >
                <Check className="w-4 h-4" />
                Save & Tag Lamb
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
