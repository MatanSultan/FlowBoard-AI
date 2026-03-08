'use client'

import { useState } from 'react'
import type { Task } from '@/lib/types'
import { deleteTask, updateTask } from '@/lib/actions/tasks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MoreHorizontal,
  Trash2,
  Pencil,
  Calendar,
  Flag,
  Sparkles,
  Loader2,
  Clock,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Draggable } from '@hello-pangea/dnd'
import { toast } from 'sonner'

const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    class: 'border-0 bg-muted text-muted-foreground',
  },
  medium: {
    label: 'Medium',
    class:
      'border-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  high: {
    label: 'High',
    class: 'border-0 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
}

interface TaskCardProps {
  task: Task
  index: number
  onDeleted?: (id: string) => void
  onUpdated?: (task: Task) => void
}

export function TaskCard({ task, index, onDeleted, onUpdated }: TaskCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [improving, setImproving] = useState(false)

  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    due_date: task.due_date ?? '',
    tagsInput: (task.tags as string[]).join(', '),
  })

  async function handleSave() {
    if (!editData.title.trim()) return
    setSaving(true)
    try {
      const tags = editData.tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const updated = await updateTask(task.id, task.project_id, {
        title: editData.title,
        description: editData.description || null,
        priority: editData.priority,
        due_date: editData.due_date || null,
        tags,
      })
      onUpdated?.(updated)
      setSheetOpen(false)
      toast.success('Task updated')
    } catch {
      toast.error('Failed to update task.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteTask(task.id, task.project_id)
      onDeleted?.(task.id)
      setDeleteOpen(false)
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task.')
    } finally {
      setDeleting(false)
    }
  }

  async function handleImprove() {
    setImproving(true)
    try {
      const res = await fetch('/api/improve-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editData.title,
          description: editData.description || null,
        }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        toast.error(error ?? 'Failed to improve task.')
        return
      }
      const improved = await res.json()
      setEditData({
        title: improved.title ?? editData.title,
        description: improved.description ?? editData.description,
        priority: improved.priority ?? editData.priority,
        due_date: editData.due_date,
        tagsInput: (improved.tags as string[])?.join(', ') ?? editData.tagsInput,
      })
      toast.success('Task improved by AI')
    } catch {
      toast.error('Failed to improve task.')
    } finally {
      setImproving(false)
    }
  }

  const priority = PRIORITY_CONFIG[task.priority]
  const currentTags = task.tags as string[]

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`group cursor-grab select-none space-y-3 rounded-[22px] border bg-gradient-to-br from-card via-card to-background p-3.5 shadow-[0_14px_32px_-26px_rgba(15,23,42,0.45)] transition-all active:cursor-grabbing ${
              snapshot.isDragging
                ? 'rotate-1 border-primary/40 shadow-xl ring-1 ring-primary/20'
                : 'border-border/70 hover:-translate-y-0.5 hover:border-border hover:shadow-[0_20px_44px_-30px_rgba(15,23,42,0.5)]'
            }`}
            onClick={() => setSheetOpen(true)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary/70 shadow-sm" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                    Task card
                  </span>
                </div>
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                  {task.title}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Task options"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      setSheetOpen(true)
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteOpen(true)
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {task.description && (
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {task.description}
              </p>
            )}

            <div className="flex items-center flex-wrap gap-1.5">
              <Badge className={`h-6 rounded-full px-2 py-0 text-xs font-medium ${priority.class}`}>
                <Flag className="w-2.5 h-2.5 mr-1" />
                {priority.label}
              </Badge>
              {task.due_date && (
                <Badge
                  variant="outline"
                  className="h-6 rounded-full border-border/70 bg-background/80 px-2 py-0 text-xs font-normal"
                >
                  <Calendar className="w-2.5 h-2.5" />
                  {format(parseISO(task.due_date), 'MMM d')}
                </Badge>
              )}
              {currentTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="h-6 rounded-full bg-secondary/80 px-2 py-0 text-xs font-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Draggable>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left">Task details</SheetTitle>
          </SheetHeader>
          <Tabs defaultValue="details">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="details" className="flex-1">
                Details
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sheet-title">Title</Label>
                <Input
                  id="sheet-title"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sheet-desc">Description</Label>
                <Textarea
                  id="sheet-desc"
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={editData.priority}
                    onValueChange={(v) =>
                      setEditData({ ...editData, priority: v as Task['priority'] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due date</Label>
                  <Input
                    type="date"
                    value={editData.due_date}
                    onChange={(e) =>
                      setEditData({ ...editData, due_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sheet-tags">
                  Tags{' '}
                  <span className="font-normal text-muted-foreground">
                    (comma-separated)
                  </span>
                </Label>
                <Input
                  id="sheet-tags"
                  value={editData.tagsInput}
                  onChange={(e) =>
                    setEditData({ ...editData, tagsInput: e.target.value })
                  }
                  placeholder="design, backend, bug"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={handleImprove}
                disabled={improving || !editData.title.trim()}
              >
                {improving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                )}
                {improving ? 'Improving with AI...' : 'Improve with AI'}
              </Button>

              <div className="flex justify-between gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={() => {
                    setSheetOpen(false)
                    setDeleteOpen(true)
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSheetOpen(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving || !editData.title.trim()}
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    ) : null}
                    Save changes
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium text-foreground">
                      {format(parseISO(task.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                {task.updated_at !== task.created_at && (
                  <div className="flex items-start gap-3 text-sm">
                    <Clock className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Last updated</p>
                      <p className="font-medium text-foreground">
                        {format(parseISO(task.updated_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 text-sm">
                  <Flag className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Priority</p>
                    <p className="font-medium capitalize text-foreground">{task.priority}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <strong>&ldquo;{task.title}&rdquo;</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
