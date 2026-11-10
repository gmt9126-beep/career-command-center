import { useEffect, useState } from 'react';
import { Compass, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import RoleSuggestionCard from '@/components/discover/RoleSuggestionCard';
import { unwrap } from '@/lib/constants';
import { useToast } from '@/components/ui/use-toast';

const FOCUS_OPTIONS = ['Any focus', 'Content & UX', 'Marketing & Brand', 'Program & Ops', 'Research & Policy', 'Customer & Solutions'];

const keyOf = (company, role) => `${String(company || '').trim().toLowerCase()}|${String(role || '').trim().toLowerCase()}`;

export default function Discover() {
  const { toast } = useToast();
  const [roles, setRoles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focus, setFocus] = useState('Any focus');
  const [boardKeys, setBoardKeys] = useState([]);
  const [addingKey, setAddingKey] = useState(null);

  useEffect(() => {
    base44.entities.Job.list({ limit: 200 }).then((page) => {
      setBoardKeys(unwrap(page).map((j) => keyOf(j.company, j.role)));
    });
  }, []);

  const findRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('recommendRoles', {
        focus: focus === 'Any focus' ? '' : focus,
      });
      setRoles(res.data?.roles || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Role discovery could not run just now. Try again in a moment.');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const addRole = async (s) => {
    const key = keyOf(s.company, s.title);
    setAddingKey(key);
    try {
      await base44.entities.Job.create({
        company: s.company,
        role: s.title,
        location: s.location === 'Not listed' ? '' : s.location,
        link: s.link,
        salary: s.salary === 'Not listed' ? '' : s.salary,
        employment_type: s.employment_type,
        source: /linkedin/i.test(`${s.source} ${s.link}`) ? 'LinkedIn' : 'Company',
        status: 'Recommended',
        job_description: [s.why_fit, s.non_technical_note].filter(Boolean).join('\n\n'),
        notes: `Found via ${s.source}${s.focus_area ? ` · ${s.focus_area}` : ''} in role discovery.`,
      });
      setBoardKeys((prev) => [...prev, key]);
      toast({ title: 'Added to your board', description: `${s.title} at ${s.company} is in Recommended.` });
    } catch (e) {
      toast({ title: 'Could not add this role', description: e?.message || 'Try again.', variant: 'destructive' });
    } finally {
      setAddingKey(null);
    }
  };

  return (
    <div className="fade-rise space-y-6">
      <header className="space-y-3">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">Discover</p>
        <h1 className="max-w-2xl text-[26px] leading-tight tracking-[-0.03em] sm:text-[34px]">
          AI roles, without the engineering bar
        </h1>
        <p className="max-w-xl text-[13.5px] leading-relaxed text-muted-foreground">
          Live search across job boards finds open roles at AI companies that don't need a technical background —
          then you drop the good ones straight onto your board.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FOCUS_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setFocus(option)}
              className={
                focus === option
                  ? 'rounded-full bg-primary px-3 py-1.5 text-[12px] text-primary-foreground'
                  : 'rounded-full border border-border bg-card px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground'
              }
            >
              {option}
            </button>
          ))}
        </div>
        <button
          onClick={findRoles}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Compass className="h-3.5 w-3.5" />}
          {loading ? 'Searching boards' : roles ? 'Find more roles' : 'Find roles'}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-secondary/60" />
          ))}
        </div>
      ) : roles === null ? (
        <div className="rounded-2xl border border-border/80 bg-card p-8 text-center sm:p-12">
          <h2 className="text-[19px] tracking-[-0.02em]">Nothing searched yet</h2>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
            Pick a focus and hit find roles. Suggestions come from live job-board search, so open each posting to
            confirm it before you apply.
          </p>
        </div>
      ) : roles.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-card p-8 text-center sm:p-12">
          <h2 className="text-[19px] tracking-[-0.02em]">No roles came back</h2>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
            Try a different focus or run the search again — board results shift through the day.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {roles.map((s) => {
            const key = keyOf(s.company, s.title);
            return (
              <RoleSuggestionCard
                key={key}
                suggestion={s}
                added={boardKeys.includes(key)}
                adding={addingKey === key}
                onAdd={addRole}
              />
            );
          })}
        </div>
      )}

      <p className="text-[11.5px] leading-relaxed text-muted-foreground">
        Suggestions are pulled from public job boards and employer pages at the moment you search — always verify the
        posting before applying.
      </p>
    </div>
  );
}