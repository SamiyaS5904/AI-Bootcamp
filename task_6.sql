-- ========== 1. CREATE TABLES ==========

create table outlets (
  id    int generated always as identity primary key,
  name  text not null,
  city  text
);

create table vendors (
  id           int generated always as identity primary key,
  name         text not null,
  category     text not null,
  whatsapp     text not null,
  is_approved  boolean default true
);

create table items (
  id         int generated always as identity primary key,
  name       text not null,
  unit       text not null,
  vendor_id  int references vendors(id)
);

create table stock (
  outlet_id  int references outlets(id),
  item_id    int references items(id),
  quantity   numeric not null default 0,
  daily_use  numeric not null default 0,
  primary key (outlet_id, item_id)
);

create table orders (
  id          int generated always as identity primary key,
  outlet_id   int references outlets(id),
  vendor_id   int references vendors(id),
  item_id     int references items(id),
  quantity    numeric not null,
  price       numeric not null,
  total       numeric generated always as (quantity * price) stored,
  status      text default 'pending'
              check (status in ('pending', 'approved', 'sent', 'delivered')),
  created_at  timestamptz default now()
);

create table employees (
  id         int generated always as identity primary key,
  outlet_id  int references outlets(id),
  name       text not null,
  role       text,
  salary     numeric not null
);

create table attendance (
  id           int generated always as identity primary key,
  employee_id  int references employees(id),
  work_date    date not null,
  status       text not null check (status in ('present', 'half_day', 'absent')),
  unique (employee_id, work_date)
);


-- ========== 2. INSERT VALUES ==========

insert into outlets (name, city) values
  ('Model Town',    'Ludhiana'),
  ('Sarabha Nagar', 'Ludhiana');

insert into vendors (name, category, whatsapp, is_approved) values
  ('Sharma Traders',     'Raw material', '+919800000001', true),
  ('Fresh Farm Veggies', 'Raw material', '+919800000002', true),
  ('PackRight Supplies', 'Packaging',    '+919800000003', true),
  ('Punjab Gas Agency',  'Gas',          '+919800000004', true),
  ('Bright Electricals', 'Electricity',  '+919800000005', true),
  ('New Steel Utensils', 'Utensils',     '+919800000006', false);

insert into items (name, unit, vendor_id) values
  ('Maida',        'kg',       1),
  ('Paneer',       'kg',       1),
  ('Onion',        'kg',       2),
  ('Momo box',     'packet',   3),
  ('LPG cylinder', 'cylinder', 4);

insert into stock (outlet_id, item_id, quantity, daily_use) values
  (1, 1,  40, 10),
  (1, 2,  12,  4),
  (1, 3,  60,  8),
  (1, 4,  30, 20),
  (1, 5,   4,  1),
  (2, 1,  70,  6),
  (2, 2,  20,  2),
  (2, 3,  35,  5);

insert into orders (outlet_id, vendor_id, item_id, quantity, price, status) values
  (1, 1, 1,  50, 38, 'sent'),
  (1, 3, 4, 500, 14, 'pending'),
  (2, 2, 3,  40, 30, 'delivered');

insert into employees (outlet_id, name, role, salary) values
  (1, 'Ravi Kumar',   'Head cook', 24000),
  (1, 'Simran Kaur',  'Cashier',   15000),
  (2, 'Pooja Sharma', 'Manager',   28000);

insert into attendance (employee_id, work_date, status) values
  (1, '2026-09-01', 'present'), (1, '2026-09-02', 'present'), (1, '2026-09-03', 'present'),
  (1, '2026-09-04', 'absent'),  (1, '2026-09-05', 'present'), (1, '2026-09-06', 'present'),
  (1, '2026-09-07', 'present'),
  (2, '2026-09-01', 'present'), (2, '2026-09-02', 'half_day'),(2, '2026-09-03', 'present'),
  (2, '2026-09-04', 'present'), (2, '2026-09-05', 'present'), (2, '2026-09-06', 'half_day'),
  (2, '2026-09-07', 'present'),
  (3, '2026-09-01', 'present'), (3, '2026-09-02', 'present'), (3, '2026-09-03', 'present'),
  (3, '2026-09-04', 'present'), (3, '2026-09-05', 'present'), (3, '2026-09-06', 'present'),
  (3, '2026-09-07', 'present');


-- ========== 3. VIEW ALL TABLES ==========

select t.table_name as "Table",
       (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', t.table_name), false, true, '')))[1]::text::int as "Rows",
       string_agg(c.column_name, ', ' order by c.ordinal_position) as "Columns"
from information_schema.tables t
join information_schema.columns c
  on c.table_schema = t.table_schema and c.table_name = t.table_name
where t.table_schema = 'public' and t.table_type = 'BASE TABLE'
group by t.table_name
order by t.table_name;
