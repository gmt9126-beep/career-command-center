import { useState } from 'react';
import { ExternalLink, PenLine, Users } from 'lucide-react';
import OutreachDraftDialog from '@/components/jobs/OutreachDraftDialog';

const searchUrl = (keywords) =>
  `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keywords.trim())}`;

export default function NextSteps({ job, onDrafted }) {
  const [showPeople, setShowPeople] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);

  const company = job.company || '';
  const role = job.role || '';

  const people = [
    {
      label: 'Someone on the team',
      detail: `A ${role || 'designer'} or close peer at ${company} — closest to the real work.`,
      keywords: `${company} ${role}`,
    },
    {
      label: 'A recruiter',
      detail: `Talent or recruiting at ${company} — ask about process and timeline.`,
      keywords: `${company} recruiter`,
    },
    {
      label: 'An NYU alum',
      detail: `New York University alumni at ${company} — the shared school is an easy opener.`,
      keywords: `${company} New York University`,
    },
  ];

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px]">Next steps</h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Get a human in the loop before you apply.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setShowPeople((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] transition-colors hover:bg-secondary"
          >
            <Users className="h-3 w-3" /> Find people
          </button>
          <button
            onClick={() => setDraftOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12px] text-primary-foreground transition-opacity hover:opacity-90"
          >
            <PenLine className="h-3 w-3" /> Draft outreach
          </button>
        </div>
      </div>

      {showPeople && (
        <div className="mt-3.5 space-y-2">
          {people.map((person) => (
            <div
              key={person.label}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/50 px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium">{person.label}</p>
                <p className="text-[11.5px] leading-relaxed text-muted-foreground">{person.detail}</p>
              </div>
              <a
                href={searchUrl(person.keywords)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11.5px] hover:bg-background"
              >
                Search LinkedIn <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Copy a profile you like, then paste it into Draft outreach.
          </p>
        </div>
      )}

      <OutreachDraftDialog open={draftOpen} onOpenChange={setDraftOpen} job={job} onDrafted={onDrafted} />
    </section>
  );
}