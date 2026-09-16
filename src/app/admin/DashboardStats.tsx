'use client'
import Link from 'next/link'
import { motion } from 'motion/react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

type Stat = { label: string; value: number; href: string }

export function DashboardStats({ stats }: { stats: Stat[] }) {
  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={item}>
            <Link
              href={s.href}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow block"
            >
              <p className="text-gray-500 text-sm mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-brand-600">{s.value}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <motion.div variants={item}>
          <Link
            href="/admin/productos"
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-2xl p-6 flex flex-col gap-2 transition-colors block"
          >
            <span className="text-2xl">+</span>
            <span className="font-semibold text-lg">Agregar producto</span>
            <span className="text-brand-200 text-sm">Cargá un nuevo artículo al catálogo</span>
          </Link>
        </motion.div>
        <motion.div variants={item}>
          <Link
            href="/admin/categorias"
            className="bg-white hover:bg-brand-50 border border-gray-100 text-gray-800 rounded-2xl p-6 flex flex-col gap-2 transition-colors block"
          >
            <span className="text-2xl">🗂</span>
            <span className="font-semibold text-lg">Gestionar categorias</span>
            <span className="text-gray-400 text-sm">Organizá los artículos por tipo</span>
          </Link>
        </motion.div>
      </motion.div>
    </>
  )
}
