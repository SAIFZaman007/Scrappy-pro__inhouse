import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, FileSpreadsheet, Square } from "lucide-react";
import EventTape from "../components/EventTape";
import ResultsTable from "../components/ResultsTable";
import RunMeter from "../components/RunMeter";
import StatusChip from "../components/StatusChip";
import { api } from "../lib/api";
import { bytes } from "../lib/format";

const LIVE = new Set(["queued", "running"]);

export default function RunPage() {
  const { jobId = "" } = useParams();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState<"csv" | "xlsx" | null>(null);

  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => api.job(jobId),
    // Poll while the run is live; stop the moment it settles.
    refetchInterval: (query) =>
      query.state.data && LIVE.has(query.state.data.status) ? 2000 : false,
  });

  const job = jobQuery.data;
  const isLive = job ? LIVE.has(job.status) : false;

  const productsQuery = useQuery({
    queryKey: ["products", jobId, page],
    queryFn: () => api.products(jobId, page),
    enabled: Boolean(job),
    refetchInterval: isLive ? 5000 : false,
  });

  const exportsQuery = useQuery({
    queryKey: ["exports", jobId],
    queryFn: () => api.exports(jobId),
    enabled: Boolean(job),
  });

  const cancel = useMutation({
    mutationFn: () => api.cancelJob(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["job", jobId] }),
  });

  async function exportAs(fmt: "csv" | "xlsx") {
    setBusy(fmt);
    try {
      const file = await api.createExport(jobId, fmt);
      await api.download(jobId, file);
      queryClient.invalidateQueries({ queryKey: ["exports", jobId] });
    } finally {
      setBusy(null);
    }
  }

  if (!job) return <div className="panel h-64 animate-pulse bg-paper" />;

  const totalPages = Math.max(1, Math.ceil((productsQuery.data?.total ?? 0) / 50));
  const canExport = job.products_found > 0 && !isLive;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <Link to="/runs" className="text-[13px] text-muted hover:text-ink flex items-center gap-1.5">
          <ArrowLeft size={13} aria-hidden />
          All runs
        </Link>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <h1 className="text-[28px]">{job.site_name}</h1>
          <StatusChip status={job.status} />
          <span className="font-mono text-[12px] text-muted">{job.id.slice(0, 8)}</span>
          <div className="ml-auto flex items-center gap-2">
            {isLive && (
              <button
                className="btn btn-ghost"
                onClick={() => cancel.mutate()}
                disabled={cancel.isPending}
              >
                <Square size={13} aria-hidden />
                Stop run
              </button>
            )}
            <button
              className="btn btn-ghost"
              disabled={!canExport || busy !== null}
              onClick={() => exportAs("csv")}
            >
              <Download size={14} aria-hidden />
              {busy === "csv" ? "Preparing…" : "CSV"}
            </button>
            <button
              className="btn btn-signal"
              disabled={!canExport || busy !== null}
              onClick={() => exportAs("xlsx")}
            >
              <FileSpreadsheet size={14} aria-hidden />
              {busy === "xlsx" ? "Preparing…" : "Excel"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6 items-start">
        <div className="panel p-5">
          <RunMeter job={job} />
        </div>
        <EventTape events={job.events} />
      </div>

      {job.error_message && (
        <p className="text-[13px] text-signal bg-signal-soft px-4 py-3 rounded-[3px]">
          {job.error_message}
        </p>
      )}

      {isLive && (
        <p className="text-[13px] text-muted">
          The run keeps going if you close this tab. Come back from History any time.
        </p>
      )}

      {(exportsQuery.data?.length ?? 0) > 0 && (
        <section className="flex flex-col gap-2">
          <span className="eyebrow">Files</span>
          <div className="panel divide-y divide-line">
            {exportsQuery.data!.map((file) => (
              <div key={file.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
                <span className="font-mono">{file.filename}</span>
                <span className="text-muted">
                  {file.row_count.toLocaleString()} rows · {bytes(file.size_bytes)}
                </span>
                <button
                  className="ml-auto text-signal hover:underline"
                  onClick={() => api.download(jobId, file)}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="eyebrow">
            Collected products ({(productsQuery.data?.total ?? 0).toLocaleString()})
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-[13px]">
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
        <ResultsTable products={productsQuery.data?.items ?? []} />
      </section>
    </div>
  );
}
