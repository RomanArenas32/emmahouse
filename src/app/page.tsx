import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Categoria } from '@/lib/supabase/types'
import WhatsAppButton from '@/components/WhatsAppButton'
import { HeroSection } from '@/components/HeroSection'
import ProductosGrid from '@/components/ProductosGrid'
import SearchBar from '@/components/SearchBar'
import { fetchProductosPublicos } from '@/app/actions/productos-publicos'
import { Suspense } from 'react'

export default async function CatalogPage({ searchParams }: PageProps<'/'>) {
  const { categoria: categoriaSlug, buscar } = (await searchParams) as { categoria?: string; buscar?: string }

  const supabase = await createClient()

  const [{ data: categorias }, { data: configRaw }] = await Promise.all([
    supabase.from('categorias').select('*').order('nombre', { ascending: true }),
    supabase.from('configuracion').select('*'),
  ])

  const config = Object.fromEntries(
    ((configRaw ?? []) as { clave: string; valor: string | null }[]).map((r) => [r.clave, r.valor ?? ''])
  )

  const whatsappNumber = config.whatsapp_numero ?? ''
  const barraTex = config.barra_texto ?? 'Consultá por WhatsApp · Envíos a todo el país'
  const negocioNombre = config.negocio_nombre ?? 'Emma House'
  const heroImagen = config.hero_imagen ?? ''

  const categoriaActiva = (categorias as Categoria[] | null)?.find(
    (c) => c.slug === categoriaSlug
  )

  const { productos: initialProductos, hasMore: initialHasMore } = await fetchProductosPublicos({
    categoriaId: categoriaActiva?.id,
    buscar,
    page: 0,
  })

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Barra superior */}
      {barraTex && (
        <div className="bg-brand-800 text-white text-xs text-center py-2 px-4 tracking-widest uppercase font-light">
          {barraTex}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-brand-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex-1" />
          <Link href="/" className="flex items-center">
            <Image
              src="/logo2.webp"
              alt="Emma House"
              width={492}
              height={507}
              priority
              className="h-20 w-auto"
            />
          </Link>
          <div className="flex-1 flex justify-end">
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-900 transition-colors tracking-wider uppercase"
              >
                <WaIcon className="w-4 h-4 text-green-600" />
                Contacto
              </a>
            )}
          </div>
        </div>

        {/* Buscador */}
        <div className="border-t border-brand-100 py-2.5 px-6">
          <div className="max-w-6xl mx-auto flex justify-center">
            <Suspense>
              <SearchBar initialValue={buscar ?? ''} />
            </Suspense>
          </div>
        </div>

        {/* Nav de categorias */}
        {categorias && categorias.length > 0 && (
          <nav className="border-t border-brand-100 overflow-x-auto">
            <div className="max-w-6xl mx-auto px-6 flex justify-center gap-0 min-w-max">
              <Link
                href="/"
                className={`px-5 py-3 text-xs tracking-widest uppercase font-medium transition-colors border-b-2 ${
                  !categoriaSlug
                    ? 'border-brand-800 text-brand-900'
                    : 'border-transparent text-brand-400 hover:text-brand-700'
                }`}
              >
                Todos
              </Link>
              {(categorias as Categoria[]).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/?categoria=${cat.slug}`}
                  className={`px-5 py-3 text-xs tracking-widest uppercase font-medium transition-colors border-b-2 whitespace-nowrap ${
                    categoriaSlug === cat.slug
                      ? 'border-brand-800 text-brand-900'
                      : 'border-transparent text-brand-400 hover:text-brand-700'
                  }`}
                >
                  {cat.nombre}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        {/* Hero */}
        <HeroSection whatsappNumber={whatsappNumber} heroImagen={heroImagen || undefined} />

        {/* Productos */}
        <section id="productos" className="max-w-6xl mx-auto px-6 py-12">
          {categoriaActiva && (
            <h2 className="text-lg font-bold tracking-widest uppercase text-brand-800 mb-8 text-center">
              {categoriaActiva.nombre}
            </h2>
          )}

          {initialProductos.length === 0 ? (
            <div className="text-center py-24 text-brand-300">
              <p className="text-base tracking-widest uppercase">No hay productos disponibles</p>
              {categoriaActiva && (
                <Link
                  href="/"
                  className="mt-4 inline-block text-brand-500 hover:text-brand-800 text-xs tracking-widest uppercase transition-colors"
                >
                  Ver todo
                </Link>
              )}
            </div>
          ) : (
            <ProductosGrid
              initialProductos={initialProductos}
              initialHasMore={initialHasMore}
              categoriaId={categoriaActiva?.id}
              buscar={buscar}
              whatsappNumber={whatsappNumber}
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-brand-900 text-brand-400 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <span className="text-white font-bold tracking-[0.2em] uppercase text-sm">
            {negocioNombre}
          </span>
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-brand-400 hover:text-white transition-colors tracking-widest uppercase"
            >
              <WaIcon className="w-4 h-4 text-green-500" />
              Escribinos por WhatsApp
            </a>
          )}
          <p className="text-xs text-brand-600 mt-2">
            © {new Date().getFullYear()} Emma House · Todos los derechos reservados
          </p>
        </div>
      </footer>

      <WhatsAppButton number={whatsappNumber} />
    </div>
  )
}

function WaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current ${className ?? ''}`} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.882a.5.5 0 0 0 .613.613l6.123-1.47A11.935 11.935 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.678-.511-5.21-1.402l-.373-.221-3.867.928.95-3.773-.243-.389A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  )
}
