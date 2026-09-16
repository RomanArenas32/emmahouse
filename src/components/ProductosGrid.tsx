'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Categoria, Producto } from '@/lib/supabase/types'
import { ProductCard } from './ProductCard'
import { fetchProductosPublicos } from '@/app/actions/productos-publicos'

type ProductoConCategoria = Producto & { categoria: Categoria | null }

export default function ProductosGrid({
  initialProductos,
  initialHasMore,
  categoriaId,
  buscar,
  whatsappNumber,
}: {
  initialProductos: ProductoConCategoria[]
  initialHasMore: boolean
  categoriaId?: string
  buscar?: string
  whatsappNumber: string
}) {
  const [productos, setProductos] = useState(initialProductos)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Reset cuando cambia la categoría o búsqueda
  const [prevFilter, setPrevFilter] = useState({ categoriaId, buscar })
  if (prevFilter.categoriaId !== categoriaId || prevFilter.buscar !== buscar) {
    setPrevFilter({ categoriaId, buscar })
    setProductos(initialProductos)
    setHasMore(initialHasMore)
    setPage(1)
  }

  // IntersectionObserver para cargar más
  useEffect(() => {
    if (!hasMore || isPending) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startTransition(async () => {
            const { productos: nuevos, hasMore: more } = await fetchProductosPublicos({
              categoriaId,
              buscar,
              page,
            })
            setProductos((prev) => [...prev, ...nuevos])
            setHasMore(more)
            setPage((p) => p + 1)
          })
        }
      },
      { rootMargin: '200px' }
    )

    const el = sentinelRef.current
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [hasMore, isPending, page, categoriaId, buscar])

  const gridKey = `${categoriaId ?? 'all'}-${buscar ?? ''}`

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={gridKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-brand-100"
        >
          {productos.map((producto, index) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              whatsappNumber={whatsappNumber}
              index={index}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Sentinel + loader */}
      <div ref={sentinelRef} className="flex justify-center py-8">
        {isPending && (
          <div className="flex gap-1.5 items-center">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        )}
      </div>
    </>
  )
}
