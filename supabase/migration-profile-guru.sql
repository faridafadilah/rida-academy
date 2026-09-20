-- =========================================================
-- MIGRATION: PROFILES GURU + SISWA + RELASI GURU-SISWA
-- Jalankan di Supabase SQL Editor
-- =========================================================

create extension if not exists "pgcrypto";

-- =========================
-- 1. Tabel profil guru
-- =========================
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

-- =========================
-- 2. Tabel siswa
-- =========================
create table if not exists siswa (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  no_hp text,
  alamat text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- 3. Tabel relasi guru-siswa
-- =========================
create table if not exists guru_siswa (
  id uuid primary key default gen_random_uuid(),
  guru_id uuid not null references guru(id) on delete cascade,
  siswa_id uuid not null references siswa(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guru_id, siswa_id)
);

-- =========================
-- 4. Trigger untuk update timestamp
-- =========================
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

-- =========================
-- 5. RLS untuk profil guru
-- =========================
alter table guru_profile enable row level security;
alter table siswa enable row level security;
alter table guru_siswa enable row level security;

-- Guru bisa lihat profil dirinya sendiri
create policy "guru lihat profil sendiri"
  on guru_profile for select
  using (
    guru_id = (
      select id from guru
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

-- Admin bisa lihat semua profil guru
create policy "admin lihat semua profil guru"
  on guru_profile for select
  using (public.is_admin_user());

-- Guru bisa update profil sendiri
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

-- Guru bisa insert profil sendiri
create policy "guru insert profil sendiri"
  on guru_profile for insert
  with check (
    guru_id = (
      select id from guru
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

-- Admin bisa insert/update profil guru
create policy "admin kelola profil guru"
  on guru_profile for insert
  with check (public.is_admin_user());

create policy "admin update profil guru"
  on guru_profile for update
  using (public.is_admin_user());

-- =========================
-- 6. RLS untuk siswa
-- =========================
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

-- =========================
-- 7. RLS untuk guru_siswa
-- =========================
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

-- =========================
-- 8. Sample data admin
-- =========================
-- Ganti email sesuai akun admin yang ingin diberikan akses.
-- insert into guru (email, nama, is_admin)
-- values ('your-google-email@gmail.com', 'Admin Nama', true)
-- on conflict (email) do update set is_admin = true;
