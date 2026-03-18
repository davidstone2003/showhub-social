import React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type PostType = "winner" | "general" | "sire" | "donor" | "sale";

interface PostTypeOption {
  value: PostType;
  label: string;
  emoji: string;
}

const POST_TYPES: PostTypeOption[] = [
  { value: "winner", label: "Winner", emoji: "🏆" },
  { value: "general", label: "General", emoji: "📝" },
  { value: "sire", label: "Sire", emoji: "🧬" },
  { value: "donor", label: "Donor", emoji: "🧬" },
  { value: "sale", label: "Sale", emoji: "💰" },
];

/** Smart defaults per post type */
export function getDefaultToggles(type: PostType) {
  switch (type) {
    case "winner":
      return { feed: true, breederPage: true, winnersArchive: true, featured: false };
    case "general":
      return { feed: true, breederPage: false, winnersArchive: false, featured: false };
    case "sire":
    case "donor":
    case "sale":
      return { feed: false, breederPage: true, winnersArchive: false, featured: false };
    default:
      return { feed: true, breederPage: false, winnersArchive: false, featured: false };
  }
}

interface PostTypeToggles {
  feed: boolean;
  breederPage: boolean;
  winnersArchive: boolean;
  featured: boolean;
}

interface Props {
  postType: PostType;
  onPostTypeChange: (type: PostType) => void;
  toggles: PostTypeToggles;
  onTogglesChange: (toggles: PostTypeToggles) => void;
  isPremium: boolean;
}

export function PostTypeSelector({ postType, onPostTypeChange, toggles, onTogglesChange, isPremium }: Props) {
  const handleTypeChange = (type: PostType) => {
    onPostTypeChange(type);
    onTogglesChange(getDefaultToggles(type));
  };

  return (
    <div className="space-y-3">
      {/* Post type chips */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
          Post Type
        </p>
        <div className="flex flex-wrap gap-2">
          {POST_TYPES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleTypeChange(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                postType === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/50"
              )}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Destination toggles */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
          Where should this appear?
        </p>
        <div className="space-y-2">
          <ToggleRow
            label="Feed"
            description="Show in global feed"
            checked={toggles.feed}
            onChange={(v) => onTogglesChange({ ...toggles, feed: v })}
          />
          <ToggleRow
            label="Breeder Page"
            description={isPremium ? "Show on your breeder page" : "Premium feature"}
            checked={toggles.breederPage}
            onChange={(v) => onTogglesChange({ ...toggles, breederPage: v })}
            disabled={!isPremium}
          />
          <ToggleRow
            label="Winners Archive"
            description="Add to structured winners database"
            checked={toggles.winnersArchive}
            onChange={(v) => onTogglesChange({ ...toggles, winnersArchive: v })}
          />
          <ToggleRow
            label="Feature on Page"
            description={isPremium ? "Highlight on your breeder page" : "Premium feature"}
            checked={toggles.featured}
            onChange={(v) => onTogglesChange({ ...toggles, featured: v })}
            disabled={!isPremium || !toggles.breederPage}
          />
        </div>
      </div>

      {isPremium && (
        <p className="text-[11px] text-muted-foreground text-center">
          Your posts automatically build your breeder page.
        </p>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between py-2 px-3 rounded-lg",
      disabled ? "opacity-50" : "bg-muted/30"
    )}>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
