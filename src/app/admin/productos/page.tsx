import { createClient } from '@/lib/supabase/server'
import type { Categoria, Producto } from '@/lib/supabase/types'
import ProductosList from './ProductosList'

export default async function ProductosPage() {
  const supabase = await createClient()

  const [{ data: productosRaw }, { data: categorias }] = await Promise.all([
    supabase
      .from('productos')
      .select('*, categoria:categorias(*)')
      .order('created_at', { ascending: false }),
    supabase.from('categorias').select('*').order('orden', { ascending: true }),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Productos</h1>
      <ProductosList
        productos={(productosRaw as (Producto & { categoria: Categoria | null })[]) ?? []}
        categorias={(categorias as Categoria[]) ?? []}
      />
    </div>
  )
}
