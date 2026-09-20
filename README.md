# Absen Rida Academy

Sistem absen guru: login pakai Google, isi mata pelajaran + deskripsi progress anak + foto dokumentasi. Admin mendaftarkan email guru terlebih dahulu sebelum guru bisa login.

## Tech stack
- **Next.js 14** (App Router)
- **Supabase** — database (Postgres), Auth (Google login), Storage (foto)
- **Vercel** — hosting gratis
- **Tailwind CSS** — styling

---

## LANGKAH SETUP (ikuti berurutan)

### 1. Buat project Supabase
1. Daftar di https://supabase.com (gratis, pakai GitHub/Google)
2. Klik **New Project**, kasih nama `absen-rida-academy`, pilih region **Southeast Asia (Singapore)**, buat password database (simpan baik-baik)
3. Tunggu sampai project selesai dibuat (~2 menit)

### 2. Jalankan schema database
1. Di dashboard Supabase, buka menu **SQL Editor**
2. Copy seluruh isi file `supabase/schema.sql` di project ini, paste, lalu **Run**
3. Ini akan membuat tabel `guru`, `absensi`, dan aturan keamanan (RLS)

### 3. Buat Storage bucket untuk foto
1. Buka menu **Storage** di Supabase
2. Klik **New bucket**, nama: `foto-absen`
3. Aktifkan toggle **Public bucket** (supaya foto bisa ditampilkan)
4. Policy upload/lihat foto sudah otomatis dibuat lewat `schema.sql` di langkah 2

### 4. Aktifkan Login Google
1. Di Supabase, buka **Authentication > Providers**
2. Aktifkan **Google**
3. Kamu butuh **Client ID** & **Client Secret** dari Google Cloud Console:
   - Buka https://console.cloud.google.com/apis/credentials
   - Buat **OAuth Client ID** tipe **Web application**
   - Di **Authorized redirect URIs**, isi dengan URL yang muncul di halaman Supabase Google provider (bentuknya seperti `https://xxxx.supabase.co/auth/v1/callback`)
   - Copy Client ID & Secret, paste ke Supabase, klik **Save**
4. Di **Authentication > URL Configuration**, isi **Site URL** dengan URL Vercel kamu nanti (langkah 7), dan tambahkan juga `http://localhost:3000` di **Redirect URLs** untuk testing lokal

### 5. Daftarkan dirimu sebagai admin pertama
Di **SQL Editor** Supabase, jalankan (ganti email dengan email Google kamu):
```sql
insert into guru (email, nama, is_admin)
values ('email-kamu@gmail.com', 'Nama Kamu', true)
on conflict (email) do update set is_admin = true;
```

### 6. Ambil API keys
Buka **Project Settings > API**, catat:
- **Project URL**
- **anon public key**

Buat file `.env.local` (copy dari `.env.local.example`) dan isi dengan keduanya.

### 7. Coba jalankan di lokal (opsional tapi disarankan)
```bash
npm install
npm run dev
```
Buka http://localhost:3000, coba login dengan Google pakai email admin yang tadi didaftarkan.

### 8. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit - Absen Rida Academy"
```
Buat repo baru di https://github.com/new, lalu:
```bash
git remote add origin <url-repo-kamu>
git branch -M main
git push -u origin main
```

### 9. Deploy ke Vercel (gratis)
1. Daftar di https://vercel.com pakai akun GitHub
2. Klik **Add New > Project**, pilih repo `absen-rida-academy`
3. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klik **Deploy**
5. Setelah selesai, kamu akan dapat URL seperti `https://absen-rida-academy.vercel.app`

### 10. Update Redirect URL di Supabase
Setelah dapat URL Vercel, kembali ke **Authentication > URL Configuration** di Supabase:
- **Site URL** → isi dengan URL Vercel kamu
- **Redirect URLs** → tambahkan `https://absen-rida-academy.vercel.app/**`

Juga tambahkan URL Vercel itu ke **Authorized redirect URIs** di Google Cloud Console (langkah 4) jika diperlukan.

---

## Cara pakai
- **Admin**: buka `/admin` untuk mendaftarkan email guru baru dan lihat rekap absensi semua guru
- **Guru**: login dengan Google → langsung diarahkan ke form absen (`/absen`) → isi mapel, deskripsi progress, upload foto → simpan. Riwayat bisa dilihat di `/riwayat`

## Struktur folder penting
```
app/
  login/          -> halaman login Google
  auth/callback/   -> proses cek & validasi email guru
  absen/           -> form absen harian
  riwayat/         -> riwayat absen guru
  admin/           -> panel admin (kelola guru + rekap)
lib/supabase/      -> koneksi ke Supabase (client & server)
supabase/schema.sql -> skrip database, jalankan di Supabase SQL Editor
```

## Catatan
- Semua di atas **100% gratis** untuk skala sekolah kecil-menengah (Supabase free tier: 500MB database + 1GB storage; Vercel free tier: cukup untuk trafik normal)
- Guru yang emailnya belum didaftarkan admin akan ditolak otomatis saat mencoba login
