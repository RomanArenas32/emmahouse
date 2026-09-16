'use client'

import { useTransition, useState } from 'react'
import Image from 'next/image'
import { guardarConfiguracion } from '@/app/actions/configuracion'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function ConfigForm({ config }: { config: Record<string, string> }) {
  const [isPending, startTransition] = useTransition()
  const [heroImagen, setHeroImagen] = useState(config.hero_imagen ?? '')
  const [uploadingHero, setUploadingHero] = useState(false)
  const router = useRouter()

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingHero(true)
    try {
      const supabase = createClient()
      const filename = `hero-${Date.now()}.webp`
      const { data, error } = await supabase.storage
        .from('imagenes')
        .upload(filename, file, { contentType: file.type, upsert: true })
      if (error || !data) throw new Error(error?.message)
      const { data: urlData } = supabase.storage.from('imagenes').getPublicUrl(data.path)
      setHeroImagen(urlData.publicUrl)
    } catch {
      toast.error('Error al subir la imagen')
    } finally {
      setUploadingHero(false)
      e.target.value = ''
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await guardarConfiguracion(formData)
        toast.success('Configuración guardada')
        router.refresh()
      } catch {
        toast.error('Ocurrió un error al guardar')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-lg flex flex-col gap-6">
      <input type="hidden" name="hero_imagen" value={heroImagen} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Número de WhatsApp
        </label>
        <input
          name="whatsapp_numero"
          defaultValue={config.whatsapp_numero}
          placeholder="Ej: 5491112345678"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <p className="text-xs text-gray-400 mt-1">
          Con código de país, sin +, sin espacios. Ej: 5491112345678
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texto de la barra superior
        </label>
        <input
          name="barra_texto"
          defaultValue={config.barra_texto}
          placeholder="Ej: Consultá por WhatsApp · Envíos a todo el país"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del negocio
        </label>
        <input
          name="negocio_nombre"
          defaultValue={config.negocio_nombre}
          placeholder="Ej: Emma House"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Banner del hero</label>
        {heroImagen && (
          <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2 border border-gray-200">
            <Image src={heroImagen} alt="Banner" fill className="object-cover" sizes="512px" />
            <button
              type="button"
              onClick={() => setHeroImagen('')}
              className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg hover:bg-black/80 transition-colors"
            >
              Quitar
            </button>
          </div>
        )}
        <label className={`flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors text-sm text-gray-500 ${uploadingHero ? 'opacity-50 pointer-events-none' : ''}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {uploadingHero ? 'Subiendo...' : heroImagen ? 'Cambiar imagen' : 'Subir imagen de fondo'}
          <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} disabled={uploadingHero} />
        </label>
        <p className="text-xs text-gray-400 mt-1">Recomendado: imagen horizontal ancha (1920×560px aprox.)</p>
      </div>

      <button
        type="submit"
        disabled={isPending || uploadingHero}
        className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm w-fit"
      >
        {isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
