"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores";
import { useSuratList, useLembagaList, usePermissions } from "@/hooks";
import { ROUTES } from "@/constants";

import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Users, Plus, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { surats } = useSuratList();
  const { lembagas } = useLembagaList();
  const { can, isAdmin } = usePermissions();

  const draftCount = surats.filter((s) => s.status === "draft").length;
  const approvedCount = surats.filter((s) => s.status === "approved").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Selamat datang, ${user?.full_name ?? "User"}`}
        description="Sistem Persuratan & Administrasi PKBM Yayasan Al Barakah"
      >
        {can.createSurat && (
          <Link href={ROUTES.SURAT_BUAT}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Buat Surat
            </Button>
          </Link>
        )}
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Surat</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{surats.length}</div>
            <p className="text-xs text-muted-foreground">surat keluar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
            <p className="text-xs text-muted-foreground">menunggu persetujuan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">siap dikirim</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lembaga</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lembagas.length}</div>
            <p className="text-xs text-muted-foreground">lembaga aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Surat Keluar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Kelola surat keluar seluruh lembaga
            </p>
            <Link href={ROUTES.SURAT}>
              <Button variant="outline" size="sm">
                Lihat Semua
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {isAdmin && (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">Lembaga</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Kelola data dan pengaturan lembaga
                </p>
                <Link href={ROUTES.LEMBAGA}>
                  <Button variant="outline" size="sm">
                    Kelola Lembaga
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">Pengguna</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Kelola pengguna sistem</p>
                <Link href={ROUTES.ADMIN_PENGGUNA}>
                  <Button variant="outline" size="sm">
                    Kelola Pengguna
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
