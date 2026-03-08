'use client'

import { useState, useCallback, useTransition } from 'react'
import type { Task, Status } from '@/lib/types'
import { STATUS_LABELS } from '@/lib/types'
import { updateTaskStatus } from '@/lib/actions/tasks'
import { TaskCard } from '@/components/task-card'
import { AddTaskDialog } from '@/components/add-task-dialog'
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const COLUMNS: Status[] = ['todo', 'in_progress', 'done']

const COLUMN_STYLES: Record<Status, string> = {
  todo: 'border-slate-200/80 bg-gradient-to-b from-slate-50 via-background to-background dark:border-slate-800/80 dark:from-slate-950/40 dark:via-background dark:to-background',
  in_progress:
    'border-sky-200/80 bg-gradient-to-b from-sky-50 via-background to-background dark:border-sky-900/70 dark:from-sky-950/35 dark:via-background dark:to-background',
  done: 'border-emerald-200/80 bg-gradient-to-b from-emerald-50 via-background to-background dark:border-emerald-900/70 dark:from-emerald-950/35 dark:via-background dark:to-background',
}

const BADGE_STYLES: Record<Status, string> = {
  todo: 'border-0 bg-muted text-muted-foreground',
  in_progress:
    'border-0 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  done: 'border-0 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

const COLUMN_INDICATOR: Record<Status, string> = {
  todo: 'bg-muted-foreground/40',
  in_progress: 'bg-blue-500',
  done: 'bg-green-500',
}

interface KanbanBoardProps {
  projectId: string
  initialTasks: Task[]
}

type Columns = Record<Status, Task[]>

function groupByStatus(tasks: Task[]): Columns {
  const cols: Columns = { todo: [], in_progress: [], done: [] }
  for (const task of tasks) {
    if (cols[task.status]) {
      cols[task.status].push(task)
    }
  }
  return cols
}

export function KanbanBoard({ projectId, initialTasks }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Columns>(() => groupByStatus(initialTasks))
  const [, startTransition] = useTransition()

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result
      if (!destination) return
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return

      const srcStatus = source.droppableId as Status
      const dstStatus = destination.droppableId as Status

      const snapshot = {
        todo: [...columns.todo],
        in_progress: [...columns.in_progress],
        done: [...columns.done],
      }

      setColumns((prev) => {
        const next: Columns = {
          todo: [...prev.todo],
          in_progress: [...prev.in_progress],
          done: [...prev.done],
        }
        const [moved] = next[srcStatus].splice(source.index, 1)
        next[dstStatus].splice(destination.index, 0, { ...moved, status: dstStatus })
        return next
      })

      startTransition(async () => {
        try {
          await updateTaskStatus(draggableId, projectId, dstStatus, destination.index)
        } catch {
          setColumns(snapshot)
          toast.error('Failed to move task. Please try again.')
        }
      })
    },
    [projectId, columns],
  )

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex min-h-0 flex-col items-stretch gap-4 pb-6 lg:flex-row lg:items-start lg:gap-5 lg:overflow-x-auto">
        {COLUMNS.map((status) => {
          const tasks = columns[status]
          return (
            <div
              key={status}
              className={`flex w-full min-w-0 flex-col rounded-[28px] border shadow-[0_18px_45px_-32px_rgba(15,23,42,0.45)] lg:w-[300px] lg:min-w-[300px] lg:shrink-0 ${COLUMN_STYLES[status]}`}
            >
              <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ${COLUMN_INDICATOR[status]}`}
                  />
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <Badge
                  className={`h-6 shrink-0 rounded-full px-2.5 text-xs font-semibold shadow-sm ${BADGE_STYLES[status]}`}
                >
                  {tasks.length} items
                </Badge>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex min-h-[160px] flex-1 flex-col gap-3 rounded-b-[28px] p-3 transition-all sm:min-h-[220px] ${
                      snapshot.isDraggingOver
                        ? 'bg-primary/[0.045] ring-1 ring-inset ring-primary/25'
                        : ''
                    }`}
                  >
                    <div className="pointer-events-none rounded-2xl border border-dashed border-border/60 bg-background/60 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/75">
                      Drag tasks here
                    </div>
                    {tasks.map((task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onDeleted={(id) =>
                          setColumns((prev) => ({
                            ...prev,
                            [status]: prev[status].filter((t) => t.id !== id),
                          }))
                        }
                        onUpdated={(updated) =>
                          setColumns((prev) => ({
                            ...prev,
                            [status]: prev[status].map((t) =>
                              t.id === updated.id ? updated : t,
                            ),
                          }))
                        }
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <div className="px-3 pb-3">
                <div className="rounded-2xl border border-border/60 bg-background/80 p-1.5 shadow-sm">
                  <AddTaskDialog
                    projectId={projectId}
                    defaultStatus={status}
                    onCreated={(task) =>
                      setColumns((prev) => ({
                        ...prev,
                        [status]: [...prev[status], task],
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
