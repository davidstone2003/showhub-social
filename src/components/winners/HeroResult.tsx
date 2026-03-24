import type { SlotEntry } from "./types";
import { SLOT_LABELS, SLOT_ICONS } from "@/lib/normalizePlace";

export function HeroResult({ entry }: { entry: SlotEntry }) {
  const label = SLOT_LABELS[entry.slot];
  const icon = SLOT_ICONS[entry.slot];

  return (
    <div className="pt-4 pb-8">
      {/* Label */}
      <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-[0.08em] text-center">
        {icon && <span className="mr-1.5">{icon}</span>}
        {label}
      </p>

      {entry.filled ? (
        <>
          {/* Winner name — dominant */}
          <p className="text-[30px] font-bold text-foreground leading-tight mt-3 text-center">
            {entry.exhibitor}
          </p>

          {/* Photo */}
          {entry.image && (
            <div className="flex justify-center mt-4">
              <img
                src={entry.image}
                alt={label}
                className="w-[148px] h-[148px] rounded-2xl object-cover bg-muted"
                loading="lazy"
              />
            </div>
          )}

          {/* Breeder */}
          {entry.breeder && (
            <p className="text-[14px] text-muted-foreground mt-3 text-center">
              {entry.breeder}
            </p>
          )}
        </>
      ) : (
        <p className="text-[14px] text-muted-foreground/70 italic mt-3 text-center">
          Pending update
        </p>
      )}
    </div>
  );
}
