import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, GitBranch, Baby, Phone, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SireCardProps {
  name: string;
  image: string;
  sireName?: string;
  sireId?: string;
  damName?: string;
  damId?: string;
  breederName: string;
  traits?: string[];
  description?: string;
}

export function SireCard({
  name,
  image,
  sireName,
  sireId,
  damName,
  damId,
  breederName,
  traits = [],
  description,
}: SireCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);

  const pedigree = [sireName, damName].filter(Boolean).join(" x ");

  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm">
      {/* Image — full width, no overlays */}
      <div className="w-full aspect-square bg-muted overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Content */}
      <div className="px-3.5 pt-3 pb-3 space-y-2">
        {/* 1. Sire Name */}
        <h2 className="text-lg font-bold text-foreground leading-tight">{name}</h2>

        {/* 2. Pedigree — each name clickable if ID exists */}
        {pedigree && (
          <p className="text-sm text-foreground">
            {sireId ? (
              <Link to={`/sire/${sireId}`} className="text-primary font-medium hover:underline">
                {sireName}
              </Link>
            ) : (
              <span className="font-medium">{sireName}</span>
            )}
            {sireName && damName && <span className="text-muted-foreground"> x </span>}
            {damId ? (
              <Link to={`/sire/${damId}`} className="text-primary font-medium hover:underline">
                {damName}
              </Link>
            ) : (
              <span className="font-medium">{damName}</span>
            )}
          </p>
        )}

        {/* 3. Breeder Name */}
        <p className="text-sm text-muted-foreground">{breederName}</p>

        {/* 4. Traits */}
        {traits.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {traits.map((trait) => (
              <Badge
                key={trait}
                variant="secondary"
                className="whitespace-nowrap text-xs shrink-0"
              >
                {trait}
              </Badge>
            ))}
          </div>
        )}

        {/* 5. Collapsible Description */}
        {description && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-left"
          >
            <p
              className={cn(
                "text-sm text-foreground leading-relaxed",
                !expanded && "line-clamp-2"
              )}
            >
              {description}
            </p>
            <span className="inline-flex items-center gap-0.5 text-xs text-primary font-medium mt-0.5">
              {expanded ? "Show less" : "Read more"}
              <ChevronDown
                className={cn("w-3 h-3 transition-transform", expanded && "rotate-180")}
              />
            </span>
          </button>
        )}

        {/* 6. Action Row */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant={saved ? "default" : "outline"}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setSaved(!saved)}
          >
            <Heart className={cn("w-3.5 h-3.5", saved && "fill-current")} />
            {saved ? "Saved" : "Save"}
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            <GitBranch className="w-3.5 h-3.5" />
            Pedigree
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            <Baby className="w-3.5 h-3.5" />
            Offspring
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            <Phone className="w-3.5 h-3.5" />
            Contact
          </Button>
        </div>
      </div>
    </div>
  );
}
