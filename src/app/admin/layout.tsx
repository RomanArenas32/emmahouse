import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {user && (
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          {/* Fila superior: logo + logout */}
          <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
            <Link href="/admin">
              <Image src="/logo2.webp" alt="Emma House" width={492} height={507} className="h-10 w-auto" />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors hidden sm:inline"
              >
                Ver sitio ↗
              </Link>
              <LogoutButton />
            </div>
          </div>

          {/* Fila inferior: nav links scrollable */}
          <div className="border-t border-gray-100 overflow-x-auto">
            <nav className="max-w-5xl mx-auto px-4 flex gap-1 min-w-max">
              {[
                { href: '/admin', label: 'Dashboard' },
                { href: '/admin/productos', label: 'Productos' },
                { href: '/admin/categorias', label: 'Categorias' },
                { href: '/admin/configuracion', label: 'Configuración' },
                { href: '/', label: 'Ver sitio ↗', external: true },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors text-gray-500 hover:text-brand-600 ${item.external ? 'sm:hidden' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
      )}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  )
}
