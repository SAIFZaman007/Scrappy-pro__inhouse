import type { Job } from "../lib/types";
import { elapsed } from "../lib/format";

/**
 * Segmented meter: one notch per selected category. Notches turn teal as each
 * category finishes and the current one pulses crimson, so progress reads at a
 * glance from across the desk without needing a percentage.
 */
export default function RunMeter({ job }: { job: Job }) {
  const notches = Math.max(job.total_units, 1);
  const done = job.completed_units;
  const isLive = job.status === "running";

  return (
    <div className="flex flex-col gap-3">
      <div className="meter" role="progressbar" aria-valuenow={job.progress_percent} aria-valuemin={0} aria-valuemax={100}>
        {Array.from({ length: notches }, (_, index) => (
          <span
            key={index}
            className="meter-notch"
            data-state={index < done ? "done" : index === done && isLive ? "active" : "idle"}
          />
        ))}
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
        <Stat label="Products" value={job.products_found.toLocaleString()} emphasis />
        <Stat label="Categories" value={`${done} / ${job.total_units}`} />
        <Stat label="Pages read" value={job.pages_fetched.toLocaleString()} />
        <Stat label="Elapsed" value={elapsed(job.started_at, job.finished_at)} />
      </dl>

      {job.current_step && isLive && (
        <p className="text-[13px] text-muted">
          Now collecting <span className="text-ink font-medium">{job.current_step}</span>
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd
        className={`font-mono tabular-nums ${
          emphasis ? "text-[26px] leading-tight text-ink" : "text-[17px] text-ink-soft"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
