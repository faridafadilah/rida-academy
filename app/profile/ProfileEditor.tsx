"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Guru = {
  id: string;
  nama: string;
  email: string;
  is_admin: boolean;
};

type Profile = {
  id?: string;
  guru_id: string;
  foto_url?: string | null;
  no_hp?: string | null;
  alamat?: string | null;
  tanggal_lahir?: string | null;
  tempat_lahir?: string | null;
  bio?: string | null;
  mengajar_mapel?: string[] | null;
  status?: string | null;
};

type AssignedSiswa = {
  id: string;
  siswa?: {
    id: string;
    nama: string;
    status?: string | null;
  } | null;
  active?: boolean | null;
};

export default function ProfileEditor({
  guru,
  initialProfile,
  siswaList,
}: {
  guru: Guru;
  initialProfile: Profile | null;
  siswaList: AssignedSiswa[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: guru.nama,
    no_hp: initialProfile?.no_hp || "",
    alamat: initialProfile?.alamat || "",
    tanggal_lahir: initialProfile?.tanggal_lahir || "",
    tempat_lahir: initialProfile?.tempat_lahir || "",
    bio: initialProfile?.bio || "",
    foto_url: initialProfile?.foto_url || "",
    mengajar_mapel: (initialProfile?.mengajar_mapel || []).join(", "),
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${guru.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("foto-absen")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("foto-absen")
        .getPublicUrl(fileName);

      setForm((prev) => ({ ...prev, foto_url: publicData.publicUrl }));
      setMessage("Foto profil berhasil diupload.");
    } catch (error: any) {
      setMessage(error.message || "Gagal upload foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();
      const payload = {
        guru_id: guru.id,
        foto_url: form.foto_url || null,
        no_hp: form.no_hp.trim() || null,
        alamat: form.alamat.trim() || null,
        tanggal_lahir: form.tanggal_lahir || null,
        tempat_lahir: form.tempat_lahir.trim() || null,
        bio: form.bio.trim() || null,
        mengajar_mapel: form.mengajar_mapel
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        status: "active",
      };

      if (initialProfile?.id) {
        const { error } = await supabase
          .from("guru_profile")
          .update(payload)
          .eq("id", initialProfile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("guru_profile").insert(payload);
        if (error) throw error;
      }

      setMessage("Profil berhasil disimpan.");
      router.refresh();
    } catch (error: any) {
      setMessage(error.message || "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSave}
        className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Edit Profil Guru
            </h2>
            <p className="text-sm text-slate-500">
              Data profil akan tampil di halaman profil guru.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan profil"}
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nama guru
            </label>
            <input
              value={form.nama}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-slate-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              No HP
            </label>
            <input
              value={form.no_hp}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, no_hp: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700"
              placeholder="0812..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tempat lahir
            </label>
            <input
              value={form.tempat_lahir}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, tempat_lahir: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700"
              placeholder="Jakarta"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tanggal lahir
            </label>
            <input
              type="date"
              value={form.tanggal_lahir}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, tanggal_lahir: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Alamat
            </label>
            <textarea
              value={form.alamat}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, alamat: e.target.value }))
              }
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700"
              placeholder="Alamat lengkap"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Mengajar mapel
            </label>
            <input
              value={form.mengajar_mapel}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, mengajar_mapel: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700"
              placeholder="Matematika, Bahasa Indonesia, IPA"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Bio / deskripsi guru
            </label>
            <textarea
              value={form.bio}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700"
              placeholder="Tuliskan pengalaman mengajar, pendekatan, dan keahlian..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Foto profil
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />
            {form.foto_url && (
              <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.foto_url}
                  alt="foto profil guru"
                  className="h-52 w-full object-cover"
                />
              </div>
            )}
            {uploading && (
              <div className="mt-2 text-sm text-slate-500">
                Mengupload foto...
              </div>
            )}
          </div>
        </div>
      </form>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">
          Daftar siswa yang diajar
        </h3>
        {(!siswaList || siswaList.length === 0) && (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Belum ada siswa yang ditetapkan untuk guru ini.
          </div>
        )}

        <div className="mt-4 space-y-3">
          {siswaList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <div>
                <div className="font-semibold text-slate-800">
                  {item.siswa?.nama}
                </div>
                <div className="text-xs text-slate-500">
                  {item.siswa?.status || "active"}
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  item.active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {item.active ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
