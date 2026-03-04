'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Task, Status, Priority } from '@/lib/types'

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as Task[]
}

export async function createTask(
  projectId: string,
  payload: {
    title: string
    description?: string
    status?: Status
    priority?: Priority
    due_date?: string | null
    tags?: string[]
  },
): Promise<Task> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get max position in this status column
  const { data: existing } = await supabase
    .from('tasks')
    .select('position')
    .eq('project_id', projectId)
    .eq('status', payload.status ?? 'todo')
    .order('position', { ascending: false })
    .limit(1)

  const position =
    existing && existing.length > 0 ? (existing[0].position as number) + 1 : 0

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      project_id: projectId,
      user_id: user.id,
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      status: payload.status ?? 'todo',
      priority: payload.priority ?? 'medium',
      due_date: payload.due_date ?? null,
      tags: payload.tags ?? [],
      position,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/board/${projectId}`)
  return data as Task
}

export async function updateTask(
  id: string,
  projectId: string,
  updates: Partial<
    Omit<Task, 'id' | 'project_id' | 'user_id' | 'created_at' | 'updated_at'>
  >,
): Promise<Task> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath(`/board/${projectId}`)
  return data as Task
}

export async function updateTaskStatus(
  id: string,
  projectId: string,
  status: Status,
  position: number,
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .update({ status, position })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/board/${projectId}`)
}

export async function deleteTask(id: string, projectId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/board/${projectId}`)
}
