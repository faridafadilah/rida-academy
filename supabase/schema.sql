-- =========================================================
-- SCHEMA: Absen Rida Academy
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- =========================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- Tabel guru: admin daftarkan email di sini dulu sebelum guru bisa login
create table if not exists guru (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  nama text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function normalize_guru_email()
returns trigger as $$
begin
  new.email = lower(new.email);
  return new;
end;
$$ language plpgsql;

drop trigger if exists guru_email_lowercase on guru;
create trigger guru_email_lowercase
before insert or update on guru
for each row
execute function normalize_guru_email();

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.guru g
    where lower(g.email) = lower(auth.jwt() ->> 'email')
      and g.is_admin = true
  );
$$;

create table if not exists siswa (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  no_hp text,
  alamat text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists guru_profile (
  id uuid primary key default gen_random_uuid(),
  guru_id uuid not null unique references guru(id) on delete cascade,
  foto_url text,
  no_hp text,
  alamat text,
  tanggal_lahir date,
  tempat_lahir text,
  bio text,
  mengajar_mapel text[],
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists guru_siswa (
  id uuid primary key default gen_random_uuid(),
  guru_id uuid not null references guru(id) on delete cascade,
  siswa_id uuid not null references siswa(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guru_id, siswa_id)
);

create table if not exists absensi (
  id uuid primary key default gen_random_uuid(),
  guru_id uuid not null references guru(id) on delete cascade,
  siswa_id uuid references siswa(id) on delete set null,
  tanggal date,
  jam_mulai time,
  jam_selesai time,
  mata_pelajaran text not null,
  deskripsi_progress text not null,
  foto_url text,
  created_at timestamptz not null default now()
);

create table if not exists reschedule_izin (
  id uuid primary key default gen_random_uuid(),
  guru_id uuid not null references guru(id) on delete cascade,
  jenis text not null check (jenis in ('reschedule', 'izin')),
  tanggal_rencana date not null,
  tanggal_baru date,
  alasan text not null,
  catatan text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_guru_profile_updated on guru_profile;
create trigger trg_guru_profile_updated
before update on guru_profile
for each row
execute function set_updated_at();

drop trigger if exists trg_siswa_updated on siswa;
create trigger trg_siswa_updated
before update on siswa
for each row
execute function set_updated_at();

drop trigger if exists trg_guru_siswa_updated on guru_siswa;
create trigger trg_guru_siswa_updated
before update on guru_siswa
for each row
execute function set_updated_at();

alter table guru enable row level security;
alter table guru_profile enable row level security;
alter table siswa enable row level security;
alter table guru_siswa enable row level security;
alter table absensi enable row level security;
alter table reschedule_izin enable row level security;

create policy "guru bisa lihat data sendiri"
  on guru for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));

create policy "admin bisa lihat semua guru"
  on guru for select
  using (
    lower(email) = lower(auth.jwt() ->> 'email')
    or public.is_admin_user()
  );

create policy "admin bisa tambah guru"
  on guru for insert
  with check (public.is_admin_user());

create policy "guru lihat profil sendiri"
  on guru_profile for select
  using (
    guru_id = (
      select id from guru
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "admin lihat semua profil guru"
  on guru_profile for select
  using (public.is_admin_user());

create policy "guru update profil sendiri"
  on guru_profile for update
  using (
    guru_id = (
      select id from guru
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  )
  with check (
    guru_id = (
      select id from guru
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "guru insert profil sendiri"
  on guru_profile for insert
  with check (
    guru_id = (
      select id from guru
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "admin kelola profil guru"
  on guru_profile for insert
  with check (public.is_admin_user());

create policy "admin update profil guru"
  on guru_profile for update
  using (public.is_admin_user());

create policy "guru lihat siswa miliknya"
  on siswa for select
  using (
    exists (
      select 1 from guru_siswa gs
      where gs.siswa_id = siswa.id
        and gs.guru_id = (
          select id from guru
          where lower(email) = lower(auth.jwt() ->> 'email')
        )
        and gs.active = true
    )
    or public.is_admin_user()
  );

create policy "admin kelola siswa"
  on siswa for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

create policy "guru lihat relasi siswa sendiri"
  on guru_siswa for select
  using (
    guru_id = (
      select id from guru
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
    or public.is_admin_user()
  );

create policy "admin kelola relasi guru siswa"
  on guru_siswa for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

create policy "guru insert absensi sendiri"
  on absensi for insert
  with check (
    guru_id = (
      select id from guru
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
    and (
      siswa_id is null
      or exists (
        select 1 from guru_siswa gs
        where gs.siswa_id = absensi.siswa_id
          and gs.guru_id = absensi.guru_id
          and gs.active = true
      )
    )
  );

create policy "lihat absensi sendiri atau admin lihat semua"
  on absensi for select
  using (
    guru_id = (
      select id from guru
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
    or public.is_admin_user()
  );

create policy "guru insert reschedule izin sendiri"
  on reschedule_izin for insert
  with check (
    guru_id = (
      select id from guru
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "admin kelola reschedule izin"
  on reschedule_izin for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

create policy "lihat reschedule izin sendiri atau admin"
  on reschedule_izin for select
  using (
    guru_id = (
      select id from guru
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
    or public.is_admin_user()
  );

-- Storage setup notes
-- 1. Buat bucket "foto-absen" di Supabase Storage
-- 2. Aktifkan Public bucket = ON
-- 3. Jalankan query berikut di SQL Editor Storage:

-- drop policy if exists "guru bisa upload foto" on storage.objects;
-- drop policy if exists "semua orang bisa lihat foto" on storage.objects;
--
-- create policy "guru bisa upload foto"
--   on storage.objects for insert
--   to authenticated
--   with check (bucket_id = 'foto-absen');
--
-- create policy "semua orang bisa lihat foto"
--   on storage.objects for select
--   to public
--   using (bucket_id = 'foto-absen');

insert into guru (email, nama, is_admin)
values ('faridafadilah42807@gmail.com', 'Farida Fadilah', true)
on conflict (email) do update set is_admin = true;
