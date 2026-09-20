"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function NavBar({
  nama,
  isAdmin,
  fotoUrl,
}: {
  nama: string;
  isAdmin?: boolean;
  fotoUrl?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navItems = [
    { href: "/absen", label: "Absen" },
    { href: "/riwayat", label: "Riwayat" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  const initials =
    nama
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "G";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="border-b border-brand/10 bg-gradient-to-r from-brand to-brand-dark px-4 py-3 text-white shadow-premium">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Buka menu navigasi"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/15 sm:hidden"
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-sm">
              <Image
                src="/logo.png"
                alt="Rida Academy logo"
                width={48}
                height={48}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold tracking-[0.12em] text-brand-light uppercase">
                Rida Academy
              </div>
              <div className="text-xs text-white/80">Absensi Digital</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm sm:gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-full px-3 py-1.5 transition",
                    active
                      ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20"
                      : "text-white/90 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-white/10 shadow-lg ring-2 ring-white/10 transition hover:bg-white/15"
              aria-label="Menu profil guru"
            >
              {fotoUrl ? (
                <Image
                  src={fotoUrl}
                  alt={nama}
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-white">{initials}</span>
              )}
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 text-left shadow-2xl backdrop-blur-sm">
                <div className="flex items-center gap-3 border-b border-white/10 px-3 py-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand/20 text-xs font-bold text-brand-light">
                    {fotoUrl ? (
                      <Image
                        src={fotoUrl}
                        alt={nama}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">
                      {nama}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      Guru
                    </div>
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm text-slate-200 transition hover:bg-white/5 hover:text-white"
                >
                  Profil
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full border-t border-white/10 px-3 py-2.5 text-left text-sm text-rose-200 transition hover:bg-rose-500/10 hover:text-rose-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900/80 p-2 shadow-xl sm:hidden">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={[
                  "block rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-white/15 text-white"
                    : "text-slate-200 hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
