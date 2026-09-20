import { redirect } from "next/navigation";
import { createClient, getGuruProfile } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";

export default async function RiwayatPage() {
  const { user, guru } = await getGuruProfile();
  if (!user) redirect("/login");
  if (!guru) redirect("/login?error=unauthorized");

  const supabase = createClient();
  const { data: profile } = await supabase
    .from("guru_profile")
    .select("foto_url")
    .eq("guru_id", guru.id)
    .maybeSingle();

  const { data: absensi } = await supabase
    .from("absensi")
    .select("*")
    .eq("guru_id", guru.id)
    .order("tanggal", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div>
      <NavBar
        nama={guru.nama}
        isAdmin={guru.is_admin}
        fotoUrl={profile?.foto_url || null}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 rounded-[28px] bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-800 p-5 text-white shadow-[0_20px_50px_rgba(79,70,229,0.35)]">
          <p className="text-xs uppercase tracking-[0.24em] text-indigo-200">
            Riwayat mengajar
          </p>
          <h1 className="mt-2 text-2xl font-bold">Absen Saya</h1>
          <p className="mt-1 text-sm text-indigo-100">
            {guru.nama} • catatan semua sesi mengajar
          </p>
        </div>

        {(!absensi || absensi.length === 0) && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Belum ada data absen.
          </div>
        )}

        <div className="space-y-4">
          {absensi?.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {item.tanggal
                      ? new Date(`${item.tanggal}T00:00:00`).toLocaleDateString(
                          "id-ID",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "Tanggal belum terisi"}
                  </div>
                  <div className="mt-1 font-semibold text-slate-800">
                    {item.mata_pelajaran}
                  </div>
                </div>
                <div className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                  {item.jam_mulai || "--:--"} - {item.jam_selesai || "--:--"}
                </div>
              </div>

              <div className="p-4">
                <p className="text-sm leading-6 text-slate-700">
                  {item.deskripsi_progress}
                </p>

                {item.foto_url && (
                  <div className="mt-4 overflow-hidden rounded-2xl">
                    <img
                      src={item.foto_url}
                      alt="dokumentasi"
                      className="h-60 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
