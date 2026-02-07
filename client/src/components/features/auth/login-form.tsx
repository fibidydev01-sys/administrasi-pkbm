"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, AlertCircle, Eye, EyeOff, Mail, Lock, HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores";
import { loginSchema, type LoginFormData } from "@/lib/validators";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (authError) {
        if (authError.message.includes("Invalid login")) {
          setError("Email atau password salah");
        } else {
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Gagal login. Silakan coba lagi.");
        setIsLoading(false);
        return;
      }

      // Check if user is linked to guru
      const { data: guru, error: guruError } = await supabase
        .from("guru")
        .select("id, is_admin, is_active, is_verified")
        .eq("auth_user_id", authData.user.id)
        .single();

      if (guruError || !guru) {
        await supabase.auth.signOut();
        setError("Akun tidak terhubung dengan data guru. Hubungi administrator.");
        setIsLoading(false);
        return;
      }

      if (!guru.is_active) {
        await supabase.auth.signOut();
        setError("Akun Anda telah dinonaktifkan. Hubungi administrator.");
        setIsLoading(false);
        return;
      }

      if (!guru.is_verified) {
        await supabase.auth.signOut();
        setError("Akun Anda belum diverifikasi. Hubungi administrator.");
        setIsLoading(false);
        return;
      }

      // Reset auth store state to trigger fresh fetch
      useAuthStore.setState({
        hasFetched: false,
        isLoading: false,
        fetchPromise: null,
      });

      // Small delay to ensure state is reset before navigation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect based on role
      if (guru.is_admin) {
        router.push("/admin/dashboard");
      } else {
        router.push("/absen");
      }

      // Force refresh to ensure new page loads with fresh state
      router.refresh();

    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center space-y-4 pb-4">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <Image
              src="/icon/icon-192x192.png"
              alt="Yayasan Al Barakah"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <CardTitle className="text-2xl font-bold">Yayasan Al Barakah</CardTitle>
          <CardDescription className="text-base mt-1">
            Sistem Absensi Digital
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="email@pkbm.com"
                        autoComplete="email"
                        disabled={isLoading}
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="pl-10 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        disabled={isLoading}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Masuk...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Masuk
                </>
              )}
            </Button>

            {/* Forgot Password */}
            <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
              <p>
                Lupa password?{" "}
                <span className="font-medium text-foreground">
                  Hubungi Administrator
                </span>
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}