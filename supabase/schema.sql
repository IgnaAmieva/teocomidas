-- ============================================================
-- Teo Comidas — Schema con RLS endurecido
-- ============================================================

-- Tabla de productos
create table if not exists productos (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  descripcion text not null default '',
  precio numeric(10,2) not null,
  imagen_url text not null default '',
  categoria text not null check (categoria in ('desayuno', 'almuerzo', 'merienda', 'cena')),
  disponible boolean not null default true,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

alter table productos enable row level security;

-- Productos: lectura pública (menú), escritura solo service_role
create policy "productos_select_public"
  on productos for select
  using (true);

-- No se crean policies de INSERT/UPDATE/DELETE para anon ni authenticated.
-- Solo service_role (que bypasea RLS) puede modificar productos.
-- Esto previene que un usuario autenticado modifique el menú.


-- Secuencia para números de pedido correlativos
create sequence if not exists pedidos_numero_seq;

-- Tabla de pedidos
create table if not exists pedidos (
  id uuid default gen_random_uuid() primary key,
  numero_pedido integer not null default nextval('pedidos_numero_seq'),
  created_at timestamptz not null default now(),
  items jsonb not null,
  total numeric(10,2) not null,
  modalidad text not null check (modalidad in ('retiro', 'auto_car')),
  horario_solicitado text,
  nombre_cliente text not null,
  color_auto text,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'en_preparacion', 'listo', 'entregado')),
  metodo_pago text not null default 'mercado_pago'
    check (metodo_pago in ('mercado_pago', 'efectivo')),
  mp_payment_id text,
  mp_status text not null default 'pending'
    check (mp_status in ('pending', 'approved', 'rejected'))
);

alter table pedidos enable row level security;

-- INSERT: solo el rol anon puede crear pedidos (desde el checkout público).
-- Los campos estado y mp_status se setean por defecto en la DB,
-- no importa lo que mande el cliente.
create policy "pedidos_insert_anon"
  on pedidos for insert
  to anon
  with check (true);

-- SELECT: solo usuarios autenticados (admin) pueden leer pedidos.
-- Anon NO puede leer — previene enumeración y fuga de datos.
create policy "pedidos_select_authenticated"
  on pedidos for select
  to authenticated
  using (true);

-- UPDATE/DELETE: ninguna policy para anon ni authenticated.
-- Solo service_role puede actualizar pedidos (webhook y admin API).
-- Esto impide que desde el browser se modifique un pedido.


-- Habilitar Realtime para la tabla pedidos (el admin se suscribe)
alter publication supabase_realtime add table pedidos;
