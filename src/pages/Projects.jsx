import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectFormDialog from '@/components/projects/ProjectFormDialog';
import { unwrap } from '@/lib/constants';

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [dialog, setDialog] = useState({ open: false, project: null });

  const load = useCallback(async () => {
    const page = await base44.entities.Project.list({ sort: '-updated_date', limit: 50 });
    setProjects(unwrap(page));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="fade-rise space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Projects</p>
          <h1 className="text-[26px] leading-tight sm:text-[32px]">Work, kept close</h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
            Your portfolio in one place — the coach reads these when it writes resume bullets and outreach.
          </p>
        </div>
        <button
          onClick={() => setDialog({ open: true, project: null })}
          className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-[13px] text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> Add project
        </button>
      </header>

      {projects === null ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-[240px] animate-pulse rounded-2xl bg-secondary/60" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-card p-8 text-center sm:p-14">
          <h2 className="text-[20px] tracking-[-0.02em]">No projects yet</h2>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
            Add the work you want to be known for — a name, its link, two sentences, your role and three tags. The
            coach uses them the next time it writes bullets or a message.
          </p>
          <button
            onClick={() => setDialog({ open: true, project: null })}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Add your first project
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(p) => setDialog({ open: true, project: p })}
            />
          ))}
        </div>
      )}

      <ProjectFormDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        project={dialog.project}
        onSaved={load}
      />
    </div>
  );
}