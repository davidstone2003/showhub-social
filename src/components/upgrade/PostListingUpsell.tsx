import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function PostListingUpsell() {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center mt-4">
      <p className="text-xs text-muted-foreground">Want more buyers to see it?</p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate("/pricing")}
        className="mt-2 text-xs gap-1.5"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Get Featured – $24.99/month
      </Button>
    </div>
  );
}
