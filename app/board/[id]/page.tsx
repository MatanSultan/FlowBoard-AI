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
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />
      <main className="flex-1 flex flex-col px-4 py-6 max-w-full">
        {/* Board header */}
        <div className="max-w-6xl mx-auto w-full mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="sr-only">Back to dashboard</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
                )}
              </div>
            </div>
            <AiGenerateDialog projectId={project.id} projectName={project.name} />
          </div>
        </div>

        {/* Kanban columns */}
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          <KanbanBoard projectId={project.id} initialTasks={tasks} />
        </div>
      </main>
    </div>
  )
}
