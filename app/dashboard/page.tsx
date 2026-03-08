import { getProjects } from '@/lib/actions/projects'
import { AppNavbar } from '@/components/app-navbar'
import { ProjectCard } from '@/components/project-card'
import { NewProjectDialog } from '@/components/new-project-dialog'
import { LayoutGrid } from 'lucide-react'

export default async function DashboardPage() {
  const projects = await getProjects()

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Projects</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {projects.length === 0
                ? 'Create your first project to get started'
                : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <NewProjectDialog />
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center sm:py-24">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <LayoutGrid className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">No projects yet</h2>
            <p className="mb-6 max-w-xs text-sm text-muted-foreground">
              Projects help you organize your work. Create one and start adding tasks to your kanban board.
            </p>
            <div className="w-full max-w-xs">
              <NewProjectDialog />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
