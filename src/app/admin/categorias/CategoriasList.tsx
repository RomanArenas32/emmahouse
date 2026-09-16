'use client'

import { useState, useTransition } from 'react'
import type { Categoria } from '@/lib/supabase/types'
import { crearCategoria, actualizarCategoria, eliminarCategoria } from '@/app/actions/categorias'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/app/admin/ConfirmModal'
import { Pencil, Trash2, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'

const DRAFT_KEY = 'emmahouse_draft_categoria'

type Draft = { nombre: string }

const DRAFT_VACIO: Draft = { nombre: '' }

function cargarDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : DRAFT_VACIO
  } catch {
    return DRAFT_VACIO
  }
}

function guardarDraft(d: Draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(d))
}

function limpiarDraft() {
  localStorage.removeItem(DRAFT_KEY)
}

export default function CategoriasList({ categorias }: { categorias: Categoria[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [draft, setDraft] = useState<Draft>(DRAFT_VACIO)
  const [isPending, startTransition] = useTransition()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [buscar, setBuscar] = useState('')
  const router = useRouter()

  const categoriasFiltradas = buscar.trim()
    ? categorias.filter((c) => c.nombre.toLowerCase().includes(buscar.toLowerCase()))
    : categorias

  function updateDraft(field: keyof Draft, value: string) {
    const next = { ...draft, [field]: value }
    setDraft(next)
    if (!editando) guardarDraft(next)
  }

  function handleNuevo() {
    setEditando(null)
    setDraft(cargarDraft())
    setShowForm(true)
  }

  function handleEdit(cat: Categoria) {
    setEditando(cat)
    setDraft({ nombre: cat.nombre })
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditando(null)
  }

  function handleDelete(id: string) {
    setConfirmId(id)
  }

  function handleConfirmDelete() {
    if (!confirmId) return
    startTransition(async () => {
      try {
        await eliminarCategoria(confirmId)
        toast.success('Categoría eliminada')
        setConfirmId(null)
        router.refresh()
      } catch {
        toast.error('Ocurrió un error, intentá de nuevo')
      }
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        if (editando) {
          await actualizarCategoria(editando.id, formData)
          toast.success('Categoría actualizada')
        } else {
          await crearCategoria(formData)
          limpiarDraft()
          toast.success('Categoría creada')
        }
        handleClose()
        router.refresh()
      } catch {
        toast.error('Ocurrió un error, intentá de nuevo')
      }
    })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar categorías..."
            className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
          {buscar && (
            <button
              type="button"
              onClick={() => setBuscar('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={handleNuevo}
          className="ml-auto bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          + Nueva categoría
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {categorias.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p>No hay categorías aún</p>
          </div>
        ) : categoriasFiltradas.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p>Sin resultados para &ldquo;{buscar}&rdquo;</p>
          </div>
        ) : (
          <>
            {/* Tabla — desktop */}
            <table className="hidden md:table w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Slug</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categoriasFiltradas.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{cat.nombre}</td>
                    <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => handleEdit(cat)} className="p-1.5 rounded-lg text-yellow-400 hover:text-yellow-500 hover:bg-yellow-50 transition-colors cursor-pointer" title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} disabled={isPending} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cards — mobile */}
            <div className="md:hidden divide-y divide-gray-50">
              {categoriasFiltradas.map((cat) => (
                <div key={cat.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{cat.nombre}</p>
                    <p className="text-xs text-gray-400">{cat.slug}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEdit(cat)} className="p-1.5 rounded-lg text-yellow-400 hover:text-yellow-500 hover:bg-yellow-50 transition-colors cursor-pointer" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} disabled={isPending} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                {editando ? 'Editar categoría' : 'Nueva categoría'}
              </h2>
              {!editando && draft.nombre && (
                <span className="text-xs text-amber-500 font-medium">Borrador guardado</span>
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  name="nombre"
                  required
                  value={draft.nombre}
                  onChange={(e) => updateDraft('nombre', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-xl transition-colors"
                >
                  {isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <ConfirmModal
        open={confirmId !== null}
        variant="warning"
        title="¿Eliminar categoría?"
        description="Esta acción no se puede deshacer. Los productos de esta categoría quedarán sin categoría asignada."
        confirmLabel="Eliminar"
        isPending={isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
