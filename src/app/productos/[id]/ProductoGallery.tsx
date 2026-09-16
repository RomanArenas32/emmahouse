'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'

export default function ProductoGallery({ imagenes, nombre }: { imagenes: string[]; nombre: string }) {
  const [activa, setActiva] = useState(0)

  if (imagenes.length === 0) {
    return (
      <motion.div
        className="aspect-square bg-brand-50 flex items-center justify-center text-brand-200"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="flex flex-col gap-3"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Imagen principal */}
      <div className="relative aspect-square bg-white border border-brand-100 overflow-hidden">
        <Image
          src={imagenes[activa]}
          alt={nombre}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Miniaturas */}
      {imagenes.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {imagenes.map((url, i) => (
            <button
              key={url}
              onClick={() => setActiva(i)}
              className={`relative w-16 h-16 border-2 overflow-hidden transition-colors cursor-pointer ${
                i === activa ? 'border-brand-800' : 'border-brand-100 hover:border-brand-400'
              }`}
            >
              <Image src={url} alt={`${nombre} ${i + 1}`} fill className="object-contain" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}
