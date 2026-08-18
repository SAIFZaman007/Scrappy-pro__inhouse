import { useEffect, useRef } from "react";
import type { JobEvent } from "../lib/types";
import { clockTime } from "../lib/format";

const TONE: Record<string, string> = {
  info: "text-[#c8d2e0]",
  warning: "text-[#e8b06a]",
  error: "text-[#f08a9f]",
};

/** The run tape: an append-only record of what the crawler actually did. */
export default function EventTape({ events }: { events: JobEvent[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [events.length]);

  return (
    <section className="flex flex-col gap-2">
      <span className="eyebrow">Run tape</span>
      <div className="tape" role="log" aria-live="polite" aria-label="Run activity">
        {events.length === 0 && <p className="text-[#6b7d95]">Waiting for the run to start…</p>}
        {events.map((event, index) => (
          <div key={`${event.at}-${index}`} className="tape-row">
            <span className="tape-time">{clockTime(event.at)}</span>
            <span className={TONE[event.level] ?? TONE.info}>{event.message}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </section>
  );
}
