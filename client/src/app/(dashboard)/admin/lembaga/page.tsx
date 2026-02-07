"use client";

import { useRouter } from "next/navigation";
import { Building2, Eye } from "lucide-react";

import { useLembagaList, useRequireAdmin } from "@/hooks";
import { ROUTES } from "@/constants";

import { PageHeader, EmptyState } from "@/components/shared";
import { FullPageLoader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminLembagaPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const router = useRouter();
  const { lembagas, loading } = useLembagaList();

  if (authLoading) return <FullPageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Lembaga"
        description="Kelola data lembaga di bawah Yayasan Al Barakah"
      />

      {loading ? (
        <FullPageLoader />
      ) : lembagas.length === 0 ? (
        <EmptyState
          title="Belum ada lembaga"
          description="Tambahkan lembaga melalui Supabase Dashboard"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lembagas.map((lembaga) => (
            <Card key={lembaga.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">{lembaga.nama}</CardTitle>
                <Badge variant="outline">{lembaga.kode}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{lembaga.alamat}</p>
                  {lembaga.telepon && <p>Telp: {lembaga.telepon}</p>}
                  {lembaga.email && <p>Email: {lembaga.email}</p>}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-1 text-muted-foreground">
                    <p>
                      Prefix: <code className="bg-muted px-1 rounded">{lembaga.nomor_prefix}</code>
                    </p>
                    <p>
                      TTD: {lembaga.ttd_nama || <span className="italic">Belum diatur</span>}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(ROUTES.LEMBAGA_DETAIL(lembaga.id))}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
