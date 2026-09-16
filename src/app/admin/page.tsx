import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <p className="text-gray-500 text-sm mb-1">{s.label}</p>
            <p className="text-3xl font-bold text-brand-600">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/productos"
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-2xl p-6 flex flex-col gap-2 transition-colors"
        >
          <span className="text-2xl">+</span>
          <span className="font-semibold text-lg">Agregar producto</span>
          <span className="text-brand-200 text-sm">Cargá un nuevo artículo al catálogo</span>
        </Link>
        <Link
          href="/admin/categorias"
          className="bg-white hover:bg-brand-50 border border-gray-100 text-gray-800 rounded-2xl p-6 flex flex-col gap-2 transition-colors"
        >
          <span className="text-2xl">🗂</span>
          <span className="font-semibold text-lg">Gestionar categorias</span>
          <span className="text-gray-400 text-sm">Organizá los artículos por tipo</span>
        </Link>
      </div>
    </div>
  )
}
