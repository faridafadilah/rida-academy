"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const params = useSearchParams();
  const error = params.get("error");

  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(244,185,66,0.18),transparent_30%),linear-gradient(135deg,#f3f7fb_0%,#eef7fa_30%,#f8f4ee_100%)] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white/80 shadow-[0_30px_80px_rgba(31,90,118,0.12)] backdrop-blur-sm lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand via-brand-dark to-slate-900 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(244,185,66,0.35),transparent_28%)]" />
          <div className="relative z-10">
            <div className="mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-sm">
              <Image
                src="/logo.png"
                alt="Rida Academy logo"
                width={80}
                height={80}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-light">
              Rida Academy
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight">
              Absensi
              <span className="mt-2 block text-brand-accent">Digital Guru</span>
            </h1>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="text-sm text-white/80">
                Kelola mengajar dengan mudah
              </div>
              <div className="mt-2 text-2xl font-bold">
                Fast • Accurate • Professional
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-brand/10 bg-brand-light shadow-inner">
              <Image
                src="/logo.png"
                alt="Rida Academy logo"
                width={80}
                height={80}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <h2 className="mt-6 text-3xl font-black text-slate-900">
              Masuk ke akun
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Login khusus untuk guru yang sudah terdaftar di Rida Academy.
            </p>

            {error === "unauthorized" && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-left text-sm text-red-600">
                Email kamu belum terdaftar sebagai guru. Hubungi admin untuk
                didaftarkan terlebih dahulu.
              </div>
            )}

            <button
              onClick={handleLogin}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base font-semibold text-slate-700 shadow-[0_12px_25px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#FFC107"
                  d="M43.6 20.5H42V20H24v8h11.3C33.8 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6 29.5 4 24 4c-7.5 0-14 4.1-17.7 10.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.4 35.1 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.9 39.8 16.4 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.4-4.2 5.9l6.3 5.3C40.4 36.5 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"
                />
              </svg>
              Login dengan Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
