'use client'
import Link from 'next/link'
import { motion } from 'motion/react'
import type { Categoria, Producto } from '@/lib/supabase/types'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function WaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current ${className ?? ''}`} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.882a.5.5 0 0 0 .613.613l6.123-1.47A11.935 11.935 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.678-.511-5.21-1.402l-.373-.221-3.867.928.95-3.773-.243-.389A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  )
}

export function ProductoInfo({
  producto,
  waLink,
}: {
  producto: Producto & { categoria: Categoria | null }
  waLink: string | null
}) {
  return (
    <motion.div className="flex flex-col gap-6" variants={container} initial="hidden" animate="show">
      {producto.categoria && (
        <motion.p variants={item} className="text-xs tracking-widest uppercase text-brand-400">
          {producto.categoria.nombre}
        </motion.p>
      )}

      <motion.h1 variants={item} className="text-2xl md:text-3xl font-bold text-brand-900 leading-snug">
        {producto.nombre}
      </motion.h1>

      <motion.div variants={item}>
        {producto.precio_oferta ? (
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-brand-900">
              ${producto.precio_oferta.toLocaleString('es-AR')}
            </span>
            <span className="text-base text-brand-300 line-through">
              ${producto.precio?.toLocaleString('es-AR')}
            </span>
          </div>
        ) : producto.precio ? (
          <span className="text-2xl font-bold text-brand-900">
            ${producto.precio.toLocaleString('es-AR')}
          </span>
        ) : null}
      </motion.div>

      {producto.stock === 0 && (
        <motion.span
          variants={item}
          className="inline-block bg-gray-100 text-gray-500 text-xs tracking-widest uppercase px-3 py-1.5 w-fit"
        >
          Sin stock
        </motion.span>
      )}

      {producto.descripcion && (
        <motion.p
          variants={item}
          className="text-sm text-brand-600 leading-relaxed border-t border-brand-100 pt-5"
        >
          {producto.descripcion}
        </motion.p>
      )}

      {waLink && (
        <motion.a
          variants={item}
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-brand-900 hover:bg-brand-700 text-white text-sm tracking-widest uppercase py-4 px-8 transition-colors mt-2"
        >
          <WaIcon className="w-5 h-5" />
          Consultar por WhatsApp
        </motion.a>
      )}

      <motion.div variants={item}>
        <Link
          href="/"
          className="text-xs text-brand-400 hover:text-brand-700 tracking-widest uppercase transition-colors text-center block"
        >
          ← Volver al catálogo
        </Link>
      </motion.div>
    </motion.div>
  )
}
