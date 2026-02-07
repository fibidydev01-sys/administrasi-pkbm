import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/features/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Yayasan Al Barakah",
  description: "Masuk ke Sistem Absensi Digital Yayasan Al Barakah",
};

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If already logged in, redirect
  if (user) {
    const { data: guru } = await supabase
      .from("guru")
      .select("is_admin")
      .eq("auth_user_id", user.id)
      .single();

    if (guru?.is_admin) {
      redirect("/admin/dashboard");
    } else {
      redirect("/absen");
    }
  }

  return <LoginForm />;
}