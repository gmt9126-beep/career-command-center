import { Check, ExternalLink, Loader2, Plus } from 'lucide-react';

export default function RoleSuggestionCard({ suggestion, added, adding, onAdd }) {
  return (
    <article className="card-lift flex h-full flex-col rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
            {suggestion.company}
          </p>
          <h3 className="mt-1.5 text-[16px] leading-snug tracking-[-0.02em]">{suggestion.title}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          {suggestion.focus_area}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-muted-foreground">
        <span>{suggestion.location}</span>
        {suggestion.salary && suggestion.salary !== 'Not listed' && <span>· {suggestion.salary}</span>}
        <span>· {suggestion.source}</span>
      </div>

      {suggestion.why_fit && (
        <p className="mt-3 text-[12.5px] leading-relaxed text-foreground/80">{suggestion.why_fit}</p>
      )}
      {suggestion.non_technical_note && (
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
          {suggestion.non_technical_note}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        {suggestion.link ? (
          <a
            href={suggestion.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[12px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Posting <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-[12px] text-muted-foreground">Link unavailable</span>
        )}

        <button
          onClick={() => onAdd(suggestion)}
          disabled={added || adding}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-45"
        >
          {adding ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Adding
            </>
          ) : added ? (
            <>
              <Check className="h-3 w-3" /> On your board
            </>
          ) : (
            <>
              <Plus className="h-3 w-3" /> Add to board
            </>
          )}
        </button>
      </div>
    </article>
  );
}