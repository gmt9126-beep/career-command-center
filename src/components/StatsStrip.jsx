import { Target, Send, MessagesSquare, TrendingUp } from 'lucide-react';

export default function StatsStrip({ jobs = [], outreach = [] }) {
  const scored = jobs.filter((j) => Number(j.fit_score) > 0);
  const avg = scored.length
    ? Math.round(scored.reduce((sum, j) => sum + Number(j.fit_score), 0) / scored.length)
    : null;

  const items = [
    { label: 'Roles tracked', value: jobs.length, icon: Target },
    { label: 'In play', value: jobs.filter((j) => ['Applied', 'Interviewing', 'Offer'].includes(j.status)).length, icon: Send },
    { label: 'Outreach sent', value: outreach.filter((o) => o.status !== 'Draft').length, icon: MessagesSquare },
    { label: 'Avg fit', value: avg === null ? '—' : avg, icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
      {items.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-xl border border-border/80 bg-card px-3.5 py-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
            <span className="text-[11px] uppercase tracking-[0.1em]">{label}</span>
          </div>
          <p className="mt-1.5 font-heading text-[24px] leading-none tabular-nums">{value}</p>
        </div>
      ))}
    </div>
  );
}