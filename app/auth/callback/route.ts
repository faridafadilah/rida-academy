import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user?.email) {
      const normalizedEmail = data.user.email.toLowerCase();
      console.log("[auth callback] user email:", data.user.email);

      // Cek apakah email ini terdaftar sebagai guru, tanpa tergantung case huruf
      const { data: guru, error: guruError } = await supabase
        .from("guru")
        .select("id, email, nama, is_admin")
        .ilike("email", normalizedEmail)
        .maybeSingle();

      console.log("[auth callback] guru lookup:", {
        normalizedEmail,
        guru,
        guruError,
      });

      if (!guru) {
        // Email tidak terdaftar -> logout paksa & tolak
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=unauthorized`);
      }

      return NextResponse.redirect(`${origin}/absen`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=unauthorized`);
}
