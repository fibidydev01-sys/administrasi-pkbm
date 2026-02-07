"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Printer, CheckCircle } from "lucide-react";

import { useSurat, usePermissions } from "@/hooks";
import { ROUTES } from "@/constants";
import { formatTanggalPendek } from "@/lib/date";

import { PageHeader, StatusBadge, DeleteConfirmDialog, FullPageLoader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SuratPreview from "@/components/features/surat/surat-preview";

export default function SuratDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);

  const { surat, loading, error, deleteSurat, updateSurat } = useSurat(id);
  const { can } = usePermissions();

  async function handleDelete() {
    try {
      await deleteSurat(id);
      toast.success("Surat berhasil dihapus");
      router.push(ROUTES.SURAT);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus surat";
      toast.error(message);
    }
  }

  async function handleApprove() {
    try {
      await updateSurat(id, { status: "approved" });
      toast.success("Surat berhasil disetujui");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyetujui surat";
      toast.error(message);
    }
  }

  if (loading) return <FullPageLoader />;

  if (error || !surat) {
    return (
      <div className="space-y-6">
        <PageHeader title="Surat tidak ditemukan" />
        <p className="text-muted-foreground">{error || "Surat tidak ada atau sudah dihapus."}</p>
        <Link href={ROUTES.SURAT}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Detail Surat" description={surat.nomor_surat || "Draft"}>
        <div className="flex items-center gap-2">
          {can.approveSurat && surat.status === "draft" && (
            <Button variant="default" onClick={handleApprove}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Setujui
            </Button>
          )}
          {can.updateSurat && surat.status === "draft" && (
            <Link href={ROUTES.SURAT_EDIT(id)}>
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Cetak
          </Button>
          {can.deleteSurat && surat.status === "draft" && (
            <Button variant="destructive" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Info Card */}
      <Card className="no-print">
        <CardHeader>
          <CardTitle className="text-base">Informasi Surat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Status</p>
              <StatusBadge status={surat.status} />
            </div>
            <div>
              <p className="text-muted-foreground">Lembaga</p>
              <p className="font-medium">{surat.lembaga?.nama}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tanggal</p>
              <p className="font-medium">{formatTanggalPendek(surat.tanggal_surat)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sifat</p>
              <p className="font-medium">{surat.sifat}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <div className="print:m-0">
        <SuratPreview surat={surat} />
      </div>

      <DeleteConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        title="Hapus Surat"
        description="Surat yang dihapus tidak dapat dikembalikan. Yakin ingin menghapus?"
      />
    </div>
  );
}
