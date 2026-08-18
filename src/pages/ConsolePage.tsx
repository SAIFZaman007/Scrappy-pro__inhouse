import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Play, Settings2 } from "lucide-react";
import CategoryPicker from "../components/CategoryPicker";
import { api, ApiError } from "../lib/api";
import type { JobOptions } from "../lib/types";

const DEFAULT_OPTIONS: JobOptions = {
  max_pages: 25,
  fetch_details: true,
  detail_concurrency: 4,
  id_prefix: "NEW",
};

export default function ConsolePage() {
  const navigate = useNavigate();
  const [siteId, setSiteId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [options, setOptions] = useState<JobOptions>(DEFAULT_OPTIONS);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sitesQuery = useQuery({ queryKey: ["sites"], queryFn: api.sites });

  useEffect(() => {
    if (siteId === null && sitesQuery.data?.length) setSiteId(sitesQuery.data[0].id);
  }, [sitesQuery.data, siteId]);

  const categoriesQuery = useQuery({
    queryKey: ["categories", siteId],
    queryFn: () => api.categories(siteId!),
    enabled: siteId !== null,
  });

  // Switching retailer invalidates the selection: the same category may not exist.
  useEffect(() => setSelected(new Set()), [siteId]);

  const site = useMemo(
    () => sitesQuery.data?.find((s) => s.id === siteId) ?? null,
    [sitesQuery.data, siteId],
  );

  const startRun = useMutation({
    mutationFn: () => api.createJob(siteId!, [...selected], options),
    onSuccess: (job) => navigate(`/runs/${job.id}`),
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : "Could not start the run."),
  });

  const canRun = siteId !== null && selected.size > 0 && !startRun.isPending;

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
      <div className="flex flex-col gap-7">
        <header>
          <h1 className="text-[32px] leading-[1.15]">Collect a catalogue</h1>
          <p className="text-muted mt-2 max-w-[60ch]">
            Pick a retailer, choose the categories you need, and start the run. Every
            product lands in one spreadsheet with prices, stock, images, specifications
            and descriptions.
          </p>
        </header>

        {/* Step 1 — retailer */}
        <section className="flex flex-col gap-3">
          <span className="eyebrow">Retailer</span>
          <div className="grid sm:grid-cols-2 gap-2">
            {sitesQuery.data?.map((option) => {
              const active = option.id === siteId;
              return (
                <button
                  key={option.id}
                  onClick={() => setSiteId(option.id)}
                  aria-pressed={active}
                  className={`panel px-4 py-3 text-left transition-colors ${
                    active ? "border-signal ring-1 ring-signal" : "hover:border-line-strong"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display font-semibold text-[15px]">{option.name}</span>
                    <span className="font-mono text-[11px] text-muted">
                      {option.mapped_subcategories} cats
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-muted">
                    {option.base_url.replace("https://", "")}
                  </span>
                </button>
              );
            })}
            {sitesQuery.isLoading &&
              Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="panel h-[68px] animate-pulse bg-paper" />
              ))}
          </div>
        </section>

        {/* Step 2 — categories */}
        {categoriesQuery.data && (
          <CategoryPicker
            categories={categoriesQuery.data}
            selected={selected}
            onChange={setSelected}
          />
        )}
        {categoriesQuery.isLoading && (
          <div className="panel h-[300px] animate-pulse bg-paper" />
        )}
      </div>

      {/* Step 3 — launch */}
      <aside className="panel p-5 flex flex-col gap-5 lg:sticky lg:top-6">
        <div>
          <span className="eyebrow">Ready to run</span>
          <p className="font-mono text-[38px] leading-none mt-2 tabular-nums">
            {selected.size}
          </p>
          <p className="text-[13px] text-muted">
            {selected.size === 1 ? "category" : "categories"} selected
            {site ? ` from ${site.name}` : ""}
          </p>
        </div>

        <div className="text-[12px] text-muted border-t border-line pt-4 flex flex-col gap-1.5">
          <Row label="Pages per category" value={`up to ${options.max_pages}`} />
          <Row
            label="Detail pages"
            value={options.fetch_details ? "fetched" : "skipped (faster)"}
          />
          <Row label="Row ID prefix" value={`${options.id_prefix}_001`} />
          {site && <Row label="Request pace" value={`${site.requests_per_second}/sec`} />}
        </div>

        <button
          className="text-[12px] text-muted hover:text-ink flex items-center gap-1.5 self-start"
          onClick={() => setShowOptions((value) => !value)}
          aria-expanded={showOptions}
        >
          <Settings2 size={13} aria-hidden />
          {showOptions ? "Hide settings" : "Change settings"}
        </button>

        {showOptions && (
          <div className="flex flex-col gap-4 border-t border-line pt-4">
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">Max pages per category</span>
              <input
                type="number"
                min={1}
                max={200}
                className="field"
                value={options.max_pages}
                onChange={(event) =>
                  setOptions({ ...options, max_pages: Number(event.target.value) })
                }
              />
              <span className="text-[12px] text-muted">
                A cap, not a target. The run stops early when a category runs out.
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">Row ID prefix</span>
              <input
                className="field font-mono"
                maxLength={10}
                value={options.id_prefix}
                onChange={(event) =>
                  setOptions({
                    ...options,
                    id_prefix: event.target.value.replace(/[^A-Za-z0-9_]/g, ""),
                  })
                }
              />
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 accent-[#a81e3f]"
                checked={options.fetch_details}
                onChange={(event) =>
                  setOptions({ ...options, fetch_details: event.target.checked })
                }
              />
              <span className="text-[13px]">
                Open each product page
                <span className="block text-[12px] text-muted">
                  Needed for specifications, descriptions and full image sets. Roughly
                  four times slower.
                </span>
              </span>
            </label>
          </div>
        )}

        {error && (
          <p className="flex items-start gap-2 text-[13px] text-signal bg-signal-soft px-3 py-2.5 rounded-[3px]">
            <AlertCircle size={15} className="shrink-0 mt-0.5" aria-hidden />
            {error}
          </p>
        )}

        <button
          className="btn btn-signal w-full"
          disabled={!canRun}
          onClick={() => {
            setError(null);
            startRun.mutate();
          }}
        >
          <Play size={15} aria-hidden />
          {startRun.isPending ? "Starting…" : "Start run"}
        </button>

        {selected.size === 0 && (
          <p className="text-[12px] text-muted -mt-2">
            Choose at least one category to begin.
          </p>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span>{label}</span>
      <span className="font-mono text-ink-soft">{value}</span>
    </div>
  );
}
