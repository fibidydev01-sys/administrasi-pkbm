"use client";

import { useRouter } from "next/navigation";
import { Building2, Eye } from "lucide-react";

import { useLembagaList } from "@/hooks";
import { ROUTES } from "@/constants";

import { PageHeader, EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function LembagaListPage() {
  const router = useRouter();
  const { lembagas, loading } = useLembagaList();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Lembaga" description="Daftar lembaga di bawah Yayasan Al Barakah" />
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Lembaga" description="Daftar lembaga di bawah Yayasan Al Barakah" />

      {lembagas.length === 0 ? (
        <EmptyState
          title="Belum ada lembaga"
          description="Lembaga belum dikonfigurasi di database"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lembagas.map((lembaga) => (
            <Card key={lembaga.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  [{lembaga.kode}] {lembaga.nama}
                </CardTitle>
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{lembaga.alamat}</p>
                  {lembaga.telepon && <p>Telp: {lembaga.telepon}</p>}
                  {lembaga.email && <p>Email: {lembaga.email}</p>}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Prefix: <code className="bg-muted px-1 rounded">{lembaga.nomor_prefix}</code>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(ROUTES.LEMBAGA_DETAIL(lembaga.id))}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Detail
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
