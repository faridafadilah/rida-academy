"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Guru = {
  id: string;
  nama: string;
  email: string;
  is_admin: boolean;
  created_at: string;
};

type Absensi = {
  id: string;
  tanggal: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;
  mata_pelajaran: string;
  deskripsi_progress: string;
  foto_url: string | null;
  created_at: string;
  guru: { nama: string } | null;
};

type Siswa = {
  id: string;
  nama: string;
  no_hp: string | null;
  alamat: string | null;
  status: string;
  created_at: string;
};

type GuruSiswa = {
  id: string;
  guru_id: string;
  siswa_id: string;
  active: boolean;
  guru: { nama: string } | null;
  siswa: { nama: string; status: string } | null;
};

type Permintaan = {
  id: string;
  guru_id: string;
  jenis: "reschedule" | "izin";
  tanggal_rencana: string | null;
  tanggal_baru: string | null;
  alasan: string;
  catatan: string | null;
  status: string;
  created_at: string;
  guru: { nama: string } | null;
};

export default function AdminPanel({
  daftarGuru,
  absensiTerbaru,
  daftarSiswa,
  guruSiswa,
  permintaan,
}: {
  daftarGuru: Guru[];
  absensiTerbaru: Absensi[];
  daftarSiswa: Siswa[];
  guruSiswa: GuruSiswa[];
  permintaan: Permintaan[];
}) {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [siswaNama, setSiswaNama] = useState("");
  const [siswaHp, setSiswaHp] = useState("");
  const [siswaAlamat, setSiswaAlamat] = useState("");
  const [siswaStatus, setSiswaStatus] = useState("active");
  const [guruPilihan, setGuruPilihan] = useState("");
  const [linkActive, setLinkActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleTambahGuru = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!nama.trim() || !email.trim()) {
      setErrorMsg("Nama dan email wajib diisi.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("guru").insert({
      nama: nama.trim(),
      email: email.trim().toLowerCase(),
    });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setNama("");
    setEmail("");
    router.refresh();
  };

  const handleTambahSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!siswaNama.trim()) {
      setErrorMsg("Nama siswa wajib diisi.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { data: siswaBaru, error: insertSiswaError } = await supabase
        .from("siswa")
        .insert({
          nama: siswaNama.trim(),
          no_hp: siswaHp.trim() || null,
          alamat: siswaAlamat.trim() || null,
          status: siswaStatus,
        })
        .select()
        .single();

      if (insertSiswaError) throw insertSiswaError;

      if (guruPilihan) {
        const { error: linkError } = await supabase.from("guru_siswa").insert({
          guru_id: guruPilihan,
          siswa_id: siswaBaru.id,
          active: linkActive,
        });

        if (linkError) throw linkError;
      }

      setSiswaNama("");
      setSiswaHp("");
      setSiswaAlamat("");
      setSiswaStatus("active");
      setGuruPilihan("");
      setLinkActive(true);
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.message || "Gagal menyimpan data siswa.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusPermintaan = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    setActionLoadingId(id);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("reschedule_izin")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.message || "Gagal mengubah status permintaan.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Daftarkan Guru Baru</h2>
        {errorMsg && (
          <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}
        <form
          onSubmit={handleTambahGuru}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama guru"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Google guru"
            type="email"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
          />
          <button
            disabled={loading}
            className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Tambah"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Tambah Siswa Baru</h2>
        <form
          onSubmit={handleTambahSiswa}
          className="grid gap-3 md:grid-cols-2"
        >
          <input
            value={siswaNama}
            onChange={(e) => setSiswaNama(e.target.value)}
            placeholder="Nama siswa"
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            value={siswaHp}
            onChange={(e) => setSiswaHp(e.target.value)}
            placeholder="No HP"
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            value={siswaAlamat}
            onChange={(e) => setSiswaAlamat(e.target.value)}
            placeholder="Alamat"
            className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2"
          />
          <select
            value={siswaStatus}
            onChange={(e) => setSiswaStatus(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={guruPilihan}
            onChange={(e) => setGuruPilihan(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Pilih guru (opsional)</option>
            {daftarGuru.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nama}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 md:col-span-2">
            <input
              type="checkbox"
              checked={linkActive}
              onChange={(e) => setLinkActive(e.target.checked)}
            />
            <span className="text-sm text-slate-700">
              Siswa aktif untuk guru terpilih
            </span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-50 md:col-span-2"
          >
            {loading ? "Menyimpan..." : "Simpan siswa"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Daftar Guru Terdaftar</h2>
        <div className="space-y-2">
          {daftarGuru.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between border-b border-slate-100 py-2 text-sm"
            >
              <div>
                <div className="font-medium">{g.nama}</div>
                <div className="text-slate-500">{g.email}</div>
              </div>
              {g.is_admin && (
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-brand">
                  Admin
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Daftar Siswa</h2>
        <div className="space-y-2">
          {daftarSiswa.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between border-b border-slate-100 py-2 text-sm"
            >
              <div>
                <div className="font-medium">{s.nama}</div>
                {s.no_hp && <div className="text-slate-500">{s.no_hp}</div>}
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  s.status === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {s.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Hubungan Guru - Siswa</h2>
        <div className="space-y-2">
          {guruSiswa.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-slate-100 py-2 text-sm"
            >
              <div>
                <div className="font-medium">
                  {item.guru?.nama} → {item.siswa?.nama}
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  item.active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {item.active ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Permintaan Reschedule / Izin</h2>
        <div className="space-y-4">
          {permintaan.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium text-slate-800">
                    {item.guru?.nama} —{" "}
                    {item.jenis === "reschedule" ? "Reschedule" : "Izin"}
                  </div>
                  <div className="text-xs text-slate-500">
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
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${
                    item.status === "approved"
                      ? "bg-emerald-50 text-emerald-700"
                      : item.status === "rejected"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-600">{item.alasan}</p>
              {item.catatan && (
                <p className="mt-2 text-xs text-slate-500">
                  Catatan: {item.catatan}
                </p>
              )}

              {item.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusPermintaan(item.id, "approved")}
                    disabled={actionLoadingId === item.id}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {actionLoadingId === item.id ? "Memproses..." : "Setujui"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusPermintaan(item.id, "rejected")}
                    disabled={actionLoadingId === item.id}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {actionLoadingId === item.id ? "Memproses..." : "Tolak"}
                  </button>
                </div>
              )}
            </div>
          ))}
          {permintaan.length === 0 && (
            <p className="text-sm text-slate-500">
              Belum ada permintaan reschedule atau izin.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Absensi Terbaru (Semua Guru)</h2>
        <div className="space-y-4">
          {absensiTerbaru.map((a) => (
            <div key={a.id} className="border-b border-slate-100 pb-3 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium">
                  {a.guru?.nama} — {a.mata_pelajaran}
                </span>
                <span className="text-xs text-slate-400">
                  {a.tanggal
                    ? new Date(`${a.tanggal}T00:00:00`).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : "Tanggal belum diisi"}
                  {a.jam_mulai && a.jam_selesai
                    ? ` • ${a.jam_mulai} - ${a.jam_selesai}`
                    : ""}
                </span>
              </div>
              <p className="mt-1 text-slate-600">{a.deskripsi_progress}</p>
            </div>
          ))}
          {absensiTerbaru.length === 0 && (
            <p className="text-sm text-slate-500">Belum ada absensi.</p>
          )}
        </div>
      </section>
    </div>
  );
}
