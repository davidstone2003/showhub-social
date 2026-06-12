import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Search } from "lucide-react";

export interface TaggedPerson {
  id: string;
  name: string;
  username: string;
  logo_url: string | null;
}

interface PeopleTaggerProps {
  tagged: TaggedPerson[];
  onChange: (people: TaggedPerson[]) => void;
}

export function PeopleTagger({ tagged, onChange }: PeopleTaggerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TaggedPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("profiles")
        .select("id, display_name, first_name, last_name, username, logo_url")
        .or(
          `username.ilike.%${query}%,display_name.ilike.%${query}%,first_name.ilike.%${query}%`
        )
        .limit(8);
      const mapped: TaggedPerson[] = (data || [])
        .filter((p: any) => !tagged.find((t) => t.id === p.id))
        .map((p: any) => ({
          id: p.id,
          name:
            [p.first_name, p.last_name].filter(Boolean).join(" ") ||
            p.display_name ||
            p.username ||
            "",
          username: p.username || "",
          logo_url: p.logo_url,
        }));
      setResults(mapped);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [query, tagged]);

  const addPerson = (person: TaggedPerson) => {
    onChange([...tagged, person]);
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  const removePerson = (id: string) => {
    onChange(tagged.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-3">
      {tagged.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tagged.map((person) => (
            <div
              key={person.id}
              className="inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-full"
              style={{ backgroundColor: "#C9A84C20", border: "1px solid #C9A84C40" }}
            >
              {person.logo_url ? (
                <img
                  src={person.logo_url}
                  alt={person.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-[#C9A84C]"
                  style={{ background: "linear-gradient(135deg, #0A1628, #1a2a44)" }}
                >
                  {person.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[13px] font-semibold" style={{ color: "#0A1628" }}>
                {person.name}
              </span>
              <button onClick={() => removePerson(person.id)} aria-label="Remove">
                <X className="w-3.5 h-3.5" style={{ color: "#8B6914" }} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or @username..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[14px] text-[#0A1628] placeholder:text-[#9CA3AF] outline-none focus:border-[#C9A84C]"
        />
      </div>

      {results.length > 0 && (
        <div className="rounded-xl border border-[#E5E7EB] overflow-hidden bg-white">
          {results.map((person, i) => (
            <button
              key={person.id}
              onClick={() => addPerson(person)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F8F7F4] transition-colors"
              style={{
                borderBottom: i < results.length - 1 ? "1px solid #F3F4F6" : "none",
              }}
            >
              {person.logo_url ? (
                <img
                  src={person.logo_url}
                  alt={person.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold text-[#C9A84C] flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #0A1628, #1a2a44)" }}
                >
                  {person.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold truncate" style={{ color: "#0A1628" }}>
                  {person.name}
                </div>
                {person.username && (
                  <div className="text-[12px] text-[#5C6470] truncate">@{person.username}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {loading && <p className="text-[12px] text-[#9CA3AF]">Searching...</p>}
      {query.length > 1 && !loading && results.length === 0 && (
        <p className="text-[12px] text-[#9CA3AF]">No users found for "{query}"</p>
      )}
    </div>
  );
}
