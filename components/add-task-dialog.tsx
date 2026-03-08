'use client'

import { useState } from 'react'
import type { Status, Task } from '@/lib/types'
import { createTask } from '@/lib/actions/tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AddTaskDialogProps {
  projectId: string
  defaultStatus?: Status
  onCreated?: (task: Task) => void
}

interface TaskFormState {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  due_date: string
  tagsInput: string
}

export function AddTaskDialog({
  projectId,
  defaultStatus = 'todo',
  onCreated,
}: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<TaskFormState>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    tagsInput: '',
  })

  function resetForm() {
    setForm({ title: '', description: '', priority: 'medium', due_date: '', tagsInput: '' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)
    try {
      const tags = form.tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const task = await createTask(projectId, {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        status: defaultStatus,
        due_date: form.due_date || null,
        tags,
      })
      onCreated?.(task)
      setOpen(false)
      resetForm()
      toast.success('Task created')
    } catch {
      toast.error('Failed to create task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-full justify-start gap-2 rounded-xl text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-title">Title</Label>
            <Input
              id="add-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-desc">Description</Label>
            <Textarea
              id="add-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description"
              rows={2}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm({ ...form, priority: v as TaskFormState['priority'] })
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
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-tags">
              Tags{' '}
              <span className="font-normal text-muted-foreground">(comma-separated)</span>
            </Label>
            <Input
              id="add-tags"
              value={form.tagsInput}
              onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
              placeholder="design, backend, bug"
            />
          </div>
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !form.title.trim()}
              className="w-full sm:w-auto"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
