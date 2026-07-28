-- Pegá TODO esto en Supabase → SQL Editor → New query → Run

create table products (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text default 'maple',
  unidades_por_maple int default 30,
  precio_venta numeric default 0,
  costo_actual numeric default 0,
  activo boolean default true,
  created_at timestamptz default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  tipo text default 'minorista',
  created_at timestamptz default now()
);

create table sales (
  id uuid primary key default gen_random_uuid(),
  fecha timestamptz default now(),
  cliente_id uuid references clients(id),
  metodo_pago text default 'efectivo',
  total numeric default 0,
  ganancia numeric default 0,
  observaciones text,
  created_at timestamptz default now()
);

create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references sales(id) on delete cascade,
  product_id uuid references products(id),
  cantidad int not null,
  precio_unit numeric,
  costo_unit numeric,
  subtotal numeric
);

create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  tipo text not null,
  cantidad int not null,
  motivo text,
  fecha timestamptz default now()
);
