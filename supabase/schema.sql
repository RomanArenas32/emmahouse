-- =============================================
-- EmmaHouse Bazar - Schema SQL
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Tabla de categorias
create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  imagen_url text,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

-- Tabla de productos
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  precio numeric(10, 2),
  precio_oferta numeric(10, 2),
  imagenes text[] not null default '{}',
  categoria_id uuid references categorias (id) on delete set null,
  activo boolean not null default true,
  destacado boolean not null default false,
  stock integer,
  orden int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabla de configuracion (clave-valor)
create table if not exists configuracion (
  clave text primary key,
  valor text,
  updated_at timestamptz not null default now()
);

-- Valores iniciales de configuracion
insert into configuracion (clave, valor) values
  ('whatsapp_numero', ''),
  ('barra_texto', 'Consultá por WhatsApp · Envíos a todo el país'),
  ('negocio_nombre', 'Emma House')
on conflict (clave) do nothing;

-- Trigger para updated_at en productos
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger productos_updated_at
  before update on productos
  for each row execute function update_updated_at();

-- RLS
alter table categorias enable row level security;
alter table productos enable row level security;
alter table configuracion enable row level security;

-- Lectura publica
create policy "Lectura publica categorias"
  on categorias for select using (true);

create policy "Lectura publica productos activos"
  on productos for select using (activo = true);

create policy "Lectura publica configuracion"
  on configuracion for select using (true);

-- Admin: escritura (solo usuarios autenticados)
create policy "Admin insert categorias"
  on categorias for insert with check (auth.role() = 'authenticated');

create policy "Admin update categorias"
  on categorias for update using (auth.role() = 'authenticated');

create policy "Admin delete categorias"
  on categorias for delete using (auth.role() = 'authenticated');

create policy "Admin insert productos"
  on productos for insert with check (auth.role() = 'authenticated');

create policy "Admin update productos"
  on productos for update using (auth.role() = 'authenticated');

create policy "Admin delete productos"
  on productos for delete using (auth.role() = 'authenticated');

create policy "Admin select all productos"
  on productos for select using (auth.role() = 'authenticated');

create policy "Admin update configuracion"
  on configuracion for update using (auth.role() = 'authenticated');

-- =============================================
-- Storage bucket para imagenes
-- Crear manualmente en Storage > New Bucket:
-- nombre: "imagenes", activar Public bucket
-- =============================================
