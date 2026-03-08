'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Project } from '@/lib/types'
import { deleteProject } from '@/lib/actions/projects'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { MoreHorizontal, Trash2, Kanban, ArrowRight, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteProject(project.id)
      toast.success(`"${project.name}" deleted`)
    } catch {
      toast.error('Failed to delete project.')
      setDeleting(false)
    }
  }

  return (
    <>
      <Card className="group overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-primary/[0.035] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_22px_55px_-35px_rgba(59,130,246,0.55)]">
        <div className="h-1 w-full bg-gradient-to-r from-primary/90 via-sky-400/70 to-emerald-400/80" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <Kanban className="h-4 w-4" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary">
                  <Sparkles className="h-3 w-3" />
                  Active workspace
                </span>
              </div>
              <Link
                href={`/board/${project.id}`}
                className="line-clamp-1 flex-1 text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
              >
                {project.name}
              </Link>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span className="sr-only">Project options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setShowDelete(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {project.description && (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          )}
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
            </span>
            <Link href={`/board/${project.id}`} className="shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1 rounded-full px-3 text-xs text-primary hover:bg-primary/10 hover:text-primary"
              >
                <Kanban className="w-3.5 h-3.5" />
                Open board
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{project.name}</strong> and all its tasks. This action cannot be undone.
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
