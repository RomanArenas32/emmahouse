'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function crearCategoria(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const nombre = formData.get('nombre') as string
  const slug = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  const { error } = await supabase.from('categorias').insert({
    nombre,
    slug,
    imagen_url: (formData.get('imagen_url') as string) || null,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/categorias')
}

export async function actualizarCategoria(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const nombre = formData.get('nombre') as string
  const slug = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  const { error } = await supabase
    .from('categorias')
    .update({
      nombre,
      slug,
      imagen_url: (formData.get('imagen_url') as string) || null,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/categorias')
}

export async function eliminarCategoria(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { error } = await supabase.from('categorias').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/categorias')
}
