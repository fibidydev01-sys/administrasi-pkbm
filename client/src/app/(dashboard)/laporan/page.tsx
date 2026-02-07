"use client";

import { useMemo } from "react";
import { useSuratList, useLembagaList } from "@/hooks";

import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { FileText, CheckCircle, Send, Archive } from "lucide-react";

export default function LaporanPage() {
  const { surats, loading: suratLoading } = useSuratList();
  const { lembagas, loading: lembagaLoading } = useLembagaList();

  const loading = suratLoading || lembagaLoading;

  const stats = useMemo(() => {
    const byStatus = {
      draft: surats.filter((s) => s.status === "draft").length,
      approved: surats.filter((s) => s.status === "approved").length,
      sent: surats.filter((s) => s.status === "sent").length,
      archived: surats.filter((s) => s.status === "archived").length,
    };

    const byLembaga = lembagas.map((l) => ({
      lembaga: l,
      count: surats.filter((s) => s.lembaga_id === l.id).length,
    }));

    return { byStatus, byLembaga, total: surats.length };
  }, [surats, lembagas]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Laporan" description="Statistik dan laporan surat keluar" />
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan" description="Statistik dan laporan surat keluar" />

      {/* Status Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byStatus.draft}</div>
            <p className="text-xs text-muted-foreground">surat draft</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byStatus.approved}</div>
            <p className="text-xs text-muted-foreground">surat disetujui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terkirim</CardTitle>
            <Send className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byStatus.sent}</div>
            <p className="text-xs text-muted-foreground">surat terkirim</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diarsipkan</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byStatus.archived}</div>
            <p className="text-xs text-muted-foreground">surat diarsipkan</p>
          </CardContent>
        </Card>
      </div>

      {/* Per Lembaga */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Surat per Lembaga</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.byLembaga.map(({ lembaga, count }) => (
              <div key={lembaga.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    [{lembaga.kode}] {lembaga.nama}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{
                        width: stats.total > 0 ? `${(count / stats.total) * 100}%` : "0%",
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>

          {stats.byLembaga.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada data lembaga
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ringkasan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Surat</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Lembaga</p>
              <p className="text-xl font-bold">{lembagas.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rata-rata / Lembaga</p>
              <p className="text-xl font-bold">
                {lembagas.length > 0 ? (stats.total / lembagas.length).toFixed(1) : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
