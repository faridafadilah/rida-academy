import { redirect } from "next/navigation";
import { createClient, getGuruProfile } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import AdminPanel from "./AdminPanel";

export default async function AdminPage() {
  const { user, guru } = await getGuruProfile();
  if (!user) redirect("/login");
  if (!guru) redirect("/login?error=unauthorized");
  if (!guru.is_admin) redirect("/absen");

  const supabase = createClient();
  const { data: daftarGuru, error: daftarGuruError } = await supabase
    .from("guru")
    .select("*")
    .order("created_at", { ascending: false });

  console.log("[admin page] daftar guru:", { daftarGuru, daftarGuruError });

  const { data: absensiTerbaru, error: absensiError } = await supabase
    .from("absensi")
    .select("*, guru(nama)")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: daftarSiswa, error: daftarSiswaError } = await supabase
    .from("siswa")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: guruSiswa, error: guruSiswaError } = await supabase
    .from("guru_siswa")
    .select("*, guru(nama), siswa(nama, status)")
    .order("created_at", { ascending: false });

  const { data: permintaan, error: permintaanError } = await supabase
    .from("reschedule_izin")
    .select("*, guru(nama)")
    .order("created_at", { ascending: false });

  console.log("[admin page] absensi terbaru:", {
    absensiTerbaru,
    absensiError,
  });
  console.log("[admin page] siswa:", { daftarSiswa, daftarSiswaError });
  console.log("[admin page] guru siswa:", { guruSiswa, guruSiswaError });
  console.log("[admin page] reschedule izin:", {
    permintaan,
    permintaanError,
  });

  const { data: profile } = await supabase
    .from("guru_profile")
    .select("foto_url")
    .eq("guru_id", guru.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,185,66,0.08),transparent_20%),linear-gradient(180deg,#f6f9fb_0%,#f3efe8_100%)]">
      <NavBar
        nama={guru.nama}
        isAdmin={guru.is_admin}
        fotoUrl={profile?.foto_url || null}
      />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[28px] bg-gradient-to-r from-brand via-brand-dark to-slate-900 p-5 text-white shadow-premium">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-light">
            Dashboard admin
          </p>
          <h1 className="mt-2 text-2xl font-black">Panel Admin</h1>
          <p className="mt-2 text-sm text-slate-200">
            Kelola guru, siswa, dan pantau semua absensi mengajar.
          </p>
        </div>

        <AdminPanel
          daftarGuru={daftarGuru || []}
          absensiTerbaru={absensiTerbaru || []}
          daftarSiswa={daftarSiswa || []}
          guruSiswa={guruSiswa || []}
          permintaan={permintaan || []}
        />
      </main>
    </div>
  );
}
