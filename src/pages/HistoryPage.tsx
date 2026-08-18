import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import StatusChip from "../components/StatusChip";
import { api } from "../lib/api";
import { elapsed } from "../lib/format";

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["jobs", page],
    queryFn: () => api.jobs(page),
    refetchInterval: 10_000,
  });

  if (isLoading) return <div className="panel h-64 animate-pulse bg-paper" />;

  if (!data || data.items.length === 0) {
    return (
      <div className="panel px-6 py-16 text-center">
        <h2 className="text-[20px]">No runs yet</h2>
        <p className="text-muted mt-2">Start your first collection from the console.</p>
        <Link to="/" className="btn btn-signal mt-5 inline-flex">
          New run
        </Link>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.page_size));

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-[28px]">Run history</h1>

      <div className="panel divide-y divide-line">
        {data.items.map((job) => (
          <Link
            key={job.id}
            to={`/runs/${job.id}`}
            className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3.5 hover:bg-paper/60"
          >
            <StatusChip status={job.status} />
            <span className="font-display font-semibold text-[14px] min-w-[150px]">
              {job.site_name}
            </span>
            <span className="font-mono text-[13px] tabular-nums">
              {job.products_found.toLocaleString()} products
            </span>
            <span className="text-[13px] text-muted">
              {job.completed_units}/{job.total_units} categories
            </span>
            <span className="text-[13px] text-muted">
              {elapsed(job.started_at, job.finished_at)}
            </span>
            <span className="ml-auto text-[12px] text-muted font-mono">
              {new Date(job.created_at).toLocaleString()}
            </span>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-3 justify-center text-[13px]">
          <button
            className="btn btn-ghost py-1 px-3"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="font-mono text-muted">
            {page} / {totalPages}
          </span>
          <button
            className="btn btn-ghost py-1 px-3"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
