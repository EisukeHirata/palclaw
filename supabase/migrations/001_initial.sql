-- deployments table
create table if not exists public.deployments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null check (channel in ('telegram', 'whatsapp')),
  model text not null check (model in ('claude', 'gpt', 'gemini')),
  render_service_id text,
  render_service_url text,
  openclaw_token text,
  status text not null default 'pending' check (status in ('pending', 'deploying', 'running', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- agents table
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deployment_id uuid not null references public.deployments(id) on delete cascade,
  name text not null,
  personality text not null default 'friendly' check (personality in ('friendly', 'strict', 'motivational')),
  goal text,
  config jsonb default '{}',
  created_at timestamptz not null default now()
);

-- RLS
alter table public.deployments enable row level security;
alter table public.agents enable row level security;

-- deployments policies
create policy "Users can view own deployments"
  on public.deployments for select
  using (auth.uid() = user_id);

create policy "Users can insert own deployments"
  on public.deployments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own deployments"
  on public.deployments for update
  using (auth.uid() = user_id);

create policy "Users can delete own deployments"
  on public.deployments for delete
  using (auth.uid() = user_id);

-- agents policies
create policy "Users can view own agents"
  on public.agents for select
  using (auth.uid() = user_id);

create policy "Users can insert own agents"
  on public.agents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own agents"
  on public.agents for update
  using (auth.uid() = user_id);

create policy "Users can delete own agents"
  on public.agents for delete
  using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_deployments_updated
  before update on public.deployments
  for each row execute function public.handle_updated_at();
