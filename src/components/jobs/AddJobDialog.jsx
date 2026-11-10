import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import JobFormDialog from '@/components/JobFormDialog';

export default function AddJobDialog({ open, onOpenChange, onSaved }) {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');
  const [manualOpen, setManualOpen] = useState(false);

  const reset = () => {
    setText('');
    setError('');
    setHint('');
  };

  const changeOpen = (next) => {
    if (busy && !next) return;
    onOpenChange(next);
    if (!next) reset();
  };

  const analyze = async () => {
    const value = text.trim();
    if (value.length < 8 || busy) return;
    setBusy(true);
    setError('');
    setHint('');
    try {
      const { data } = await base44.functions.invoke('addJobFromPaste', { text: value });
      if (data?.needsText) {
        setHint(
          data.reason === 'not_a_posting'
            ? "That doesn't look like a job posting. Paste the full job description."
            : "I couldn't read that link. Paste the full job description instead and I'll take it from there."
        );
        return;
      }
      if (data?.job?.id) {
        onOpenChange(false);
        reset();
        onSaved?.();
        navigate(`/jobs/${data.job.id}`);
        return;
      }
      setError(data?.error || 'Could not read this role. Try pasting the description.');
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Could not analyze this role.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-[20px]">Add a role</DialogTitle>
            <DialogDescription className="text-[12.5px]">
              Career Coach reads it with your profile and fills in every field — score, skills, gaps and resume bullets.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) analyze();
              }}
              rows={9}
              autoFocus
              disabled={busy}
              placeholder="Paste a job link or the full job description"
              className="min-h-[190px] resize-y text-[13px] leading-relaxed"
            />

            {hint && (
              <div className="rounded-lg border border-border bg-secondary/60 px-3 py-2.5">
                <p className="text-[12.5px] leading-relaxed text-foreground">{hint}</p>
              </div>
            )}

            {error && <p className="text-[12.5px] text-destructive">{error}</p>}

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={analyze} disabled={busy || text.trim().length < 8} className="gap-1.5">
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {busy ? 'Reading & scoring…' : 'Analyze & add to pipeline'}
              </Button>
              <button
                type="button"
                onClick={() => setManualOpen(true)}
                disabled={busy}
                className="text-[12px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
              >
                Enter details manually
              </button>
            </div>

            {busy && (
              <p className="text-[11.5px] text-muted-foreground">
                Reading the posting, weighing it against your profile, and writing the tailored bullets.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <JobFormDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        job={null}
        defaultStatus="Saved"
        onSaved={() => {
          setManualOpen(false);
          onOpenChange(false);
          reset();
          onSaved?.();
        }}
      />
    </>
  );
}