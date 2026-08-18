import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import type { Category } from "../lib/types";

interface Props {
  categories: Category[];
  selected: Set<number>;
  onChange: (next: Set<number>) => void;
}

/**
 * The picker only ever offers subcategories this retailer actually has a mapped
 * listing page for. Unmapped ones stay visible but disabled, so the operator can
 * see *why* something is unavailable instead of wondering where it went.
 */
export default function CategoryPicker({ categories, selected, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return categories;
    return categories
      .map((category) => ({
        ...category,
        subcategories: category.subcategories.filter(
          (sub) =>
            sub.name.toLowerCase().includes(needle) ||
            category.name.toLowerCase().includes(needle),
        ),
      }))
      .filter((category) => category.subcategories.length > 0);
  }, [categories, query]);

  const mappedIds = useMemo(
    () =>
      categories.flatMap((c) => c.subcategories.filter((s) => s.is_mapped).map((s) => s.id)),
    [categories],
  );

  function toggle(id: number) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  function toggleCategory(category: Category) {
    const ids = category.subcategories.filter((s) => s.is_mapped).map((s) => s.id);
    const allOn = ids.length > 0 && ids.every((id) => selected.has(id));
    const next = new Set(selected);
    ids.forEach((id) => {
      if (allOn) next.delete(id);
      else next.add(id);
    });
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow">Categories</span>
        <div className="flex items-center gap-3 text-[12px]">
          <button
            className="text-signal hover:underline"
            onClick={() => onChange(new Set(mappedIds))}
          >
            Select all available
          </button>
          <button
            className="text-muted hover:underline"
            onClick={() => onChange(new Set())}
            disabled={selected.size === 0}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          className="field pl-9"
          placeholder="Find a category"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Find a category"
        />
      </div>

      <div className="panel divide-y divide-line max-h-[520px] overflow-y-auto">
        {filtered.map((category) => {
          const available = category.subcategories.filter((s) => s.is_mapped);
          const chosen = available.filter((s) => selected.has(s.id)).length;
          const isOpen = !collapsed.has(category.id);

          return (
            <div key={category.id}>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-paper/60">
                <button
                  className="flex items-center gap-2 flex-1 text-left"
                  onClick={() => {
                    const next = new Set(collapsed);
                    if (isOpen) next.add(category.id);
                    else next.delete(category.id);
                    setCollapsed(next);
                  }}
                  aria-expanded={isOpen}
                >
                  <ChevronDown
                    size={14}
                    className={`text-muted transition-transform ${isOpen ? "" : "-rotate-90"}`}
                    aria-hidden
                  />
                  <span className="font-display font-semibold text-[13px]">{category.name}</span>
                  <span className="font-mono text-[11px] text-muted">
                    {available.length}/{category.subcategories.length}
                  </span>
                </button>
                {chosen > 0 && (
                  <span className="chip bg-signal-soft text-signal">{chosen} on</span>
                )}
                <button
                  className="text-[12px] text-muted hover:text-ink"
                  onClick={() => toggleCategory(category)}
                  disabled={available.length === 0}
                >
                  {chosen === available.length && available.length > 0 ? "None" : "All"}
                </button>
              </div>

              {isOpen && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-line">
                  {category.subcategories.map((sub) => {
                    const on = selected.has(sub.id);
                    return (
                      <button
                        key={sub.id}
                        onClick={() => toggle(sub.id)}
                        disabled={!sub.is_mapped}
                        title={
                          sub.is_mapped
                            ? (sub.url_path ?? undefined)
                            : "This retailer has no listing page mapped for this category yet"
                        }
                        className={`flex items-center gap-2 px-3 py-2 text-left text-[13px] bg-panel transition-colors ${
                          sub.is_mapped
                            ? "hover:bg-paper cursor-pointer"
                            : "opacity-40 cursor-not-allowed"
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 shrink-0 border rounded-[2px] flex items-center justify-center ${
                            on ? "bg-signal border-signal" : "border-line-strong"
                          }`}
                          aria-hidden
                        >
                          {on && <Check size={10} className="text-white" strokeWidth={3} />}
                        </span>
                        <span className="truncate">{sub.name}</span>
                        {sub.is_mapped && !sub.is_verified && (
                          <span
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-warn shrink-0"
                            title="Mapping not yet verified"
                            aria-label="Mapping not yet verified"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="px-3 py-6 text-[13px] text-muted text-center">
            Nothing matches “{query}”. Try a shorter word.
          </p>
        )}
      </div>

      <p className="text-[12px] text-muted flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-warn inline-block" aria-hidden />
        Amber dot means the listing URL is a best guess and has not been checked against
        the live site yet.
      </p>
    </div>
  );
}
