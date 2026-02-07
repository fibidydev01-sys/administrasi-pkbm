import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/features/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Administrasi PKBM",
  description: "Masuk ke Sistem Persuratan & Administrasi PKBM Yayasan Al Barakah",
};

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
