import type { SlotEntry } from "./types";
import { SLOT_LABELS, SLOT_ICONS } from "@/lib/normalizePlace";

interface HeroResultProps {
  entry: SlotEntry;
  onImageTap?: () => void;
}

export function HeroResult({ entry, onImageTap }: HeroResultProps) {
  const label = SLOT_LABELS[entry.slot];
  const icon = SLOT_ICONS[entry.slot];

  return (
    <div className="mt-5 mb-6 bg-muted/40 rounded-2xl px-4 py-6">
      {/* Label */}
      <p className="text-[12px] font-medium text-muted-foreground/80 uppercase tracking-[0.08em] text-center">
        {icon && <span className="mr-1.5 opacity-70">{icon}</span>}
        {label}
      </p>

      {entry.filled ? (
        <>
          {/* Winner name */}
          <p className="text-[30px] font-bold text-foreground leading-[1.15] mt-2 text-center">
            {entry.exhibitor}
          </p>

          {/* Breeder */}
          {entry.breeder && (
            <p className="text-[14px] text-muted-foreground mt-2 text-center">
              {entry.breeder}
            </p>
          )}

          {/* Photo — full width, tappable */}
          {entry.image && (
            <div
              className="mt-4 -mx-4 cursor-pointer active:opacity-90 transition-opacity"
              onClick={onImageTap}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onImageTap?.()}
            >
            <img
                src={entry.image}
                alt={label}
                className="w-[120px] h-[120px] rounded-xl object-cover bg-muted shadow-sm mx-auto"
                loading="lazy"
              />
            </div>
          )}
        </>
      ) : (
        <p className="text-[14px] text-muted-foreground/60 italic mt-3 text-center">
          Pending update
        </p>
      )}
    </div>
  );
}
