import { notFound } from 'next/navigation'
import { getProject } from '@/lib/actions/projects'
import { getTasksByProject } from '@/lib/actions/tasks'
import { AppNavbar } from '@/components/app-navbar'
import { KanbanBoard } from '@/components/kanban-board'
import { AiGenerateDialog } from '@/components/ai-generate-dialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface BoardPageProps {
  params: Promise<{ id: string }>
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params
  const [project, tasks] = await Promise.all([getProject(id), getTasksByProject(id)])

  if (!project) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNavbar />
      <main className="flex flex-1 flex-col px-3 py-5 sm:px-4 sm:py-6">
        <div className="mx-auto mb-5 w-full max-w-6xl sm:mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <Link href="/dashboard" className="shrink-0">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back to dashboard</span>
                </Button>
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">{project.name}</h1>
                {project.description && (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:max-w-2xl">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <AiGenerateDialog projectId={project.id} projectName={project.name} />
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
          <KanbanBoard projectId={project.id} initialTasks={tasks} />
        </div>
      </main>
    </div>
  )
}
