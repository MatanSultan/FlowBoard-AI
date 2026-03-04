'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Project } from '@/lib/types'

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Project[]
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Project
}

export async function createProject(formData: FormData): Promise<Project> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: name.trim(),
      description: description?.trim() || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  return data as Project
}

export async function updateProject(id: string, formData: FormData): Promise<Project> {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const { data, error } = await supabase
    .from('projects')
    .update({ name: name.trim(), description: description?.trim() || null })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  return data as Project
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}
