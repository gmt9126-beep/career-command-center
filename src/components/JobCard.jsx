import { Link } from 'react-router-dom';
import { MapPin, Building2 } from 'lucide-react';
import FitRing from '@/components/FitRing';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDate } from '@/lib/constants';

export default function JobCard({ job, dragging, selected, onSelect }) {
  return (
    <article
      className={`relative rounded-xl border bg-card p-3.5 transition-shadow ${
        selected ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border/80'
      } ${
        dragging ? 'shadow-xl ring-1 ring-ring/30' : 'hover:shadow-[0_10px_24px_-18px_rgba(20,20,30,0.4)]'
      }`}
    >
      <Checkbox
        checked={!!selected}
        onCheckedChange={(value) => onSelect?.(!!value)}
        aria-label={`Select ${job.role}${job.company ? ` at ${job.company}` : ''}`}
        className="absolute left-3.5 top-3.5 z-10 h-3.5 w-3.5"
      />
      <Link to={`/jobs/${job.id}`} className="block pl-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{job.company}</span>
            </p>
            <p className="mt-1 text-[13.5px] font-medium leading-snug text-foreground">{job.role}</p>
          </div>
          {Number(job.fit_score) > 0 && <FitRing score={job.fit_score} size={34} />}
        </div>

        {job.fit_reason && (
          <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-foreground/70">{job.fit_reason}</p>
        )}

        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          {job.location && (
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{job.location}</span>
            </span>
          )}
          {job.date_added && <span className="ml-auto shrink-0 font-mono text-[10px]">{formatDate(job.date_added)}</span>}
        </div>

        {job.skill_scores?.length > 0 && (
          <div className="mt-2.5 flex gap-1">
            {job.skill_scores.slice(0, 5).map((s) => (
              <span
                key={s.skill}
                title={`${s.skill}: ${s.score}/5`}
                className="h-1 flex-1 rounded-full bg-secondary"
              >
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${(Math.min(5, Number(s.score) || 0) / 5) * 100}%`,
                    background: 'hsl(165 30% 38%)',
                  }}
                />
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}