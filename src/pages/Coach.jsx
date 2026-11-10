import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, SendHorizonal, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MessageBubble from '@/components/coach/MessageBubble';
import QuickNotes from '@/components/coach/QuickNotes';
import { cn } from '@/lib/utils';

const AGENT = 'CareerCoach';
const STARTERS = [
  'Here is a job I want scored: ',
  'What should I focus on this week?',
  'Draft outreach for my strongest open role.',
  'Which of my roles has the best realistic shot?',
  'Interview me for my strongest open role.',
];

export default function Coach() {
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);
  const convRef = useRef(null);

  const loadConversations = useCallback(async () => {
    const list = await base44.agents.listConversations({ agent_name: AGENT });
    const arr = Array.isArray(list) ? list : list?.items ?? list?.conversations ?? [];
    setConversations(arr);
    return arr;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await loadConversations();
      } catch (e) {
        setError(e?.message || 'Could not load your conversations.');
      } finally {
        setLoading(false);
      }
    })();
  }, [loadConversations]);

  useEffect(() => {
    const id = conversation?.id;
    if (!id) return;
    convRef.current = conversation;
    const unsubscribe = base44.agents.subscribeToConversation(id, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  useEffect(() => {
    if (messages[messages.length - 1]?.role === 'assistant') setBusy(false);
  }, [messages]);

  const openConversation = async (id) => {
    setError('');
    const record = await base44.agents.getConversation(id);
    setConversation(record);
    setMessages(record?.messages || []);
  };

  const startNew = async () => {
    setError('');
    const created = await base44.agents.createConversation({
      agent_name: AGENT,
      metadata: { name: `Chat · ${new Date().toLocaleDateString()}` },
    });
    setConversation(created);
    setMessages(created?.messages || []);
    setConversations((prev) => [created, ...prev.filter((c) => c.id !== created?.id)]);
    loadConversations();
  };

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput('');
    setError('');
    setBusy(true);
    try {
      let active = conversation;
      if (!active?.id) {
        active = await base44.agents.createConversation({
          agent_name: AGENT,
          metadata: { name: content.slice(0, 48) },
        });
        setConversation(active);
        setConversations((prev) => [active, ...prev.filter((c) => c.id !== active?.id)]);
      }
      setMessages((prev) => [...prev, { role: 'user', content }]);
      await base44.agents.addMessage(active, { role: 'user', content });
      loadConversations();
    } catch (e) {
      setError(e?.message || 'Career Coach could not respond. Try again.');
      setBusy(false);
    }
  };

  const interviewOpened = useRef(false);

  useEffect(() => {
    const jobId = new URLSearchParams(window.location.search).get('interview');
    if (!jobId || interviewOpened.current) return;
    interviewOpened.current = true;
    window.history.replaceState({}, '', window.location.pathname);
    (async () => {
      const job = await base44.entities.Job.get(jobId).catch(() => null);
      send(job ? `Interview me for the ${job.role} role at ${job.company}.` : 'Interview me.');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showStarters = !messages.length;

  return (
    <div className="fade-rise -mt-2 flex h-[calc(100vh-9.5rem)] gap-4 sm:h-[calc(100vh-10rem)]">
      <aside className="hidden w-[208px] shrink-0 flex-col sm:flex">
        <button
          onClick={startNew}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-[12.5px] transition-colors hover:bg-secondary"
        >
          <Plus className="h-3.5 w-3.5" /> New chat
        </button>
        <div className="mt-3 flex-1 space-y-1 overflow-y-auto pr-1">
          {loading && <div className="h-8 animate-pulse rounded-lg bg-secondary/60" />}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={cn(
                'flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] leading-snug transition-colors',
                conversation?.id === c.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60',
              )}
            >
              <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" />
              <span className="line-clamp-2">{c.metadata?.name || 'Conversation'}</span>
            </button>
          ))}
          {!loading && !conversations.length && (
            <p className="px-1 pt-2 text-[11.5px] leading-relaxed text-muted-foreground">
              Your past chats will collect here.
            </p>
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col rounded-2xl border border-border/80 bg-background/60">
        <header className="flex items-center gap-2.5 border-b border-border/70 px-4 py-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div>
            <h1 className="font-heading text-[15px] leading-tight">Career Coach</h1>
            <p className="text-[11px] text-muted-foreground">Knows your profile · reads and updates your board</p>
          </div>
          <button
            onClick={startNew}
            className="ml-auto rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground sm:hidden"
            aria-label="New chat"
          >
            <Plus className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-5">
          {showStarters && (
            <div className="mx-auto max-w-md pt-6 text-center sm:pt-12">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">Career Coach</p>
              <h2 className="mt-2.5 text-[21px] leading-snug sm:text-[24px]">
                Paste a job link. Get a score you can trust.
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-muted-foreground">
                Fit score, skill breakdown, honest gaps, and three resume bullets built only from your real experience.
              </p>
              <div className="mt-5 flex flex-col gap-1.5">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => (s.endsWith(': ') ? setInput(s) : send(s))}
                    className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-left text-[12.5px] text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))}

          {busy && (
            <div className="flex items-center gap-2 pl-1 text-[11.5px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Coach is thinking…
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
              {error}
            </p>
          )}

          <div ref={endRef} />
        </div>

        <QuickNotes />

        <div className="p-2.5 pt-2 sm:p-3 sm:pt-2">
          <div className="flex items-end gap-2 rounded-xl border border-input bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-ring/20">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Paste a job link, or ask what to do next…"
              className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground/70"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || busy}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
              aria-label="Send message"
            >
              <SendHorizonal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}