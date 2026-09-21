import { redirect } from "next/navigation";
import { createClient, getGuruProfile } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import IzinForm from "./IzinForm";

export default async function IzinPage() {
  const { user, guru } = await getGuruProfile();

  if (!user) redirect("/login");
  if (!guru) redirect("/login?error=unauthorized");

  const supabase = createClient();
  const { data: profile } = await supabase
    .from("guru_profile")
    .select("foto_url")
    .eq("guru_id", guru.id)
    .maybeSingle();

  const { data: permintaan } = await supabase
    .from("reschedule_izin")
    .select("*")
    .eq("guru_id", guru.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,185,66,0.12),transparent_20%),linear-gradient(180deg,#f6f9fb_0%,#f3efe8_100%)]">
      <NavBar
        nama={guru.nama}
        isAdmin={guru.is_admin}
        fotoUrl={profile?.foto_url || null}
      />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[28px] bg-gradient-to-r from-brand via-brand-dark to-slate-900 p-5 text-white shadow-premium">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-light">
            Permintaan
          </p>
          <h1 className="mt-2 text-2xl font-black">Reschedule / Izin</h1>
          <p className="mt-2 text-sm text-slate-200">
            Ajukan perubahan jadwal mengajar atau izin tidak bisa hadir untuk
            diproses admin.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <IzinForm guruId={guru.id} />

          <div className="rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-800">
              Riwayat permintaan
            </h2>

            {(!permintaan || permintaan.length === 0) && (
              <p className="mt-4 text-sm text-slate-500">
                Belum ada permintaan yang dibuat.
              </p>
            )}

            <div className="mt-4 space-y-3">
              {permintaan?.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-800">
                      {item.jenis === "reschedule" ? "Reschedule" : "Izin"}
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-amber-700">
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {item.tanggal_rencana
                      ? new Date(
                          `${item.tanggal_rencana}T00:00:00`,
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                    {item.tanggal_baru
                      ? ` → ${new Date(
                          `${item.tanggal_baru}T00:00:00`,
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}`
                      : ""}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.alasan}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
