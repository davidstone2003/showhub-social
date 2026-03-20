import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreederIdentityProps {
  name: string;
  slug?: string;
  logoUrl?: string | null;
  location?: string | null;
  bio?: string | null;
  tier?: string; // "free" | "listing" | "breeder_page"
  variant: "feed" | "directory" | "search";
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function BreederIdentity({
  name,
  slug,
  logoUrl,
  location,
  bio,
  tier,
  variant,
}: BreederIdentityProps) {
  const isPaid = tier === "breeder_page";
  const link = slug ? `/breeder/${slug}` : "#";

  if (variant === "feed") {
    return (
      <Link to={link} className="flex items-center gap-2.5 px-3.5 pt-3 pb-2 group">
        <Avatar className="h-8 w-8 border border-border">
          {logoUrl ? (
            <AvatarImage src={logoUrl} alt={name} className="object-cover" />
          ) : null}
          <AvatarFallback className="text-[11px] font-semibold bg-muted text-muted-foreground">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground truncate group-hover:underline">
              {name}
            </span>
            {isPaid && (
              <span className="shrink-0 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider rounded bg-accent text-accent-foreground leading-tight">
                Breeder Page
              </span>
            )}
          </div>
          {location && (
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" />
              {location}
            </span>
          )}
        </div>
      </Link>
    );
  }

  if (variant === "directory") {
    return (
      <Link
        to={link}
        className="flex flex-col items-center text-center p-5 bg-card rounded-xl border border-border hover:shadow-md transition-shadow"
      >
        <Avatar className="h-14 w-14 border border-border mb-3">
          {logoUrl ? (
            <AvatarImage src={logoUrl} alt={name} className="object-cover" />
          ) : null}
          <AvatarFallback className="text-base font-semibold bg-muted text-muted-foreground">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          {isPaid && (
            <span className="shrink-0 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider rounded bg-accent text-accent-foreground leading-tight">
              Breeder Page
            </span>
          )}
        </div>
        {location && (
          <span className="text-xs text-muted-foreground flex items-center gap-0.5 mb-1">
            <MapPin className="w-3 h-3" />
            {location}
          </span>
        )}
        {bio && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{bio}</p>
        )}
      </Link>
    );
  }

  // search variant
  return (
    <Link
      to={link}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <Avatar className="h-9 w-9 border border-border">
        {logoUrl ? (
          <AvatarImage src={logoUrl} alt={name} className="object-cover" />
        ) : null}
        <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground truncate group-hover:underline">
            {name}
          </span>
          {isPaid && (
            <span className="shrink-0 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider rounded bg-accent text-accent-foreground leading-tight">
              Breeder Page
            </span>
          )}
        </div>
        {location && (
          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
            <MapPin className="w-2.5 h-2.5" />
            {location}
          </span>
        )}
        <span className="text-xs text-primary/70">View Breeder Page</span>
      </div>
    </Link>
  );
}
