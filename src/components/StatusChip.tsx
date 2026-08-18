import type { JobStatus } from "../lib/types";

const STYLES: Record<JobStatus, string> = {
  queued: "bg-paper text-muted",
  running: "bg-signal-soft text-signal",
  completed: "bg-good-soft text-good",
  failed: "bg-signal-soft text-signal",
  cancelled: "bg-warn-soft text-warn",
};

const LABELS: Record<JobStatus, string> = {
  queued: "Queued",
  running: "Running",
  completed: "Complete",
  failed: "Failed",
  cancelled: "Cancelled",
};

export default function StatusChip({ status }: { status: JobStatus }) {
  return (
    <span className={`chip ${STYLES[status]}`}>
      {status === "running" && (
        <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" aria-hidden />
      )}
      {LABELS[status]}
    </span>
  );
}
