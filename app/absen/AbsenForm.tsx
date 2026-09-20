"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DAFTAR_MAPEL = [
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "IPA",
  "IPS",
  "Mengaji / Al-Qur'an",
  "Calistung",
  "Akhlak / Budi Pekerti",
];

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AbsenForm({ guruId }: { guruId: string }) {
  const router = useRouter();
  const [tanggal, setTanggal] = useState(getTodayString());
  const [jamMulai, setJamMulai] = useState("08:00");
  const [jamSelesai, setJamSelesai] = useState("09:00");
  const [mapel, setMapel] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!tanggal || !jamMulai || !jamSelesai) {
      setErrorMsg("Tanggal dan jam mengajar wajib diisi.");
      return;
    }

    if (jamSelesai <= jamMulai) {
      setErrorMsg("Jam selesai harus lebih besar dari jam mulai.");
      return;
    }

    if (!mapel.trim() || !deskripsi.trim()) {
      setErrorMsg("Mata pelajaran dan deskripsi progress wajib diisi.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      let fotoUrl: string | null = null;

      if (foto) {
        const ext = foto.name.split(".").pop();
        const fileName = `${guruId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("foto-absen")
          .upload(fileName, foto);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from("foto-absen")
          .getPublicUrl(fileName);

        fotoUrl = publicUrl.publicUrl;
      }

      const { error: insertError } = await supabase.from("absensi").insert({
        guru_id: guruId,
        tanggal,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        mata_pelajaran: mapel.trim(),
        deskripsi_progress: deskripsi.trim(),
        foto_url: fotoUrl,
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setTanggal(getTodayString());
      setJamMulai("08:00");
      setJamSelesai("09:00");
      setMapel("");
      setDeskripsi("");
      setFoto(null);
      setPreview(null);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-7"
    >
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Absen berhasil disimpan. Terima kasih!
        </div>
      )}
      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      <div className="rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-amber-50 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
          Catatan Mengajar
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Isi detail kelas hari ini agar data absensi lebih akurat dan mudah
          dipantau.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Tanggal absen
          </label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Mata pelajaran
          </label>
          <input
            list="daftar-mapel"
            value={mapel}
            onChange={(e) => setMapel(e.target.value)}
            placeholder="Contoh: Matematika"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
          <datalist id="daftar-mapel">
            {DAFTAR_MAPEL.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Jam mulai
          </label>
          <input
            type="time"
            value={jamMulai}
            onChange={(e) => setJamMulai(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Jam selesai
          </label>
          <input
            type="time"
            value={jamSelesai}
            onChange={(e) => setJamSelesai(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Deskripsi progress anak
        </label>
        <textarea
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          rows={5}
          placeholder="Ceritakan progress belajar siswa hari ini, materi yang dibahas, dan hasil pembelajaran..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Foto dokumentasi
        </label>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFotoChange}
            className="w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white file:shadow-sm"
          />
        </div>
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mt-4 h-48 w-full rounded-2xl object-cover shadow-sm"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-base font-semibold text-white shadow-[0_14px_30px_rgba(99,102,241,0.35)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Menyimpan absen..." : "Simpan absen"}
      </button>
    </form>
  );
}
