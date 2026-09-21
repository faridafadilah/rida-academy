"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function IzinForm({ guruId }: { guruId: string }) {
  const [jenis, setJenis] = useState<"reschedule" | "izin">("reschedule");
  const [tanggalRencana, setTanggalRencana] = useState(getTodayString());
  const [tanggalBaru, setTanggalBaru] = useState("");
  const [alasan, setAlasan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);

    if (!tanggalRencana) {
      setErrorMsg("Tanggal rencana wajib diisi.");
      return;
    }

    if (!alasan.trim()) {
      setErrorMsg("Alasan wajib diisi.");
      return;
    }

    if (jenis === "reschedule" && !tanggalBaru) {
      setErrorMsg("Tanggal baru wajib diisi untuk reschedule.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from("reschedule_izin").insert({
        guru_id: guruId,
        jenis,
        tanggal_rencana: tanggalRencana,
        tanggal_baru: jenis === "reschedule" ? tanggalBaru : null,
        alasan: alasan.trim(),
        catatan: catatan.trim() || null,
      });

      if (error) throw error;

      setSuccess(true);
      setJenis("reschedule");
      setTanggalRencana(getTodayString());
      setTanggalBaru("");
      setAlasan("");
      setCatatan("");
    } catch (err: any) {
      setErrorMsg(
        err.message || "Terjadi kesalahan saat menyimpan permintaan.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-7"
    >
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Permintaan {jenis === "reschedule" ? "reschedule" : "izin"} berhasil
          dikirim.
        </div>
      )}
      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Jenis permintaan
          </label>
          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value as "reschedule" | "izin")}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          >
            <option value="reschedule">Reschedule</option>
            <option value="izin">Izin tidak bisa hadir</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Tanggal rencana
          </label>
          <input
            type="date"
            value={tanggalRencana}
            onChange={(e) => setTanggalRencana(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      {jenis === "reschedule" && (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Tanggal baru
          </label>
          <input
            type="date"
            value={tanggalBaru}
            onChange={(e) => setTanggalBaru(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Alasan
        </label>
        <textarea
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          rows={4}
          placeholder={
            jenis === "reschedule"
              ? "Jelaskan alasan mengajukan reschedule..."
              : "Jelaskan alasan tidak bisa hadir..."
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Catatan tambahan (opsional)
        </label>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          rows={3}
          placeholder="Informasi tambahan untuk admin..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-base font-semibold text-white shadow-[0_14px_30px_rgba(99,102,241,0.35)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Mengirim..."
          : jenis === "reschedule"
            ? "Ajukan reschedule"
            : "Ajukan izin"}
      </button>
    </form>
  );
}
