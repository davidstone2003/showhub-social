import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UpgradeCalloutProps {
  variant: "listing" | "banner";
}

export function UpgradeCallout({ variant }: UpgradeCalloutProps) {
  const navigate = useNavigate();

  if (variant === "banner") {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
        <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
        <p className="text-sm font-semibold text-foreground">Your breeder page is not live yet</p>
        <p className="text-xs text-muted-foreground mt-1 mb-3">
          Start posting to build your page automatically
        </p>
        <Button size="sm" onClick={() => navigate("/pricing")}>
          Activate My Page
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/50 border border-primary/15 rounded-xl p-6 text-center">
      <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
      <h3 className="text-base font-bold text-foreground">
        Turn your posts into your breeder page
      </h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
        Your winners, sires, and sales update automatically. No website needed.
      </p>
      <Button className="mt-4" onClick={() => navigate("/pricing")}>
        Build My Page
        <ArrowRight className="w-4 h-4 ml-1.5" />
      </Button>
    </div>
  );
}
