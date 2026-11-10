import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Pencil, Trash2, Copy, Check, Mic } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import FitRing from '@/components/FitRing';
import SkillRadar from '@/components/SkillRadar';
import JobFormDialog from '@/components/JobFormDialog';
import JobDetailsPanel from '@/components/JobDetailsPanel';
import NextSteps from '@/components/jobs/NextSteps';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { JOB_STATUSES, STATUS_META, formatDate } from '@/lib/constants';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState(undefined);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(null);

  const load = async () => {
    try {
      const record = await base44.entities.Job.get(id);
      setJob(record || null);
    } catch {
      setJob(null);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (job !== null) return;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [job]);

  const changeStatus = async (status) => {
    setJob((j) => ({ ...j, status }));
    await base44.entities.Job.update(id, { status });
  };

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      toast({ title: 'Copy blocked', description: 'Select the text and copy manually.' });
    }
  };

  const remove = async () => {
    await base44.entities.Job.delete(id);
    navigate('/');
  };

  if (job === undefined) {
    return <div className="h-40 animate-pulse rounded-2xl bg-secondary/60" />;
  }

  if (job === null) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-10 text-center">
        <h1 className="text-[24px]">This role is no longer on your board</h1>
        <Link to="/" className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-[13px] text-primary-foreground">
          Back to the board
        </Link>
      </div>
    );
  }

  const meta = STATUS_META[job.status] || STATUS_META.Saved;

  return (
    <div className="fade-rise space-y-5">
      <Link to="/" className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Board
      </Link>

      <header className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{job.company}</p>
            <h1 className="mt-1.5 text-[24px] leading-tight sm:text-[30px]">{job.role}</h1>
            {job.fit_reason && (
              <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-foreground/75">{job.fit_reason}</p>
            )}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-muted-foreground">
              {job.location && <span>{job.location}</span>}
              {job.date_added && <span className="font-mono text-[11px]">Added {formatDate(job.date_added)}</span>}
              {job.link && (
                <a href={job.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-foreground underline-offset-4 hover:underline">
                  Posting <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <Link
                to={`/coach?interview=${job.id}`}
                className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11.5px] text-foreground transition-colors hover:bg-secondary"
              >
                <Mic className="h-3 w-3" /> Interview me
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {Number(job.fit_score) > 0 && (
              <div className="flex flex-col items-center">
                <FitRing score={job.fit_score} size={58} stroke={4} />
                <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">fit</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Select value={job.status} onValueChange={changeStatus}>
                <SelectTrigger className="h-8 w-[150px] text-[12.5px]" style={{ background: meta.soft }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-1.5">
                <button onClick={() => setEditOpen(true)} aria-label="Edit role" className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border px-2 py-1.5 text-[12px] hover:bg-secondary">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button onClick={() => setConfirmOpen(true)} aria-label="Delete role" className="flex items-center justify-center rounded-lg border border-border px-2 py-1.5 text-[12px] text-muted-foreground hover:bg-secondary hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <JobDetailsPanel job={job} />

      <NextSteps job={job} />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <section className="rounded-2xl border border-border/80 bg-card p-5">
            <h2 className="text-[16px]">Skill fit</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Scored against this role's requirements, 1–5.</p>
            {job.skill_scores?.length ? (
              <>
                <SkillRadar skills={job.skill_scores} />
                <div className="mt-1 space-y-2.5">
                  {job.skill_scores.map((s) => (
                    <div key={s.skill}>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[12.5px] font-medium">{s.skill}</p>
                        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{s.score}/5</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full transition-[width] duration-700"
                          style={{
                            width: `${(Math.min(5, Number(s.score) || 0) / 5) * 100}%`,
                            background: Number(s.score) >= 4 ? 'hsl(165 30% 38%)' : Number(s.score) >= 3 ? 'hsl(32 70% 50%)' : 'hsl(4 55% 55%)',
                          }}
                        />
                      </div>
                      {s.note && <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{s.note}</p>}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-3 rounded-xl bg-secondary/60 px-3.5 py-4">
                <p className="text-[12.5px] text-muted-foreground">
                  Not scored yet — the radar appears here once this role has skill scores.
                </p>
                <Link to="/coach" className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-foreground underline-offset-4 hover:underline">
                  Score it in Career Coach <ArrowLeft className="h-3 w-3 rotate-180" />
                </Link>
              </div>
            )}
          </section>

          {job.skill_gaps?.length > 0 && (
            <section className="rounded-2xl border border-border/80 bg-card p-5">
              <h2 className="text-[16px]">Honest gaps</h2>
              <ul className="mt-3 space-y-2">
                {job.skill_gaps.map((gap, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-destructive" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          {job.tailored_resume_bullets?.length > 0 && (
            <section className="rounded-2xl border border-border/80 bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px]">Tailored bullets</h2>
                <button
                  onClick={() => copy(job.tailored_resume_bullets.map((b) => `• ${b}`).join('\n'), 'all')}
                  className="flex items-center gap-1 text-[11.5px] text-muted-foreground hover:text-foreground"
                >
                  {copied === 'all' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy all
                </button>
              </div>
              <ul className="mt-3 space-y-2.5">
                {job.tailored_resume_bullets.map((bullet, i) => (
                  <li key={i} className="group flex gap-2 rounded-lg bg-secondary/50 px-3 py-2.5">
                    <p className="flex-1 text-[12.5px] leading-relaxed">{bullet}</p>
                    <button
                      onClick={() => copy(bullet, i)}
                      className="mt-0.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Copy bullet"
                    >
                      {copied === i ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-border/80 bg-card p-5">
            <h2 className="text-[16px]">Job description</h2>
            <div className="mt-2.5 max-h-[420px] overflow-y-auto whitespace-pre-wrap pr-1 text-[12.5px] leading-relaxed text-muted-foreground">
              {job.job_description || 'No description saved yet.'}
            </div>
          </section>

          {job.notes && (
            <section className="rounded-2xl border border-border/80 bg-card p-5">
              <h2 className="text-[16px]">Notes</h2>
              <p className="mt-2 whitespace-pre-wrap text-[12.5px] leading-relaxed text-muted-foreground">{job.notes}</p>
            </section>
          )}
        </div>
      </div>

      <JobFormDialog open={editOpen} onOpenChange={setEditOpen} job={job} onSaved={load} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this role?</AlertDialogTitle>
            <AlertDialogDescription>
              {job.role} at {job.company} will be deleted from your board, along with its scores and bullets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}