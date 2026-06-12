import { Link } from "react-router-dom";
import { BadgeCheck, MapPin, Trophy } from "lucide-react";
import type { DirectoryBreeder } from "@/hooks/useBreederDirectory";
import { stateAbbr } from "@/hooks/useBreederDirectory";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function availability(b: DirectoryBreeder): { color: string; label: string } {
  if (b.subscription_tier === "breeder_page") return { color: "bg-[#39D98A] shadow-[0_0_8px_rgba(57,217,138,0.55)]", label: "Available Now" };
  if (b.subscription_tier === "listing") return { color: "bg-[#F5C842]", label: "Coming Soon" };
  return { color: "bg-[#4A5568]", label: "None Listed" };
}

export function HorizontalBreederCard({ b, index = 0 }: { b: DirectoryBreeder; index?: number }) {
  const isPaid = b.subscription_tier === "breeder_page" || b.subscription_tier === "listing";
  const link = isPaid ? `/breeder/${b.username}` : "#";
  const state = stateAbbr(b.location);
  const avail = availability(b);
  const name = b.display_name || b.username;

  return (
    <Link
      to={link}
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
      className="group flex gap-3 rounded-2xl border border-white/10 bg-[#141E2E] p-3 opacity-0 animate-fade-in transition-all hover:border-[hsl(var(--gold))]/40 hover:bg-[#1a263a]"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
        {b.logo_url ? (
          <img src={b.logo_url} alt={name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a2a44] to-[hsl(var(--primary))]">
            <span className="text-xl font-black text-[hsl(var(--gold))]/80">{initials(name)}</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[15px] font-bold leading-tight text-white">{name}</h3>
            {isPaid && <BadgeCheck className="h-3.5 w-3.5 shrink-0 fill-[hsl(var(--gold))] text-black" strokeWidth={2.5} />}
            {state && (
              <span className="ml-auto rounded-full bg-white/8 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/70">
                {state}
              </span>
            )}
          </div>
          {b.location && (
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/45">
              <MapPin className="h-2.5 w-2.5" />
              <span className="truncate">{b.location}</span>
            </p>
          )}
          {b.winnerCount > 0 && (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[hsl(var(--gold))]">
              <Trophy className="h-3 w-3" />
              {b.winnerCount} championship win{b.winnerCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[10px] text-white/60">
            <span className={`h-1.5 w-1.5 rounded-full ${avail.color}`} />
            {avail.label}
          </span>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="rounded-full bg-[hsl(var(--gold))] px-3 py-0.5 text-[10px] font-bold text-black hover:bg-[#d4b558]"
          >
            Follow
          </button>
        </div>
      </div>
    </Link>
  );
}
