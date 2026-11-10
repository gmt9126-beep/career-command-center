import { ArrowRight, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JOB_STATUSES } from '@/lib/constants';

export default function BulkJobActions({ count, onMove, onClear }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-2.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        {count} selected
      </span>
      <span className="hidden items-center gap-1 text-[12.5px] text-muted-foreground sm:flex">
        <ArrowRight className="h-3 w-3" /> Move to
      </span>
      <Select value="" onValueChange={onMove}>
        <SelectTrigger className="h-8 w-[160px] text-[12.5px]">
          <SelectValue placeholder="Pick a stage…" />
        </SelectTrigger>
        <SelectContent>
          {JOB_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <X className="h-3 w-3" /> Clear
      </button>
    </div>
  );
}