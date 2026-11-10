import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EMPTY_FILTERS } from '@/lib/boardFilters';

const FIELDS = [
  { key: 'company', label: 'Company', placeholder: 'Notion, Google…' },
  { key: 'status', label: 'Status', placeholder: 'applied, offer…' },
  { key: 'date', label: 'Date added', placeholder: '2026-11 or Nov 4' },
  { key: 'fit', label: 'Fit score', placeholder: '80, >60, 60-80' },
];

export default function BoardFilters({ filters, onChange, shown, total }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });
  const activeCount = Object.values(filters).filter((value) => String(value || '').trim()).length;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1 sm:max-w-[280px]">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.keywords}
          onChange={(e) => set('keywords', e.target.value)}
          placeholder="Search roles, companies, notes"
          aria-label="Search jobs"
          className="h-8 pl-8 text-[12.5px]"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12.5px] transition-colors hover:bg-secondary"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            {activeCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 font-mono text-[10px] text-primary-foreground">
                {activeCount}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[260px] space-y-3 p-3.5">
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-[11.5px] text-muted-foreground">{field.label}</Label>
              <Input
                value={filters[field.key]}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="h-8 text-[12.5px]"
              />
            </div>
          ))}
        </PopoverContent>
      </Popover>

      <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
        {shown} of {total}
      </span>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3 w-3" /> Clear
        </button>
      )}
    </div>
  );
}