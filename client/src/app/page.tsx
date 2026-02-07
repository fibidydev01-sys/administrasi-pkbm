import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if admin
  const { data: guru } = await supabase
    .from("guru")
    .select("is_admin")
    .eq("auth_user_id", user.id)
    .single();

  if (guru?.is_admin) {
    redirect("/admin/guru");
  } else {
    redirect("/absen");
  }
}