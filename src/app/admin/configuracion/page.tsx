import { createClient } from '@/lib/supabase/server'
import ConfigForm from './ConfigForm'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('configuracion').select('*')

  const config = Object.fromEntries(
    (data ?? []).map((row: { clave: string; valor: string | null }) => [row.clave, row.valor ?? ''])
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Configuración</h1>
      <p className="text-gray-500 text-sm mb-8">Ajustes generales del sitio</p>
      <ConfigForm config={config} />
    </div>
  )
}
