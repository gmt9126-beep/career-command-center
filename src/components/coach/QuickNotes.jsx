import { useEffect, useState } from 'react';
import { ChevronDown, Loader2, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function QuickNotes() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const page = await base44.entities.CoachNote.list({ sort: '-created_date', limit: 200 });
      setNotes(Array.isArray(page) ? page : page?.items ?? []);
    })();
  }, []);

  const add = async () => {
    const value = text.trim();
    if (!value || saving) return;
    setSaving(true);
    try {
      const created = await base44.entities.CoachNote.create({ text: value });
      setNotes((prev) => [created, ...prev]);
      setText('');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await base44.entities.CoachNote.delete(id);
  };

  return (
    <div className="border-t border-border/70 px-2.5 pt-2 sm:px-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 rounded-lg px-1 py-1 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
        aria-expanded={open}
      >
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open ? '' : '-rotate-90')} />
        <span className="font-medium">Quick notes</span>
        {notes.length > 0 && (
          <span className="rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[10px]">{notes.length}</span>
        )}
        <span className="ml-auto text-[10.5px]">Jot bullets after a mock interview</span>
      </button>

      {open && (
        <div className="mt-1 rounded-xl border border-border/80 bg-card p-2">
          <div className="flex items-center gap-1.5">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  add();
                }
              }}
              placeholder="One bullet, press Enter to save…"
              aria-label="New quick note"
              className="min-w-0 flex-1 bg-transparent px-1 py-1 text-[12.5px] outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="button"
              onClick={add}
              disabled={!text.trim() || saving}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
              aria-label="Save note"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            </button>
          </div>

          {notes.length > 0 && (
            <ul className="mt-1.5 max-h-36 space-y-0.5 overflow-y-auto border-t border-border/60 pt-1.5">
              {notes.map((note) => (
                <li key={note.id} className="group flex items-start gap-1.5 rounded-md px-1 py-1 hover:bg-secondary/60">
                  <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  <span className="min-w-0 flex-1 text-[12.5px] leading-relaxed">{note.text}</span>
                  <button
                    type="button"
                    onClick={() => remove(note.id)}
                    aria-label={`Delete note: ${note.text}`}
                    className="shrink-0 rounded p-0.5 text-muted-foreground/60 opacity-0 transition-opacity hover:text-destructive focus:opacity-100 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}