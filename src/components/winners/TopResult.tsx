import type { SlotEntry } from "./types";
import { SLOT_LABELS, SLOT_ICONS } from "@/lib/normalizePlace";

export function TopResult({ entry }: { entry: SlotEntry }) {
  const label = SLOT_LABELS[entry.slot];
  const icon = SLOT_ICONS[entry.slot];

  return (
    <div>
      <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-[0.06em]">
        {icon && <span className="mr-1.5">{icon}</span>}
        {label}
      </p>
      {entry.filled ? (
        <>
          <p className="text-[19px] font-semibold text-foreground leading-snug mt-1.5">
            {entry.exhibitor}
          </p>
          {entry.breeder && (
            <p className="text-[14px] text-muted-foreground mt-1">
              {entry.breeder}
            </p>
          )}
        </>
      ) : (
        <p className="text-[14px] text-muted-foreground/70 italic mt-1.5">
          Pending update
        </p>
      )}
    </div>
  );
}
