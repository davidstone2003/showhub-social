import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function DirectoryHint() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2 min-w-0">
        <ArrowUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <p className="text-xs text-muted-foreground truncate">
          You're not showing at the top of results
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate("/pricing")}
        className="text-xs flex-shrink-0"
      >
        Get Featured
      </Button>
    </div>
  );
}
