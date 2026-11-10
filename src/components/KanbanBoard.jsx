import { useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import JobCard from '@/components/JobCard';
import BoardFilters from '@/components/BoardFilters';
import { EMPTY_FILTERS, filterJobs, hasFilters } from '@/lib/boardFilters';
import { JOB_STATUSES, STATUS_META } from '@/lib/constants';

export default function KanbanBoard({ jobs, onMove, onAdd, selected = [], onToggleSelect }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const visible = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);
  const filtering = hasFilters(filters);

  const grouped = useMemo(() => {
    const map = Object.fromEntries(JOB_STATUSES.map((s) => [s, []]));
    visible.forEach((job) => {
      const key = JOB_STATUSES.includes(job.status) ? job.status : 'Recommended';
      map[key].push(job);
    });
    return map;
  }, [visible]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const status = result.destination.droppableId;
    const job = jobs.find((j) => j.id === result.draggableId);
    if (!job || job.status === status) return;
    onMove(job, status);
  };

  return (
    <>
      <BoardFilters filters={filters} onChange={setFilters} shown={visible.length} total={jobs.length} />

      {filtering && visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-4 py-12 text-center">
          <p className="text-[14px] font-medium">No roles match these filters</p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Try a different word, or clear them to see the whole board.
          </p>
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="mt-3 rounded-full border border-border px-3.5 py-1.5 text-[12.5px] transition-colors hover:bg-secondary"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 no-scrollbar sm:mx-0 sm:px-0">
            {JOB_STATUSES.map((status) => {
              const meta = STATUS_META[status];
              return (
                <section key={status} className="w-[258px] shrink-0 sm:w-[286px]">
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.hex }} />
                    <h2 className="font-body text-[11.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      {status}
                    </h2>
                    <span className="rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {grouped[status].length}
                    </span>
                    <button
                      onClick={() => onAdd(status)}
                      className="ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label={`Add job to ${status}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="min-h-[120px] space-y-2 rounded-xl p-1 transition-colors"
                        style={{ background: snapshot.isDraggingOver ? meta.soft : 'transparent' }}
                      >
                        {grouped[status].map((job, index) => (
                          <Draggable key={job.id} draggableId={job.id} index={index}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                              >
                                <JobCard
                                  job={job}
                                  dragging={dragSnapshot.isDragging}
                                  selected={selected.includes(job.id)}
                                  onSelect={() => onToggleSelect?.(job.id)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {grouped[status].length === 0 && !snapshot.isDraggingOver && (
                          <div className="rounded-xl border border-dashed border-border/90 px-3 py-6 text-center text-[11.5px] text-muted-foreground">
                            Drop a role here
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </section>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </>
  );
}