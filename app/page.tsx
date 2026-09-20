import { redirect } from "next/navigation";
import { getGuruProfile } from "@/lib/supabase/server";

export default async function HomePage() {
  const { user, guru } = await getGuruProfile();

  if (!user) redirect("/login");
  if (!guru) redirect("/login?error=unauthorized");
  redirect("/absen");
}
