'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import type { Categoria, Producto } from '@/lib/supabase/types'
import { crearProducto, actualizarProducto, eliminarProducto, toggleActivo } from '@/app/actions/productos'
import { useRouter } from 'next/navigation'
import ImageUpload from './ImageUpload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, ChevronsUpDown, Pencil, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import ConfirmModal from '@/app/admin/ConfirmModal'
import { toast } from 'sonner'

type ProductoConCategoria = Producto & { categoria: Categoria | null }

function StockBadge({ stock }: { stock: number | null }) {
  if (stock === null) return <span className="text-gray-300 text-xs">—</span>
  if (stock === 0) return <span className="text-xs font-medium text-red-500">Sin stock</span>
  return <span className="text-xs font-medium text-gray-700">{stock} u.</span>
}

function ActivoToggle({ p, onToggle, disabled }: { p: ProductoConCategoria; onToggle: (p: ProductoConCategoria) => void; disabled: boolean }) {
  return (
    <button
      onClick={() => onToggle(p)}
      disabled={disabled}
      className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
        p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {p.activo ? 'Activo' : 'Inactivo'}
    </button>
  )
}

const DRAFT_KEY = 'emmahouse_draft_producto'

type Draft = {
  nombre: string
  descripcion: string
  precio: string
  precio_oferta: string
  stock: string
  categoria_id: string
  activo: boolean
  destacado: boolean
  imagenes: string[]
}

const DRAFT_VACIO: Draft = {
  nombre: '',
  descripcion: '',
  precio: '',
  precio_oferta: '',
  stock: '',
  categoria_id: '',
  activo: true,
  destacado: false,
  imagenes: [],
}

function cargarDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? { ...DRAFT_VACIO, ...JSON.parse(raw) } : DRAFT_VACIO
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

function CategoriaCombobox({
  categorias,
  value,
  onChange,
}: {
  categorias: Categoria[]
  value: string
  onChange: (val: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = categorias.find((c) => c.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        role="combobox"
        aria-expanded={open}
        className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-colors"
      >
        <span className={selected ? 'text-gray-800' : 'text-gray-400'}>
          {selected ? selected.nombre : 'Sin categoría'}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-gray-400 shrink-0" />
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar categoría..." />
          <CommandList>
            <CommandEmpty>No se encontró ninguna categoría.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="sin-categoria"
                onSelect={() => { onChange(''); setOpen(false) }}
              >
                <Check className={`mr-2 h-4 w-4 ${value === '' ? 'opacity-100' : 'opacity-0'}`} />
                Sin categoría
              </CommandItem>
              {categorias.map((cat) => (
                <CommandItem
                  key={cat.id}
                  value={cat.nombre}
                  onSelect={() => { onChange(cat.id); setOpen(false) }}
                >
                  <Check className={`mr-2 h-4 w-4 ${value === cat.id ? 'opacity-100' : 'opacity-0'}`} />
                  {cat.nombre}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default function ProductosList({
  productos,
  categorias,
}: {
  productos: ProductoConCategoria[]
  categorias: Categoria[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<ProductoConCategoria | null>(null)
  const [draft, setDraft] = useState<Draft>(DRAFT_VACIO)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  type Confirm = { tipo: 'toggle'; producto: ProductoConCategoria } | { tipo: 'delete'; id: string }
  const [confirm, setConfirm] = useState<Confirm | null>(null)

  function updateDraft(fields: Partial<Draft>) {
    setDraft((prev) => {
      const next = { ...prev, ...fields }
      if (!editando) guardarDraft(next)
      return next
    })
  }

  function handleNuevo() {
    setEditando(null)
    setDraft(cargarDraft())
    setShowForm(true)
  }

  function handleEdit(p: ProductoConCategoria) {
    setEditando(p)
    setDraft({
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      precio: p.precio != null ? String(p.precio) : '',
      precio_oferta: p.precio_oferta != null ? String(p.precio_oferta) : '',
      stock: p.stock != null ? String(p.stock) : '',
      categoria_id: p.categoria_id ?? '',
      activo: p.activo,
      destacado: p.destacado,
      imagenes: p.imagenes ?? [],
    })
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditando(null)
  }

  function handleDelete(id: string) {
    setConfirm({ tipo: 'delete', id })
  }

  function handleToggleActivo(p: ProductoConCategoria) {
    setConfirm({ tipo: 'toggle', producto: p })
  }

  function handleConfirm() {
    if (!confirm) return
    startTransition(async () => {
      try {
        if (confirm.tipo === 'delete') {
          await eliminarProducto(confirm.id)
          toast.success('Producto eliminado')
        } else {
          await toggleActivo(confirm.producto.id, !confirm.producto.activo)
          toast.success(confirm.producto.activo ? 'Producto desactivado' : 'Producto activado')
        }
        setConfirm(null)
        router.refresh()
      } catch {
        toast.error('Ocurrió un error, intentá de nuevo')
      }
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData()
    formData.set('nombre', draft.nombre)
    formData.set('descripcion', draft.descripcion)
    formData.set('precio', draft.precio)
    formData.set('precio_oferta', draft.precio_oferta)
    formData.set('stock', draft.stock)
    formData.set('categoria_id', draft.categoria_id)
    formData.set('activo', editando ? String(draft.activo) : 'true')
    formData.set('destacado', String(draft.destacado))
    draft.imagenes.forEach((url) => formData.append('imagenes', url))

    startTransition(async () => {
      try {
        if (editando) {
          await actualizarProducto(editando.id, formData)
          toast.success('Producto actualizado')
        } else {
          await crearProducto(formData)
          limpiarDraft()
          toast.success('Producto creado')
        }
        handleClose()
        router.refresh()
      } catch {
        toast.error('Ocurrió un error, intentá de nuevo')
      }
    })
  }

  const tieneDraft = !editando && (draft.nombre || draft.descripcion || draft.precio || draft.imagenes.length > 0)

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleNuevo}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          + Nuevo producto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {productos.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p>No hay productos aún</p>
          </div>
        ) : (
          <>
            {/* Tabla — desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium w-12" />
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Producto</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Categoría</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Precio</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Stock</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Estado</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {productos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-50 overflow-hidden relative flex-shrink-0">
                          {p.imagenes?.[0] ? (
                            <Image src={p.imagenes[0]} alt={p.nombre} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-200 text-xs">📷</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 max-w-xs truncate">{p.nombre}</p>
                        {p.destacado && <span className="text-xs text-brand-500 font-medium">Destacado</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.categoria?.nombre ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {p.precio ? (
                          p.precio_oferta ? (
                            <span className="text-brand-600 font-semibold">
                              ${p.precio_oferta.toLocaleString('es-AR')}
                              <span className="text-gray-400 text-xs ml-1 line-through">${p.precio.toLocaleString('es-AR')}</span>
                            </span>
                          ) : (
                            <span>${p.precio.toLocaleString('es-AR')}</span>
                          )
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StockBadge stock={p.stock} />
                      </td>
                      <td className="px-4 py-3">
                        <ActivoToggle p={p} onToggle={handleToggleActivo} disabled={isPending || confirm !== null} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg text-yellow-400 hover:text-yellow-500 hover:bg-yellow-50 transition-colors cursor-pointer" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} disabled={isPending} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards — mobile */}
            <div className="md:hidden divide-y divide-gray-50">
              {productos.map((p) => (
                <div key={p.id} className="p-4 flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-brand-50 overflow-hidden relative flex-shrink-0">
                    {p.imagenes?.[0] ? (
                      <Image src={p.imagenes[0]} alt={p.nombre} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-200">📷</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{p.nombre}</p>
                    <p className="text-xs text-gray-400 mb-1">{p.categoria?.nombre ?? '—'}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {p.precio && (
                        <span className="text-xs font-semibold text-gray-700">
                          ${(p.precio_oferta ?? p.precio).toLocaleString('es-AR')}
                        </span>
                      )}
                      <StockBadge stock={p.stock} />
                      <ActivoToggle p={p} onToggle={handleToggleActivo} disabled={isPending || confirm !== null} />
                    </div>
                    <div className="flex gap-1 mt-2">
                      <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg text-yellow-400 hover:text-yellow-500 hover:bg-yellow-50 transition-colors cursor-pointer" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={isPending} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
          className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 my-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                {editando ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              {tieneDraft && (
                <span className="text-xs text-amber-500 font-medium">Borrador guardado</span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  required
                  value={draft.nombre}
                  onChange={(e) => updateDraft({ nombre: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  rows={3}
                  value={draft.descripcion}
                  onChange={(e) => updateDraft({ descripcion: e.target.value })}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="precio">Precio</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={draft.precio}
                    onChange={(e) => updateDraft({ precio: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="precio_oferta">Precio oferta</Label>
                  <Input
                    id="precio_oferta"
                    type="number"
                    step="0.01"
                    min="0"
                    value={draft.precio_oferta}
                    onChange={(e) => updateDraft({ precio_oferta: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={draft.stock}
                    onChange={(e) => updateDraft({ stock: e.target.value })}
                    placeholder="—"
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label>Categoría</Label>
                <CategoriaCombobox
                  categorias={categorias}
                  value={draft.categoria_id}
                  onChange={(val) => updateDraft({ categoria_id: val })}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Imágenes</Label>
                <ImageUpload
                  imagenes={draft.imagenes}
                  onChange={(imgs) => updateDraft({ imagenes: imgs })}
                />
              </div>

              <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer select-none transition-colors ${draft.destacado ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="checkbox"
                  checked={draft.destacado}
                  onChange={(e) => updateDraft({ destacado: e.target.checked })}
                  className="mt-0.5 rounded accent-brand-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">Destacar producto</p>
                  <p className="text-xs text-gray-500 mt-0.5">Aparece primero en el catálogo y con una etiqueta especial en la foto.</p>
                </div>
              </label>

              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <ConfirmModal
        open={confirm !== null}
        variant={confirm?.tipo === 'delete' ? 'warning' : 'default'}
        title={
          confirm?.tipo === 'delete'
            ? '¿Eliminar producto?'
            : confirm?.producto.activo
            ? '¿Desactivar producto?'
            : '¿Activar producto?'
        }
        description={
          confirm?.tipo === 'delete'
            ? 'Esta acción no se puede deshacer. El producto se eliminará permanentemente.'
            : confirm?.producto.activo
            ? 'El producto dejará de aparecer en el catálogo público.'
            : 'El producto volverá a aparecer en el catálogo público.'
        }
        confirmLabel={
          confirm?.tipo === 'delete'
            ? 'Eliminar'
            : confirm?.producto.activo
            ? 'Desactivar'
            : 'Activar'
        }
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}
