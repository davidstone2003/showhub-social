import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { TIERS, type TierKey } from "@/constants/tiers";

export default function PricingPage() {
  const { profile } = useAuth() as any;
  const currentTier = (profile?.subscription_tier as TierKey) || "free";
  const navigate = useNavigate();

  return (
    <Layout showDiscovery={false}>
      <div style={{ backgroundColor: "#F8F7F4", minHeight: "100vh" }}>
        <div
          className="sticky top-0 z-10 px-4 flex items-center"
          style={{ height: 60, backgroundColor: "hsl(var(--primary))", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h1 className="text-[22px] font-bold text-white">Upgrade</h1>
        </div>

        <div className="px-4 pt-6 pb-24">
          <div className="text-center mb-6">
            <h2 className="font-black text-[24px]" style={{ color: "hsl(var(--primary))" }}>
              Build Your Backdrop
            </h2>
            <p className="text-[14px] mt-1" style={{ color: "#6B7280" }}>
              The main feed is free for everyone. Upgrade to build your brand.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {(Object.entries(TIERS) as [TierKey, typeof TIERS[TierKey]][]).map(([key, tier]) => (
              <div
                key={key}
                className="rounded-2xl bg-white border overflow-hidden"
                style={{
                  borderColor: currentTier === key ? tier.color : "#E5E7EB",
                  borderWidth: currentTier === key ? 2 : 1,
                  boxShadow: currentTier === key ? `0 4px 20px ${tier.color}25` : "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="px-4 pt-4 pb-3"
                  style={{
                    backgroundColor: key === "featured" ? "hsl(var(--primary))" : key === "breeder" ? "#FFFBF0" : "white",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-[12px] font-bold uppercase tracking-wider"
                        style={{ color: key === "featured" ? "rgba(255,255,255,0.6)" : "#9CA3AF" }}
                      >
                        {tier.name}
                      </p>
                      <p
                        className="font-black text-[28px] mt-0.5"
                        style={{ color: key === "featured" ? "white" : "hsl(var(--primary))" }}
                      >
                        {tier.price === 0 ? "Free" : `$${tier.price}`}
                        {tier.price > 0 && (
                          <span
                            className="text-[14px] font-normal ml-1"
                            style={{ color: key === "featured" ? "rgba(255,255,255,0.6)" : "#9CA3AF" }}
                          >
                            /mo
                          </span>
                        )}
                      </p>
                    </div>
                    {currentTier === key && (
                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-bold"
                        style={{ backgroundColor: tier.color, color: key === "free" ? "white" : "hsl(var(--primary))" }}
                      >
                        Current Plan
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-4 py-3 flex flex-col gap-2">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 24 24"
                        fill="none"
                        className="shrink-0 mt-0.5"
                        stroke={tier.color}
                        strokeWidth={2.5}
                      >
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-[13px]" style={{ color: "hsl(var(--primary))" }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                {currentTier !== key && tier.price > 0 && (
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => navigate("/onboarding")}
                      className="w-full h-11 rounded-xl font-bold text-[14px]"
                      style={{ backgroundColor: tier.color, color: key === "featured" ? "white" : "hsl(var(--primary))" }}
                    >
                      Upgrade to {tier.name}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-[12px] mt-6" style={{ color: "#9CA3AF" }}>
            Cancel anytime · No ads ever · Your data stays yours
          </p>
        </div>
      </div>
    </Layout>
  );
}
