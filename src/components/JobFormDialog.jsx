import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JOB_STATUSES } from '@/lib/constants';

const EMPTY = { company: '', role: '', location: '', link: '', job_description: '', status: 'Saved' };

export default function JobFormDialog({ open, onOpenChange, job, defaultStatus, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(job ? { ...EMPTY, ...job } : { ...EMPTY, status: defaultStatus || 'Saved' });
  }, [open, job, defaultStatus]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

  const save = async () => {
    if (!form.company.trim() || !form.role.trim()) {
      setError('Company and role are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        company: form.company.trim(),
        role: form.role.trim(),
        location: form.location?.trim() || '',
        link: form.link?.trim() || '',
        job_description: form.job_description || '',
        status: form.status,
      };
      if (job?.id) {
        await base44.entities.Job.update(job.id, payload);
      } else {
        await base44.entities.Job.create({
          ...payload,
          date_added: new Date().toISOString().slice(0, 10),
          fit_score: 0,
        });
      }
      onOpenChange(false);
      onSaved?.();
    } catch (e) {
      setError(e?.message || 'Could not save this role.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-[20px]">{job?.id ? 'Edit role' : 'Add a role'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Company</Label>
              <Input value={form.company} onChange={set('company')} placeholder="Notion" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Role</Label>
              <Input value={form.role} onChange={set('role')} placeholder="Senior Content Designer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Location</Label>
              <Input value={form.location} onChange={set('location')} placeholder="Remote (US)" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Status</Label>
              <Select value={form.status} onValueChange={set('status')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Job link</Label>
            <Input value={form.link} onChange={set('link')} placeholder="https://" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Job description</Label>
            <Textarea
              value={form.job_description}
              onChange={set('job_description')}
              rows={5}
              placeholder="Paste the posting — or ask Career Coach to score it for you."
            />
          </div>

          {error && <p className="text-[12.5px] text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : job?.id ? 'Save changes' : 'Add to board'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}