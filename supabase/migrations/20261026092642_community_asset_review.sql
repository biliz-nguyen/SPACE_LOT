create table public.community_assets (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
 title text not null check(length(title) between 1 and 100), category text not null check(category in ('frame','fc','motor','esc','prop','battery','power','gps','receiver','custom')),
 manufacturer text not null default '' check(length(manufacturer)<=120), author text not null check(length(author) between 1 and 120),
 source text not null check(length(source) between 1 and 2000), license text not null check(license in ('CC0','CC-BY-4.0','CC-BY-SA-4.0')),
 description text not null default '' check(length(description)<=4000), dimensions_mm jsonb not null check(jsonb_typeof(dimensions_mm)='array' and jsonb_array_length(dimensions_mm)=3),
 mass_g numeric check(mass_g>=0 and mass_g<=100000), mechanical jsonb not null default '{}' check(jsonb_typeof(mechanical)='object'),
 electrical jsonb not null default '{}' check(jsonb_typeof(electrical)='object'), provenance jsonb not null default '{}' check(jsonb_typeof(provenance)='object'),
 storage_path text not null unique, sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'), bytes bigint not null check(bytes>0 and bytes<=41943040),
 triangles integer not null check(triangles>0 and triangles<=750000), status text not null default 'pending' check(status in ('pending','approved','rejected')),
 consent_at timestamptz not null default now(), created_at timestamptz not null default now(),
 reviewed_at timestamptz, verified_by uuid references auth.users(id), review_note text,
 check(storage_path=owner_id::text||'/'||id::text||'/model.glb'),
 check(status<>'approved' or (verified_by is not null and reviewed_at is not null))
);
create index community_assets_owner_idx on public.community_assets(owner_id,created_at desc);
create index community_assets_status_idx on public.community_assets(status,created_at desc);
create index community_assets_reviewer_idx on public.community_assets(verified_by);
create table public.model_requests (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
 title text not null check(length(title) between 1 and 100), details text not null check(length(details) between 1 and 4000),
 status text not null default 'requested' check(status in ('requested','in_progress','fulfilled','declined')),created_at timestamptz not null default now()
);
create index model_requests_owner_idx on public.model_requests(owner_id,created_at desc);
create table public.generation_jobs (
 id uuid primary key, owner_id uuid not null references auth.users(id), provider text not null default 'meshy', external_id text,
 prompt text not null check(length(prompt) between 3 and 600), status text not null default 'creating',
 day date not null default current_date, slot integer not null check(slot between 1 and 3),created_at timestamptz not null default now(),
 unique(owner_id,day,slot)
);
create index generation_jobs_owner_idx on public.generation_jobs(owner_id,created_at desc);
alter table public.community_assets enable row level security;
alter table public.model_requests enable row level security;
alter table public.generation_jobs enable row level security;
revoke all on public.community_assets,public.model_requests,public.generation_jobs from anon,authenticated;
grant select on public.community_assets to anon,authenticated;
grant select on public.model_requests,public.generation_jobs to authenticated;
grant all on public.community_assets,public.model_requests,public.generation_jobs to service_role;
create policy assets_read on public.community_assets for select to anon,authenticated using (
 status='approved' or owner_id=(select auth.uid()) or (select auth.jwt()->'app_metadata'->>'role')='space_lot_admin'
);
create policy requests_read on public.model_requests for select to authenticated using (
 owner_id=(select auth.uid()) or (select auth.jwt()->'app_metadata'->>'role')='space_lot_admin'
);
create policy jobs_read on public.generation_jobs for select to authenticated using (owner_id=(select auth.uid()));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('space-lot-models','space-lot-models',false,41943040,array['model/gltf-binary']) on conflict(id) do nothing;
-- Only Edge Functions with service credentials can write. An approved file is immutable to contributors.
create policy space_lot_model_read on storage.objects for select to anon,authenticated using (
 bucket_id='space-lot-models' and exists (
  select 1 from public.community_assets a where a.storage_path=name and (
   a.status='approved' or a.owner_id=(select auth.uid()) or (select auth.jwt()->'app_metadata'->>'role')='space_lot_admin'
  )
 )
);
