create table clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  id_number text not null,
  phone text not null,
  mortgage_amount numeric not null,
  property_value numeric not null,
  created_at timestamptz not null default now()
);

create table bank_log_entries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  bank_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);
