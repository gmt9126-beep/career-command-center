import { useState } from 'react';
import { Check, Copy, Loader2, PenLine } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDate } from '@/lib/constants';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function OutreachDraftDialog({ open, onOpenChange, job, onDrafted }) {
  const { toast } = useToast();
  const [background, setBackground] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const close = (next) => {
    onOpenChange(next);
    if (!next) {
      setBackground('');
      setError('');
      setResult(null);
      setCopied(false);
    }
  };

  const draft = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('draftOutreach', { job_id: job.id, background });
      setResult(res.data);
      onDrafted?.();
    } catch (e) {
      setError(e?.response?.data?.error || 'The coach could not write that draft. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(result.outreach.message_draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast({ title: 'Copy blocked', description: 'Select the message and copy it manually.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="tracking-[-0.02em]">Draft outreach</DialogTitle>
          <DialogDescription>
            {job.role} at {job.company}. The coach reads this plus your profile and finds what you genuinely share.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-secondary/60 px-3.5 py-3">
              <p className="text-[13px] font-medium">
                {result.outreach.contact_name}
                {result.outreach.contact_title ? `, ${result.outreach.contact_title}` : ''}
              </p>
              <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                Draft · follow up {formatDate(result.outreach.follow_up_date)}
              </p>
            </div>

            {result.common_points?.length > 0 && (
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Common ground</p>
                <ul className="mt-1.5 space-y-1.5">
                  {result.common_points.map((point, i) => (
                    <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-foreground" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Message</p>
                <button onClick={copyMessage} className="flex items-center gap-1 text-[11.5px] text-muted-foreground hover:text-foreground">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copy
                </button>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-border bg-card px-3.5 py-3 text-[12.5px] leading-relaxed">
                {result.outreach.message_draft}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={() => setResult(null)}
                className="text-[12.5px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Draft another
              </button>
              <button
                onClick={() => close(false)}
                className="rounded-full bg-primary px-3.5 py-1.5 text-[12.5px] text-primary-foreground hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="outreach-background" className="text-[12.5px]">
                Paste their LinkedIn profile or any background info.
              </Label>
              <Textarea
                id="outreach-background"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                rows={9}
                placeholder="Name, title, past companies, school, posts they wrote — anything you have."
                className="mt-1.5 resize-y text-[12.5px] leading-relaxed"
              />
            </div>

            {error && <p className="text-[12.5px] text-destructive">{error}</p>}

            <div className="flex items-center justify-between gap-3">
              <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                Writes a message from what you genuinely share. Copy and send it yourself.
              </p>
              <button
                onClick={draft}
                disabled={loading || background.trim().length < 20}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-[12.5px] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-45"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <PenLine className="h-3 w-3" />}
                {loading ? 'Reading' : 'Write draft'}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}