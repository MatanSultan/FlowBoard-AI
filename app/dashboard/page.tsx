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
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {projects.length === 0
                ? 'Create your first project to get started'
                : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <NewProjectDialog />
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <LayoutGrid className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No projects yet</h2>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Projects help you organize your work. Create one and start adding tasks to your kanban board.
            </p>
            <NewProjectDialog />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
