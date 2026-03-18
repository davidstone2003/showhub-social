import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LockedSectionProps {
  icon: React.ElementType;
  title: string;
  count?: number;
  isOwner: boolean;
}

export function LockedSection({ icon: Icon, title, count = 3, isOwner }: LockedSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card">
      {/* Blurred placeholder cards */}
      <div className="p-4 space-y-3 blur-[6px] select-none pointer-events-none opacity-60">
        {Array.from({ length: Math.min(count, 2) }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-2.5 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{title}</h3>
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground text-center max-w-[240px] mb-3">
          {isOwner
            ? "Your posts can build this section automatically"
            : "This section is available on Breeder Pages"}
        </p>
        {isOwner && (
          <Button
            size="sm"
            onClick={() => navigate("/pricing")}
            className="text-xs"
          >
            Upgrade to Breeder Page
          </Button>
        )}
      </div>
    </div>
  );
}
