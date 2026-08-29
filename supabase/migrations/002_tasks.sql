create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  topic_id uuid references topics(id) on delete set null,
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table tasks enable row level security;

create policy "auth full access" on tasks
  for all to authenticated using (true) with check (true);
