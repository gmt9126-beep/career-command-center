import { ArrowUpRight, Pencil } from 'lucide-react';
import ProjectPreview from '@/components/projects/ProjectPreview';

export default function ProjectCard({ project, onEdit }) {
  return (
    <article className="card-lift overflow-hidden rounded-2xl border border-border/80 bg-card p-3 sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="h-[190px] shrink-0 sm:h-auto sm:w-[38%] sm:min-h-[210px]">
          <ProjectPreview project={project} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-1 sm:p-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[19px] leading-snug tracking-[-0.02em] sm:text-[22px]">{project.name}</h2>
            <button
              onClick={() => onEdit(project)}
              aria-label={`Edit ${project.name}`}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>

          {project.description && (
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{project.description}</p>
          )}

          {project.role && (
            <p className="mt-3 text-[12px] text-foreground/75">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Role</span>
              <span className="ml-2">{project.role}</span>
            </p>
          )}

          {project.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-[11.5px] text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto pt-4">
            {project.link ? (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-[12.5px] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Open <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : (
              <button
                onClick={() => onEdit(project)}
                className="rounded-full border border-border px-3.5 py-1.5 text-[12.5px] transition-colors hover:bg-secondary"
              >
                Add a link
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}