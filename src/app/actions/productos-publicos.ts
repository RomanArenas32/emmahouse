'use server'

import { createClient } from '@/lib/supabase/server'
import type { Categoria, Producto } from '@/lib/supabase/types'

const PAGE_SIZE = 12

export async function fetchProductosPublicos({
  categoriaId,
  buscar,
  page,
}: {
  categoriaId?: string
  buscar?: string
  page: number
}): Promise<{ productos: (Producto & { categoria: Categoria | null })[]; hasMore: boolean }> {
  const supabase = await createClient()

  let query = supabase
    .from('productos')
    .select('*, categoria:categorias(*)')
    .eq('activo', true)
    .order('destacado', { ascending: false })
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId)
  }

  if (buscar && buscar.trim()) {
    query = query.or(`nombre.ilike.%${buscar.trim()}%,descripcion.ilike.%${buscar.trim()}%`)
  }

  const { data } = await query

  const productos = (data as (Producto & { categoria: Categoria | null })[] | null) ?? []

  return {
    productos,
    hasMore: productos.length === PAGE_SIZE,
  }
}
