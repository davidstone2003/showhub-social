import { ReactNode, useState } from "react";
import { Search, LayoutGrid, List as ListIcon, X } from "lucide-react";

interface PageHeaderProps {
  title: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  viewToggle?: { view: "list" | "grid"; onViewChange: (v: "list" | "grid") => void };
  createButton?: ReactNode;
}

/**
 * Shared dark page header band. Sticky under top app bar.
 * Search expands inline within the band when icon is clicked.
 */
export function PageHeader({
  title,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  viewToggle,
  createButton,
}: PageHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchEnabled = typeof onSearchChange === "function";

  return (
    <div
      className="sticky top-0 z-30 px-4 flex items-center justify-between bg-primary"
      style={{ height: 60, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      {searchOpen && searchEnabled ? (
        <div className="flex items-center gap-2 w-full">
          <Search className="w-4 h-4 shrink-0" style={{ color: "rgba(255,255,255,0.6)" }} />
          <input
            autoFocus
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder || "Search..."}
            className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none"
          />
          <button
            onClick={() => {
              setSearchOpen(false);
              onSearchChange?.("");
            }}
            className="p-1.5"
            aria-label="Close search"
          >
            <X className="w-5 h-5" style={{ color: "rgba(255,255,255,0.7)" }} />
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-[22px] font-bold leading-none text-white">{title}</h1>
          <div className="flex items-center gap-2">
            {searchEnabled && (
              <button onClick={() => setSearchOpen(true)} className="p-1.5" aria-label="Search">
                <Search className="w-5 h-5" style={{ color: "rgba(255,255,255,0.6)" }} />
              </button>
            )}
            {viewToggle && (
              <div
                className="flex rounded-lg overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <button
                  onClick={() => viewToggle.onViewChange("list")}
                  className="p-2"
                  style={{
                    backgroundColor: viewToggle.view === "list" ? "rgba(201,168,76,0.25)" : "transparent",
                  }}
                  aria-label="List view"
                >
                  <ListIcon
                    className="w-4 h-4"
                    style={{ color: viewToggle.view === "list" ? "hsl(var(--gold))" : "rgba(255,255,255,0.5)" }}
                  />
                </button>
                <button
                  onClick={() => viewToggle.onViewChange("grid")}
                  className="p-2"
                  style={{
                    backgroundColor: viewToggle.view === "grid" ? "rgba(201,168,76,0.25)" : "transparent",
                  }}
                  aria-label="Grid view"
                >
                  <LayoutGrid
                    className="w-4 h-4"
                    style={{ color: viewToggle.view === "grid" ? "hsl(var(--gold))" : "rgba(255,255,255,0.5)" }}
                  />
                </button>
              </div>
            )}
            {createButton}
          </div>
        </>
      )}
    </div>
  );
}
