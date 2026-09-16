'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function guardarConfiguracion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const claves = ['whatsapp_numero', 'barra_texto', 'negocio_nombre', 'hero_imagen']

  for (const clave of claves) {
    const valor = (formData.get(clave) as string) ?? ''
    const { error } = await supabase
      .from('configuracion')
      .upsert({ clave, valor }, { onConflict: 'clave' })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/')
  revalidatePath('/admin/configuracion')
}
