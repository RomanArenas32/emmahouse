import { createClient } from '@/lib/supabase/server'
import type { Categoria, Producto } from '@/lib/supabase/types'
import ProductosList from './ProductosList'
const PAGE_SIZE = 20

export default async function ProductosPage() {
  const supabase = await createClient()

  const [{ data: productosRaw }, { data: categorias }] = await Promise.all([
    supabase
      .from('productos')
      .select('*, categoria:categorias(*)')
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1),
    supabase.from('categorias').select('*').order('nombre', { ascending: true }),
  ])

  const productos = (productosRaw as (Producto & { categoria: Categoria | null })[]) ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Productos</h1>
      <ProductosList
        initialProductos={productos}
        initialHasMore={productos.length === PAGE_SIZE}
        categorias={(categorias as Categoria[]) ?? []}
      />
    </div>
  )
}
