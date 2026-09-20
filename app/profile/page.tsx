import { redirect } from "next/navigation";
import { createClient, getGuruProfile } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import ProfileEditor from "./ProfileEditor";

export default async function GuruProfilePage() {
  const { user, guru } = await getGuruProfile();

  if (!user) redirect("/login");
  if (!guru) redirect("/login?error=unauthorized");

  const supabase = createClient();

  const { data: profile } = await supabase
    .from("guru_profile")
    .select("*")
    .eq("guru_id", guru.id)
    .maybeSingle();

  const { data: siswaList } = await supabase
    .from("guru_siswa")
    .select("*, siswa(*)")
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
            Profil guru
          </p>
          <h1 className="mt-2 text-2xl font-black">{guru.nama}</h1>
          <p className="mt-2 text-sm text-slate-200">
            Informasi personal, pengaturan profil, dan daftar siswa yang diajar.
          </p>
        </div>

        <ProfileEditor
          guru={guru}
          initialProfile={profile || null}
          siswaList={siswaList || []}
        />
      </main>
    </div>
  );
}
