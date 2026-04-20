import { cn } from "@/lib/utils";

export interface Filters {
  availability: "all" | "available" | "reference";
  scrapie: "all" | "RR" | "QR" | "QQ";
  spider: "all" | "NN" | "SN" | "SS";
  dwarf: "all" | "FF" | "FD" | "DD";
  breederId: "all" | string;
}

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  breederCounts: { id: string; name: string; count: number; accent_color: string }[];
}

interface SectionProps {
  title: string;
  underline: string;
  children: React.ReactNode;
}
function Section({ title, underline, children }: SectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wide text-foreground pb-1.5 border-b-2" style={{ borderColor: underline }}>
        {title}
      </h3>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

interface OptProps {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  accent?: string;
}
function Opt({ label, count, active, onClick, accent }: OptProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "w-full flex items-center justify-between text-left px-2 py-1 rounded text-xs transition-colors",
          active
            ? "bg-[hsl(var(--primary))]/10 text-foreground font-semibold"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        style={active && accent ? { background: `${accent}1a`, color: accent } : undefined}
      >
        <span className="truncate">{label}</span>
        {typeof count === "number" && (
          <span className="text-[10px] tabular-nums opacity-70">{count}</span>
        )}
      </button>
    </li>
  );
}

export function CatalogFilters({ filters, setFilters, breederCounts }: Props) {
  return (
    <div className="space-y-5">
      <Section title="Availability" underline="hsl(142 70% 35%)">
        <Opt label="All" active={filters.availability === "all"} onClick={() => setFilters({ ...filters, availability: "all" })} />
        <Opt label="Semen Available" active={filters.availability === "available"} onClick={() => setFilters({ ...filters, availability: "available" })} />
        <Opt label="Reference Sires" active={filters.availability === "reference"} onClick={() => setFilters({ ...filters, availability: "reference" })} />
      </Section>

      <Section title="Scrapie Gene" underline="hsl(142 70% 35%)">
        <Opt label="All" active={filters.scrapie === "all"} onClick={() => setFilters({ ...filters, scrapie: "all" })} />
        <Opt label="RR — Resistant" active={filters.scrapie === "RR"} onClick={() => setFilters({ ...filters, scrapie: "RR" })} />
        <Opt label="QR — Carrier" active={filters.scrapie === "QR"} onClick={() => setFilters({ ...filters, scrapie: "QR" })} />
        <Opt label="QQ — Susceptible" active={filters.scrapie === "QQ"} onClick={() => setFilters({ ...filters, scrapie: "QQ" })} />
      </Section>

      <Section title="Spider Gene" underline="hsl(210 80% 45%)">
        <Opt label="All" active={filters.spider === "all"} onClick={() => setFilters({ ...filters, spider: "all" })} />
        <Opt label="NN — Free" active={filters.spider === "NN"} onClick={() => setFilters({ ...filters, spider: "NN" })} />
        <Opt label="SN — Carrier" active={filters.spider === "SN"} onClick={() => setFilters({ ...filters, spider: "SN" })} />
        <Opt label="SS — Affected" active={filters.spider === "SS"} onClick={() => setFilters({ ...filters, spider: "SS" })} />
      </Section>

      <Section title="Dwarf Gene" underline="hsl(270 60% 50%)">
        <Opt label="All" active={filters.dwarf === "all"} onClick={() => setFilters({ ...filters, dwarf: "all" })} />
        <Opt label="FF — Free" active={filters.dwarf === "FF"} onClick={() => setFilters({ ...filters, dwarf: "FF" })} />
        <Opt label="FD — Carrier" active={filters.dwarf === "FD"} onClick={() => setFilters({ ...filters, dwarf: "FD" })} />
        <Opt label="DD — Affected" active={filters.dwarf === "DD"} onClick={() => setFilters({ ...filters, dwarf: "DD" })} />
      </Section>

      <Section title="Breeder" underline="hsl(142 70% 35%)">
        <Opt label="All" active={filters.breederId === "all"} onClick={() => setFilters({ ...filters, breederId: "all" })} />
        {breederCounts.map((b) => (
          <Opt
            key={b.id}
            label={b.name}
            count={b.count}
            active={filters.breederId === b.id}
            accent={b.accent_color}
            onClick={() => setFilters({ ...filters, breederId: b.id })}
          />
        ))}
      </Section>
    </div>
  );
}
