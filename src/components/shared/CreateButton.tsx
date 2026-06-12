import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface CreateButtonProps {
  to?: string;
  label: string;
  menu?: { label: string; to: string }[];
}

/**
 * Shared create button used in every PageHeader.
 * Hidden entirely when the user is logged out.
 * Compact gold pill; collapses to icon-only on very narrow widths.
 */
export function CreateButton({ to, label, menu }: CreateButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menu]);

  if (!user) return null;

  const cls =
    "inline-flex items-center gap-1 rounded-full h-8 pl-2.5 pr-3 text-[12px] font-bold active:scale-95 transition-transform whitespace-nowrap";
  const style = { backgroundColor: "hsl(var(--gold))", color: "hsl(var(--primary))" } as const;

  const inner = (
    <>
      <Plus className="w-3.5 h-3.5" strokeWidth={3} />
      <span className="hidden xs:inline sm:inline">{label.replace(/^\+\s*/, "")}</span>
    </>
  );

  if (menu) {
    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={label}
          className={cls}
          style={style}
        >
          {inner}
        </button>
        {open && (
          <div
            className="absolute right-0 top-full mt-1 rounded-xl bg-white border border-[#E5E7EB] shadow-xl z-50 overflow-hidden"
            style={{ minWidth: 160 }}
          >
            {menu.map((m) => (
              <Link
                key={m.to}
                to={m.to}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-[13px] font-semibold text-[hsl(var(--primary))] hover:bg-[#F8F7F4]"
                style={{ borderBottom: "1px solid #F3F4F6" }}
              >
                {m.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link to={to ?? "/submit"} aria-label={label} className={cls} style={style}>
      {inner}
    </Link>
  );
}
