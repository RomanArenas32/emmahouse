'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function crearProducto(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const imagenes = formData.getAll('imagenes').filter(Boolean) as string[]
  const stockVal = formData.get('stock') as string

  const { error } = await supabase.from('productos').insert({
    nombre: formData.get('nombre') as string,
    descripcion: (formData.get('descripcion') as string) || null,
    precio: formData.get('precio') ? Number(formData.get('precio')) : null,
    precio_oferta: formData.get('precio_oferta') ? Number(formData.get('precio_oferta')) : null,
    categoria_id: (formData.get('categoria_id') as string) || null,
    imagenes,
    activo: formData.get('activo') === 'true',
    destacado: formData.get('destacado') === 'true',
    stock: stockVal !== '' ? Number(stockVal) : null,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/productos')
}

export async function actualizarProducto(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const imagenes = formData.getAll('imagenes').filter(Boolean) as string[]
  const stockVal = formData.get('stock') as string

  const { error } = await supabase
    .from('productos')
    .update({
      nombre: formData.get('nombre') as string,
      descripcion: (formData.get('descripcion') as string) || null,
      precio: formData.get('precio') ? Number(formData.get('precio')) : null,
      precio_oferta: formData.get('precio_oferta') ? Number(formData.get('precio_oferta')) : null,
      categoria_id: (formData.get('categoria_id') as string) || null,
      imagenes,
      activo: formData.get('activo') === 'true',
      destacado: formData.get('destacado') === 'true',
      stock: stockVal !== '' ? Number(stockVal) : null,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/productos')
}

export async function eliminarProducto(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { error } = await supabase.from('productos').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/productos')
}

export async function toggleActivo(id: string, activo: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { error } = await supabase
    .from('productos')
    .update({ activo })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/productos')
}
