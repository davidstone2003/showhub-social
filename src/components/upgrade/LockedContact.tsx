import { Lock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LockedContactProps {
  /** true = breeder viewing own page; false = buyer viewing */
  isOwner: boolean;
}

export function LockedContact({ isOwner }: LockedContactProps) {
  const navigate = useNavigate();

  if (!isOwner) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <Phone className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Contact not available</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 text-center">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
        <Lock className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground">Contact this breeder</p>
      <p className="text-xs text-muted-foreground mt-1">
        Buyers can't reach you yet
      </p>
      <Button
        size="sm"
        onClick={() => navigate("/pricing")}
        className="mt-3 text-xs"
      >
        Unlock Contact – $9.99/month
      </Button>
    </div>
  );
}
