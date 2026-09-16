import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from './DashboardStats'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: totalProductos }, { count: totalCategorias }, { count: productosActivos }] =
    await Promise.all([
      supabase.from('productos').select('*', { count: 'exact', head: true }),
      supabase.from('categorias').select('*', { count: 'exact', head: true }),
      supabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true),
    ])

  const stats = [
    { label: 'Productos totales', value: totalProductos ?? 0, href: '/admin/productos' },
    { label: 'Activos', value: productosActivos ?? 0, href: '/admin/productos' },
    { label: 'Categorias', value: totalCategorias ?? 0, href: '/admin/categorias' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Panel de control</h1>

      <DashboardStats stats={stats} />
    </div>
  )
}
