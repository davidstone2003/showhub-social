import { Lock } from "lucide-react";

export function LockedFeatureLabel({ label = "Available with upgrade" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
      <Lock className="w-3 h-3" />
      {label}
    </span>
  );
}
