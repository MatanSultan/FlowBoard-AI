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
  todo: 'bg-muted/30',
  in_progress: 'bg-blue-50/50 dark:bg-blue-950/20',
  done: 'bg-green-50/50 dark:bg-green-950/20',
}

const BADGE_STYLES: Record<Status, string> = {
  todo: 'bg-muted text-muted-foreground border-0',
  in_progress:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-0',
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

      // Snapshot for rollback
      const snapshot = {
        todo: [...columns.todo],
        in_progress: [...columns.in_progress],
        done: [...columns.done],
      }

      // Optimistic update
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

      // Persist, roll back on failure
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
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-0 items-start">
        {COLUMNS.map((status) => {
          const tasks = columns[status]
          return (
            <div
              key={status}
              className={`flex flex-col rounded-xl border border-border/60 min-w-[280px] w-[280px] shrink-0 ${COLUMN_STYLES[status]}`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${COLUMN_INDICATOR[status]}`}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {STATUS_LABELS[status]}
                  </span>
                  <Badge className={`text-xs px-1.5 py-0 h-5 font-medium ${BADGE_STYLES[status]}`}>
                    {tasks.length}
                  </Badge>
                </div>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 flex flex-col gap-2 p-2 min-h-[80px] transition-colors rounded-b-xl ${
                      snapshot.isDraggingOver
                        ? 'bg-primary/5 ring-1 ring-inset ring-primary/20'
                        : ''
                    }`}
                  >
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

              {/* Add task */}
              <div className="px-2 pb-2">
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
          )
        })}
      </div>
    </DragDropContext>
  )
}
