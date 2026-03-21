import { Award, BadgeCheck } from "lucide-react";

interface BreederBadgeProps {
  tier: string;
}

export function BreederBadge({ tier }: BreederBadgeProps) {
  if (tier === "featured" || tier === "breeder_page") {
    return (
      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary text-primary-foreground">
        <Award className="w-3 h-3" /> Featured
      </span>
    );
  }

  if (tier === "contacted") {
    return (
      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-accent text-accent-foreground">
        <BadgeCheck className="w-3 h-3" /> Verified
      </span>
    );
  }

  return null;
}
