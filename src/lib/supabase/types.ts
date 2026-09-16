export interface Categoria {
  id: string
  nombre: string
  slug: string
  imagen_url: string | null
  orden: number
  created_at: string
}

export interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  precio: number | null
  precio_oferta: number | null
  imagenes: string[]
  categoria_id: string | null
  activo: boolean
  destacado: boolean
  stock: number | null
  orden: number
  created_at: string
  updated_at: string
  categoria?: Categoria
}
