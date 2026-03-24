import type { SlotEntry } from "./types";
import { SLOT_LABELS, SLOT_ICONS } from "@/lib/normalizePlace";

export function HeroResult({ entry }: { entry: SlotEntry }) {
  const label = SLOT_LABELS[entry.slot];
  const icon = SLOT_ICONS[entry.slot];

  return (
    <div className="mt-5 mb-6 bg-muted/40 rounded-2xl px-5 py-6">
      {/* Label */}
      <p className="text-[12px] font-medium text-muted-foreground/80 uppercase tracking-[0.08em] text-center">
        {icon && <span className="mr-1.5 opacity-70">{icon}</span>}
        {label}
      </p>

      {entry.filled ? (
        <>
          {/* Winner name — dominant */}
          <p className="text-[30px] font-bold text-foreground leading-[1.15] mt-2 text-center">
            {entry.exhibitor}
          </p>

          {/* Context — breeder / sire */}
          {entry.breeder && (
            <p className="text-[14px] text-muted-foreground mt-2 text-center">
              {entry.breeder}
            </p>
          )}

          {/* Photo */}
          {entry.image && (
            <div className="flex justify-center mt-4">
              <img
                src={entry.image}
                alt={label}
                className="w-full max-w-[280px] aspect-[4/5] rounded-2xl object-cover bg-muted shadow-sm"
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
