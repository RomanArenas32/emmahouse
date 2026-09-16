import { createClient } from '@/lib/supabase/server'
import type { Categoria } from '@/lib/supabase/types'
import CategoriasList from './CategoriasList'

export default async function CategoriasPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Categorias</h1>
      <CategoriasList categorias={(data as Categoria[]) ?? []} />
    </div>
  )
}
