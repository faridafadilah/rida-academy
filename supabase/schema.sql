-- =========================================================
-- SCHEMA: Absen Rida Academy
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- =========================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- Tabel guru: admin daftarkan email di sini dulu sebelum guru bisa login
-- email dibuat case-insensitive agar Google login tidak gagal saat email dibuat dengan huruf besar/kecil berbeda.
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

-- Tabel absensi
create table if not exists absensi (
  id uuid primary key default gen_random_uuid(),
  guru_id uuid not null references guru(id) on delete cascade,
  tanggal date,
  jam_mulai time,
  jam_selesai time,
  mata_pelajaran text not null,
  deskripsi_progress text not null,
  foto_url text,
  created_at timestamptz not null default now()
);

alter table absensi add column if not exists tanggal date;
alter table absensi add column if not exists jam_mulai time;
alter table absensi add column if not exists jam_selesai time;

-- Aktifkan Row Level Security
alter table guru enable row level security;
alter table absensi enable row level security;

-- ---- Policies tabel guru ----

-- Guru bisa lihat data dirinya sendiri (buat cek "apakah aku terdaftar")
create policy "guru bisa lihat data sendiri"
  on guru for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- Admin bisa lihat semua data guru
create policy "admin bisa lihat semua guru"
  on guru for select
  using (
    lower(email) = lower(auth.jwt() ->> 'email')
    or public.is_admin_user()
  );

-- Admin bisa menambah guru baru
create policy "admin bisa tambah guru"
  on guru for insert
  with check (public.is_admin_user());

-- ---- Policies tabel absensi ----

-- Guru cuma bisa insert absensi untuk dirinya sendiri
create policy "guru insert absensi sendiri"
  on absensi for insert
  with check (
    guru_id = (
      select id from guru
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

-- Guru bisa lihat absensinya sendiri, admin bisa lihat semua
create policy "lihat absensi sendiri atau admin lihat semua"
  on absensi for select
  using (
    guru_id = (
      select id from guru
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
    or public.is_admin_user()
  );

-- =========================================================
-- STORAGE: bucket untuk foto dokumentasi
-- =========================================================
-- Bikin bucket "foto-absen" lewat Dashboard > Storage > New bucket
-- Set "Public bucket" = ON (biar foto bisa ditampilkan langsung)
-- Lalu jalankan policy di bawah ini:

-- Hapus policy lama jika sudah ada agar SQL bisa dijalankan ulang tanpa error.
drop policy if exists "guru bisa upload foto" on storage.objects;
drop policy if exists "semua orang bisa lihat foto" on storage.objects;

create policy "guru bisa upload foto"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'foto-absen');

create policy "semua orang bisa lihat foto"
  on storage.objects for select
  to public
  using (bucket_id = 'foto-absen');

-- =========================================================
-- LANGKAH TERAKHIR: Jadikan dirimu admin pertama
-- Ganti email di bawah dengan email Google kamu sendiri,
-- jalankan SETELAH kamu login pertama kali (atau insert manual duluan):
-- =========================================================
insert into guru (email, nama, is_admin)
values ('faridafadilah42807@gmail.com', 'Farida Fadilah', true)
on conflict (email) do update set is_admin = true;
