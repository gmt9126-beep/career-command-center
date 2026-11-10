import { useState } from 'react';
import { ChevronDown, Loader2, Check, AlertCircle, Wrench } from 'lucide-react';

const RUNNING = ['pending', 'running', 'in_progress'];
const FAILED = ['failed', 'error'];

export default function ToolCallChip({ toolCall }) {
  const [open, setOpen] = useState(false);
  const status = toolCall.status || '';
  const raw = typeof toolCall.results === 'string' ? toolCall.results : JSON.stringify(toolCall.results ?? '');
  const failed = FAILED.includes(status) || /"(success)"\s*:\s*false/i.test(raw);
  const running = RUNNING.includes(status);

  const projection = toolCall.display_projection || {};
  const onlyState = projection.hide_details && projection.details_redacted;
  const name = (toolCall.name || 'step').replace(/_/g, ' ');
  const label = failed
    ? projection.error_label || `Couldn't finish ${name}`
    : running
      ? projection.active_label || `Working on ${name}…`
      : projection.label || name;

  let params = toolCall.arguments_string;
  try {
    params = JSON.stringify(JSON.parse(toolCall.arguments_string || '{}'), null, 2);
  } catch {
    /* keep raw */
  }
  let result = raw;
  try {
    result = JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    /* keep raw */
  }

  return (
    <div className="mt-2">
      <button
        onClick={() => !onlyState && setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        {running ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : failed ? (
          <AlertCircle className="h-3 w-3 text-destructive" />
        ) : status ? (
          <Check className="h-3 w-3 text-accent-foreground" />
        ) : (
          <Wrench className="h-3 w-3" />
        )}
        <span className="max-w-[240px] truncate">{label}</span>
        {!onlyState && <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>

      {open && (
        <div className="mt-1.5 space-y-2 rounded-lg border border-border/70 bg-background/60 p-2.5">
          {params && params !== '{}' && (
            <div>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">Parameters</p>
              <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-[10.5px] leading-relaxed text-muted-foreground">{params}</pre>
            </div>
          )}
          {result && (
            <div>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">Result</p>
              <pre className="mt-1 max-h-56 overflow-auto whitespace-pre-wrap break-words font-mono text-[10.5px] leading-relaxed text-muted-foreground">{result}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}