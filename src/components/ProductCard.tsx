'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import type { Categoria, Producto } from '@/lib/supabase/types'

function WaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current ${className ?? ''}`} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.882a.5.5 0 0 0 .613.613l6.123-1.47A11.935 11.935 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.678-.511-5.21-1.402l-.373-.221-3.867.928.95-3.773-.243-.389A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  )
}

export function ProductCard({
  producto,
  whatsappNumber,
  index = 0,
}: {
  producto: Producto & { categoria: Categoria | null }
  whatsappNumber: string
  index?: number
}) {
  const imagenPrincipal = producto.imagenes?.[0]
  const mensaje = encodeURIComponent(`Hola EmmaHouse! Me interesa: *${producto.nombre}*`)
  const waLink = `https://wa.me/${whatsappNumber}?text=${mensaje}`

  return (
    <motion.div
      className="bg-white group relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07, ease: 'easeOut' }}
    >
      {/* Imagen */}
      <Link href={`/productos/${producto.id}`} className="block relative aspect-square bg-white overflow-hidden">
        {imagenPrincipal ? (
          <Image
            src={imagenPrincipal}
            alt={producto.nombre}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-200">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {producto.destacado && (
          <span className="absolute top-3 left-3 bg-brand-900 text-white text-[10px] tracking-widest uppercase px-2 py-1">
            Destacado
          </span>
        )}
        {producto.stock === 0 && (
          <span className="absolute top-3 right-3 bg-gray-800/80 text-white text-[10px] tracking-widest uppercase px-2 py-1">
            Sin stock
          </span>
        )}

        {/* Overlay con boton */}
        {whatsappNumber && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-x-0 bottom-0 bg-brand-900/90 text-white text-xs tracking-widest uppercase py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <WaIcon className="w-3.5 h-3.5" />
            Consultar
          </a>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        {producto.categoria && (
          <p className="text-[10px] tracking-widest uppercase text-brand-400 mb-1">
            {producto.categoria.nombre}
          </p>
        )}
        <Link href={`/productos/${producto.id}`} className="text-sm text-brand-800 leading-snug line-clamp-2 mb-2 hover:text-brand-600 transition-colors block">
          {producto.nombre}
        </Link>

        {producto.precio && (
          <div>
            {producto.precio_oferta ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-brand-900">
                  ${producto.precio_oferta.toLocaleString('es-AR')}
                </span>
                <span className="text-xs text-brand-300 line-through">
                  ${producto.precio.toLocaleString('es-AR')}
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-brand-900">
                ${producto.precio.toLocaleString('es-AR')}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
