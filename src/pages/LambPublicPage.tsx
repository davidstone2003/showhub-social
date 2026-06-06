import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { findDemoLamb, type DemoLamb } from "@/data/demoLambs";
import { GenotypeBadges } from "@/components/sire-catalog/GenotypeBadges";

interface CatalogSireRow {
  id: string;
  sire_name: string;
  pedigree: string | null;
  genotype: string | null;
  breeder_name?: string;
}

export default function LambPublicPage() {
  const { tag } = useParams<{ tag: string }>();
  const [lamb, setLamb] = useState<DemoLamb | undefined>(undefined);
  const [sire, setSire] = useState<CatalogSireRow | null>(null);
  const [grandsire, setGrandsire] = useState<CatalogSireRow | null>(null);

  useEffect(() => {
    if (!tag) return;
    const found = findDemoLamb(tag);
    setLamb(found);
  }, [tag]);

  useEffect(() => {
    async function loadSires() {
      if (!lamb) return;
      const names = [lamb.sireName, lamb.grandsireDamName].filter(Boolean) as string[];
      if (names.length === 0) return;
      const { data } = await supabase
        .from("catalog_sires")
        .select("id, sire_name, pedigree, genotype, breeder:catalog_breeders(name)")
        .in("sire_name", names);
      if (data) {
        const flat = data.map((r: any) => ({
          id: r.id,
          sire_name: r.sire_name,
          pedigree: r.pedigree,
          genotype: r.genotype,
          breeder_name: r.breeder?.name,
        }));
        setSire(flat.find((s) => s.sire_name === lamb.sireName) || null);
        setGrandsire(flat.find((s) => s.sire_name === lamb.grandsireDamName) || null);
      }
    }
    loadSires();
  }, [lamb]);

  if (!lamb) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg font-bold text-[#1A1A2E]" style={{ fontFamily: "Georgia, serif" }}>
            Tag #{tag} not found
          </p>
          <p className="text-sm text-gray-500 mt-2">This lamb hasn't been registered yet.</p>
          <Link to="/" className="inline-block mt-4 text-sm text-[#1A4FB5] font-medium">
            ← Backdrop home
          </Link>
        </div>
      </div>
    );
  }

  const ageMonths = Math.max(
    0,
    Math.round((Date.now() - new Date(lamb.dob).getTime()) / (1000 * 60 * 60 * 24 * 30)),
  );

  return (
    <div className="min-h-screen bg-[#fafaf8] pb-16">
      <div className="max-w-[430px] mx-auto bg-white">
        {/* Top bar */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wide">Backdrop · Tag</p>
            <p
              className="text-lg font-bold text-[#1A1A2E]"
              style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
            >
              #{lamb.tag}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-[#1A1A2E]">{lamb.breederName}</p>
            <p className="text-[11px] text-gray-500">{lamb.breederLocation}</p>
          </div>
        </div>

        {/* For sale badge */}
        {lamb.forSale && (
          <div className="bg-[#1A7A3A] px-4 py-2 text-white text-sm font-bold flex items-center justify-between">
            <span>FOR SALE</span>
            {lamb.price && <span>${lamb.price.toLocaleString()}</span>}
          </div>
        )}

        {/* Photo placeholder */}
        <div
          className="h-[220px] flex flex-col items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${lamb.breederColor}22, ${lamb.breederColor}55)` }}
        >
          <div className="text-6xl">🐑</div>
          <p className="text-[11px] text-gray-500 mt-2">Photo placeholder</p>
        </div>

        {/* Info chips */}
        <div className="px-4 py-4 flex flex-wrap gap-2">
          {[
            ["Breed", lamb.breed],
            ["Sex", lamb.sex],
            ["Color", lamb.color],
            ["DOB", new Date(lamb.dob).toLocaleDateString()],
            ["Age", `${ageMonths} mo`],
            ["Weight", `${lamb.weightLbs} lbs`],
          ].map(([k, v]) => (
            <span
              key={k}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-[11px] font-medium px-2.5 py-1 rounded-full"
            >
              <span className="text-gray-500">{k}:</span> {v}
            </span>
          ))}
        </div>

        {/* Show results */}
        {lamb.results.length > 0 && (
          <div className="px-4 pb-4">
            <h2 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wide mb-2">
              Show Results
            </h2>
            <div className="space-y-2">
              {lamb.results.map((r, i) => (
                <div
                  key={i}
                  className="border-l-4 border-[#1A7A3A] bg-[#1A7A3A]/5 rounded-r-md px-3 py-2"
                >
                  <p className="text-sm font-bold text-[#1A1A2E]">{r.placement}</p>
                  <p className="text-[12px] text-gray-600">
                    {r.show} · {r.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pedigree */}
        <div className="px-4 pb-4">
          <h2 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wide mb-2">
            Pedigree
          </h2>

          {/* Sire */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-2">
            <div className="h-1" style={{ background: lamb.breederColor }} />
            <div className="p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Sire</p>
              {sire ? (
                <Link to={`/sire/${sire.id}`} className="block">
                  <p
                    className="text-base font-bold text-[#1A1A2E]"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {sire.sire_name}
                  </p>
                  {sire.breeder_name && (
                    <p className="text-[12px] text-gray-600">{sire.breeder_name}</p>
                  )}
                  {sire.pedigree && (
                    <p className="text-[12px] text-gray-500 mt-1">{sire.pedigree}</p>
                  )}
                  <div className="mt-2">
                    <GenotypeBadges raw={sire.genotype} />
                  </div>
                </Link>
              ) : (
                <p className="text-base font-bold text-[#1A1A2E]" style={{ fontFamily: "Georgia, serif" }}>
                  {lamb.sireName}
                </p>
              )}
            </div>
          </div>

          {/* Dam */}
          <div className="border border-gray-200 rounded-xl p-3 mb-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Dam</p>
            <p className="text-base font-bold text-[#1A1A2E]" style={{ fontFamily: "Georgia, serif" }}>
              {lamb.damName}
            </p>
          </div>

          {/* Grandsire (dam) */}
          {lamb.grandsireDamName && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="h-1 bg-gray-400" />
              <div className="p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                  Grandsire (dam side)
                </p>
                {grandsire ? (
                  <Link to={`/sire/${grandsire.id}`} className="block">
                    <p
                      className="text-base font-bold text-[#1A1A2E]"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {grandsire.sire_name}
                    </p>
                    {grandsire.breeder_name && (
                      <p className="text-[12px] text-gray-600">{grandsire.breeder_name}</p>
                    )}
                    {grandsire.pedigree && (
                      <p className="text-[12px] text-gray-500 mt-1">{grandsire.pedigree}</p>
                    )}
                  </Link>
                ) : (
                  <p
                    className="text-base font-bold text-[#1A1A2E]"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {lamb.grandsireDamName}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="px-4 pb-6">
          <button className="w-full bg-[#1A1A2E] text-white font-bold py-3 rounded-full text-sm">
            Contact {lamb.breederName}
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 pb-4">
          Powered by{" "}
          <Link to="/" className="font-semibold text-[#1A1A2E]" style={{ fontFamily: "Georgia, serif" }}>
            Backdrop
          </Link>
        </p>
      </div>
    </div>
  );
}
