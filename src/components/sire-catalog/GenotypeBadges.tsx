import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  parseGenotype,
  SCRAPIE_INFO,
  SPIDER_INFO,
  DWARF_INFO,
} from "@/lib/genotype";
import { cn } from "@/lib/utils";

interface GenotypeBadgesProps {
  raw: string | null | undefined;
  size?: "sm" | "md";
}

export function GenotypeBadges({ raw, size = "sm" }: GenotypeBadgesProps) {
  const { scrapie, spider, dwarf } = parseGenotype(raw);

  const items: { key: string; label: string; tone: string; tooltip: string }[] = [];
  if (scrapie) items.push({ key: "s", ...SCRAPIE_INFO[scrapie] });
  if (spider) items.push({ key: "p", ...SPIDER_INFO[spider] });
  if (dwarf) items.push({ key: "d", ...DWARF_INFO[dwarf] });

  if (items.length === 0) {
    return <span className="text-xs italic text-muted-foreground">Genotype unlisted</span>;
  }

  const padding = size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]";

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <Tooltip key={it.key} delayDuration={150}>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline-flex items-center rounded-full border font-semibold whitespace-nowrap",
                padding,
                it.tone,
              )}
            >
              {it.label}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-xs">
            {it.tooltip}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
