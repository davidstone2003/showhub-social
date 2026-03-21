import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const planMeta: Record<string, { name: string; description: string; features: string[] }> = {
  free: {
    name: "Free",
    description: "Basic directory listing",
    features: ["Basic profile", "Show in directory", "Post winners"],
  },
  contacted: {
    name: "Get Contacted",
    description: "Buyers can reach you directly",
    features: ["Call, text, email enabled", "Social links", "Buyer contact"],
  },
  featured: {
    name: "Get Seen",
    description: "Featured placement & analytics",
    features: ["Featured in directory", "Higher ranking", "Profile analytics", "Premium badge"],
  },
  listing: {
    name: "Listing",
    description: "Directory presence with bio & contact",
    features: ["Directory listing", "Bio & contact", "3 recent posts"],
  },
  breeder_page: {
    name: "Breeder Page",
    description: "Full dynamic website replacement",
    features: ["Hero section", "Winners, Sires, Sales sections", "Auto-updating from posts"],
  },
};

interface MyPlanCardProps {
  currentTier: string;
}

export function MyPlanCard({ currentTier }: MyPlanCardProps) {
  const navigate = useNavigate();
  const plan = planMeta[currentTier] || planMeta.free;
  const canUpgrade = currentTier === "free" || currentTier === "contacted" || currentTier === "listing";

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">My Plan</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{plan.name}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>
      <ul className="mt-3 space-y-1.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-foreground">
            <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      {canUpgrade && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/pricing")}
          className="mt-4 w-full text-xs"
        >
          Upgrade Plan
        </Button>
      )}
    </div>
  );
}
