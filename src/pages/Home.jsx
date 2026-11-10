import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import KanbanBoard from '@/components/KanbanBoard';
import BulkJobActions from '@/components/BulkJobActions';
import StatsStrip from '@/components/StatsStrip';
import AddJobDialog from '@/components/jobs/AddJobDialog';
import { unwrap } from '@/lib/constants';

export default function Home() {
  const [jobs, setJobs] = useState(null);
  const [outreach, setOutreach] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const refreshTimer = useRef(null);

  const load = useCallback(async () => {
    const [jobPage, outreachPage] = await Promise.all([
      base44.entities.Job.list({ sort: '-created_date', limit: 200 }),
      base44.entities.Outreach.list({ sort: '-created_date', limit: 200 }),
    ]);
    const jobItems = unwrap(jobPage);
    setJobs(jobItems);
    setOutreach(unwrap(outreachPage));
    setSelected((prev) => prev.filter((id) => jobItems.some((j) => j.id === id)));
  }, []);

  useEffect(() => {
    load();
    // Bursts of changes (bulk imports, re-scoring) arrive as many events; coalesce them into one refresh.
    const unsubscribe = base44.entities.Job.subscribe(() => {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => load(), 1200);
    });
    return () => {
      clearTimeout(refreshTimer.current);
      unsubscribe();
    };
  }, [load]);

  const moveJob = async (job, status) => {
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status } : j)));
    await base44.entities.Job.update(job.id, { status });
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const moveSelected = async (status) => {
    const ids = selected;
    if (!ids.length) return;
    setJobs((prev) => prev.map((j) => (ids.includes(j.id) ? { ...j, status } : j)));
    setSelected([]);
    await base44.entities.Job.bulkUpdate(ids.map((id) => ({ id, status })));
  };

  return (
    <div className="fade-rise space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Your search
          </p>
          <h1 className="text-[26px] leading-tight sm:text-[32px]">Pipelines, in view</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/coach"
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[13px] transition-colors hover:bg-secondary"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent-foreground" /> Score a role
          </Link>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-[13px] text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Add role
          </button>
        </div>
      </header>

      <StatsStrip jobs={jobs || []} outreach={outreach} />

      {jobs === null ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-secondary/60" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-card p-8 text-center sm:p-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Empty board</p>
          <h2 className="mx-auto mt-3 max-w-md text-[22px] leading-snug sm:text-[26px]">
            Paste a job link to Career Coach and it lands here, scored.
          </h2>
          <p className="mx-auto mt-2.5 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
            You'll get a fit score, honest skill gaps, and three resume bullets drawn only from your real experience.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/coach"
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] text-primary-foreground"
            >
              <Sparkles className="h-3.5 w-3.5" /> Open Career Coach <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => setAddOpen(true)}
              className="rounded-full border border-border px-4 py-2 text-[13px] transition-colors hover:bg-secondary"
            >
              Paste a role
            </button>
          </div>
        </div>
      ) : (
        <>
          {selected.length > 0 && (
            <BulkJobActions
              count={selected.length}
              onMove={moveSelected}
              onClear={() => setSelected([])}
            />
          )}
          <KanbanBoard
            jobs={jobs}
            onMove={moveJob}
            onAdd={() => setAddOpen(true)}
            selected={selected}
            onToggleSelect={toggleSelect}
          />
        </>
      )}

      <AddJobDialog open={addOpen} onOpenChange={setAddOpen} onSaved={load} />
    </div>
  );
}