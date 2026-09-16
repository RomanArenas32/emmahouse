'use client'

import { useTransition } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const MAX_PX = 1200  // ancho/alto máximo
const QUALITY = 0.82 // calidad WebP (0-1)

function convertirAWebp(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width > MAX_PX || height > MAX_PX) {
        if (width > height) {
          height = Math.round((height * MAX_PX) / width)
          width = MAX_PX
        } else {
          width = Math.round((width * MAX_PX) / height)
          height = MAX_PX
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob falló'))),
        'image/webp',
        QUALITY
      )
    }

    img.onerror = () => reject(new Error('Error al cargar imagen'))
    img.src = url
  })
}

export default function ImageUpload({
  imagenes,
  onChange,
}: {
  imagenes: string[]
  onChange: (urls: string[]) => void
}) {
  const [isPending, startTransition] = useTransition()

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    startTransition(async () => {
      const supabase = createClient()
      const nuevasUrls: string[] = []

      for (const file of files) {
        let blob: Blob
        try {
          blob = await convertirAWebp(file)
        } catch {
          blob = file // fallback: subir original si falla la conversión
        }

        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`

        const { data, error } = await supabase.storage
          .from('imagenes')
          .upload(filename, blob, { contentType: 'image/webp', upsert: false })

        if (error || !data) continue

        const { data: urlData } = supabase.storage
          .from('imagenes')
          .getPublicUrl(data.path)

        nuevasUrls.push(urlData.publicUrl)
      }

      onChange([...imagenes, ...nuevasUrls])
    })

    e.target.value = ''
  }

  function handleRemove(url: string) {
    onChange(imagenes.filter((u) => u !== url))
  }

  return (
    <div className="flex flex-col gap-3">
      {imagenes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {imagenes.map((url) => (
            <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
              <Image src={url} alt="Imagen producto" fill className="object-contain" sizes="80px" />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}

      <label className={`flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors text-sm text-gray-500 hover:text-brand-600 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {isPending ? 'Convirtiendo y subiendo...' : 'Subir imágenes'}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFile}
          disabled={isPending}
        />
      </label>
      <p className="text-xs text-gray-400">
        Cualquier formato — se convierte a WebP automáticamente (máx. {MAX_PX}px).
      </p>
    </div>
  )
}
