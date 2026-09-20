import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // called from a Server Component, middleware handles refresh
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // called from a Server Component, middleware handles refresh
          }
        },
      },
    },
  );
}

// Helper: ambil data guru (profil) dari user yang sedang login.
// Return null kalau email user belum terdaftar di tabel `guru`.
export async function getGuruProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { user: null, guru: null };

  const normalizedEmail = user.email.toLowerCase();

  const { data: guru } = await supabase
    .from("guru")
    .select("*")
    .ilike("email", normalizedEmail)
    .maybeSingle();

  return { user, guru };
}
