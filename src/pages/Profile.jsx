import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import TagInput from '@/components/TagInput';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { unwrap } from '@/lib/constants';

const EMPTY = {
  name: '', target_roles: [], resume_text: '', skills: [], preferred_locations: [],
  preferred_industries: [], work_style: '', other_notes: '',
};

const WORK_STYLES = ['Remote', 'Hybrid', 'On-site', 'Flexible'];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const existing = unwrap(await base44.entities.Profile.list({ sort: '-created_date', limit: 1 }))[0];
        setProfile(existing || null);
        setForm(existing ? { ...EMPTY, ...existing } : EMPTY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

  const save = async () => {
    if (!form.name.trim()) {
      setError('Add your name so Career Coach knows whose resume it is.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, name: form.name.trim() };
      delete payload.id;
      delete payload.created_by_id;
      delete payload.created_date;
      delete payload.updated_date;
      if (profile?.id) await base44.entities.Profile.update(profile.id, payload);
      else {
        const created = await base44.entities.Profile.create(payload);
        setProfile(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (e) {
      setError(e?.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-secondary/60" />;
  }

  return (
    <div className="fade-rise space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Source of truth
          </p>
          <h1 className="text-[26px] leading-tight sm:text-[32px]">Profile</h1>
          <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-muted-foreground">
            Career Coach reads this before scoring any role. The more real detail in your resume, the sharper the bullets.
          </p>
        </div>
        <Link to="/coach" className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[13px] hover:bg-secondary">
          <Sparkles className="h-3.5 w-3.5 text-accent-foreground" /> Ask Coach
        </Link>
      </header>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 lg:col-span-2">
          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Name</Label>
            <Input value={form.name} onChange={set('name')} placeholder="Your name" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Target roles</Label>
            <TagInput value={form.target_roles} onChange={set('target_roles')} placeholder="Content Designer, UX Designer…" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Skills</Label>
            <TagInput value={form.skills} onChange={set('skills')} placeholder="UX writing, systems design…" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Preferred locations</Label>
            <TagInput value={form.preferred_locations} onChange={set('preferred_locations')} placeholder="New York, Remote (US)…" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Preferred industries</Label>
            <TagInput value={form.preferred_industries} onChange={set('preferred_industries')} placeholder="Fintech, Health, Developer tools…" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Work style</Label>
            <Select value={form.work_style || ''} onValueChange={set('work_style')}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {WORK_STYLES.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 lg:col-span-3">
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <Label className="text-[12px] text-muted-foreground">Resume text</Label>
              <span className="font-mono text-[10.5px] text-muted-foreground">
                {form.resume_text?.length || 0} chars
              </span>
            </div>
            <Textarea
              value={form.resume_text}
              onChange={set('resume_text')}
              rows={16}
              placeholder="Paste your full resume here — roles, dates, what you shipped, the outcomes you can actually back up."
              className="text-[12.5px] leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Other notes</Label>
            <Textarea
              value={form.other_notes}
              onChange={set('other_notes')}
              rows={4}
              placeholder="Deal-breakers, comp range, timing, visa needs, anything Coach should weigh."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save profile'}
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-[12.5px] text-accent-foreground">
                <Check className="h-3.5 w-3.5" /> Saved
              </span>
            )}
            {error && <span className="text-[12.5px] text-destructive">{error}</span>}
          </div>
        </section>
      </div>
    </div>
  );
}