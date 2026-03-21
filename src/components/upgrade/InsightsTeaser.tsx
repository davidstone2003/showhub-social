import { Eye, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface InsightsTeaserProps {
  profileViews?: number;
  hasContact: boolean;
}

export function InsightsTeaser({ profileViews = 0, hasContact }: InsightsTeaserProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <h3 className="text-sm font-bold text-foreground">Quick Insights</h3>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground font-medium">{profileViews}</span>
          <span className="text-xs text-muted-foreground">views</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground font-medium">
            {hasContact ? "Active" : "0"}
          </span>
          <span className="text-xs text-muted-foreground">contacts</span>
        </div>
      </div>
      {!hasContact && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            0 buyers could contact you
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/pricing")}
            className="text-xs"
          >
            Enable Contact – $9.99
          </Button>
        </div>
      )}
    </div>
  );
}
