'use client'

import { useState } from 'react'
import { createTask } from '@/lib/actions/tasks'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Sparkles, Loader2, Plus, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface GeneratedTask {
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high'
  tags: string[]
}

const PRIORITY_CONFIG = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

interface AiGenerateDialogProps {
  projectId: string
  projectName: string
}

export function AiGenerateDialog({ projectId, projectName }: AiGenerateDialogProps) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<GeneratedTask[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [adding, setAdding] = useState(false)
  const [done, setDone] = useState(false)

  async function handleGenerate() {
    if (!prompt.trim()) return
    setLoading(true)
    setTasks([])
    setSelected(new Set())
    setDone(false)
    try {
      const res = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, projectName }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to generate tasks.')
        return
      }
      const generatedTasks: GeneratedTask[] = data.tasks ?? []
      if (generatedTasks.length === 0) {
        toast.warning('No tasks were generated. Try a different prompt.')
        return
      }
      setTasks(generatedTasks)
      setSelected(new Set(generatedTasks.map((_, i) => i)))
    } catch {
      toast.error('Failed to reach AI service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function toggleTask(i: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  async function handleAddSelected() {
    setAdding(true)
    const toAdd = tasks.filter((_, i) => selected.has(i))
    try {
      await Promise.all(
        toAdd.map((t) =>
          createTask(projectId, {
            title: t.title,
            description: t.description ?? undefined,
            priority: t.priority,
            status: 'todo',
            tags: t.tags,
          }),
        ),
      )
      setDone(true)
      toast.success(`Added ${toAdd.length} task${toAdd.length !== 1 ? 's' : ''} to the board`)
      setTimeout(() => {
        setOpen(false)
        setPrompt('')
        setTasks([])
        setSelected(new Set())
        setDone(false)
      }, 1000)
    } catch {
      toast.error('Failed to add tasks. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 sm:w-auto">
          <Sparkles className="h-4 w-4 text-primary" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Task Generator
          </DialogTitle>
          <DialogDescription>
            Describe what you want to accomplish and AI will generate tasks for your board.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">What do you want to work on?</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`e.g. "Set up user authentication with email and social login"`}
              rows={3}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate()
              }}
            />
            <p className="text-xs text-muted-foreground">Press Cmd+Enter to generate</p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating tasks...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate tasks
              </>
            )}
          </Button>

          {tasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-foreground">
                  Select tasks to add ({selected.size}/{tasks.length})
                </p>
                <button
                  onClick={() =>
                    setSelected(
                      selected.size === tasks.length
                        ? new Set()
                        : new Set(tasks.map((_, i) => i)),
                    )
                  }
                  className="self-start text-xs text-primary hover:underline"
                >
                  {selected.size === tasks.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {tasks.map((task, i) => (
                  <div
                    key={i}
                    onClick={() => toggleTask(i)}
                    className={`cursor-pointer rounded-lg border p-3 transition-all ${
                      selected.has(i)
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border bg-card opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          selected.has(i)
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        }`}
                      >
                        {selected.has(i) && (
                          <svg className="h-2.5 w-2.5 text-primary-foreground" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge className={`h-5 border-0 px-1.5 py-0 text-xs ${PRIORITY_CONFIG[task.priority]}`}>
                            {task.priority}
                          </Badge>
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="h-5 px-1.5 py-0 text-xs font-normal">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleAddSelected}
                disabled={adding || selected.size === 0 || done}
                className="w-full gap-2"
              >
                {done ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Added!
                  </>
                ) : adding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding tasks...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add {selected.size} task{selected.size !== 1 ? 's' : ''} to board
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
