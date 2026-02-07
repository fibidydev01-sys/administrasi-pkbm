"use client";

import { useRequireAdmin } from "@/hooks";
import { PageHeader, FullPageLoader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Shield, HardDrive } from "lucide-react";

export default function AdminPengaturanPage() {
  const { isLoading } = useRequireAdmin();

  if (isLoading) return <FullPageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Sistem"
        description="Konfigurasi dan informasi sistem"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Database</CardTitle>
            <Database className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Provider</span>
              <Badge variant="outline">Supabase</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <Badge variant="secondary">Free</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Kelola database melalui Supabase Dashboard untuk operasi lanjutan.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Autentikasi</CardTitle>
            <Shield className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Provider</span>
              <Badge variant="outline">Email/Password</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">RLS</span>
              <Badge variant="default">Aktif</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Kelola pengguna melalui halaman Pengguna atau Supabase Auth Dashboard.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Storage</CardTitle>
            <HardDrive className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">lembaga-logos</span>
                <Badge variant="outline">Bucket</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">lembaga-ttd</span>
                <Badge variant="outline">Bucket</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">surat-pdf</span>
                <Badge variant="outline">Bucket</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Pastikan bucket Storage sudah dibuat di Supabase Dashboard.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Versi</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Framework</p>
              <p className="font-medium">Next.js 16</p>
            </div>
            <div>
              <p className="text-muted-foreground">UI Library</p>
              <p className="font-medium">Shadcn UI</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sistem</p>
              <p className="font-medium">Administrasi PKBM</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
