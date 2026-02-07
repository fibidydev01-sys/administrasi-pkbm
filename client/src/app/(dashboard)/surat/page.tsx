"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

import { useSuratList, useSurat, useLembagaList, usePermissions } from "@/hooks";
import { ROUTES } from "@/constants";
import { formatTanggalPendek } from "@/lib/date";
import { truncate } from "@/lib/format";

import { PageHeader, EmptyState, StatusBadge, DeleteConfirmDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";

export default function SuratListPage() {
  const router = useRouter();
  const [filterLembaga, setFilterLembaga] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { surats, loading, refresh } = useSuratList(filterLembaga);
  const { deleteSurat } = useSurat();
  const { lembagas } = useLembagaList();
  const { can } = usePermissions();

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteSurat(deleteId);
      toast.success("Surat berhasil dihapus");
      setDeleteId(null);
      refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus surat";
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Surat Keluar" description="Daftar semua surat keluar lembaga">
        {can.createSurat && (
          <Link href={ROUTES.SURAT_BUAT}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Buat Surat
            </Button>
          </Link>
        )}
      </PageHeader>

      {/* Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Select
              value={filterLembaga ?? "all"}
              onValueChange={(val) => setFilterLembaga(val === "all" ? undefined : val)}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Semua Lembaga" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Lembaga</SelectItem>
                {lembagas.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    [{l.kode}] {l.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : surats.length === 0 ? (
        <EmptyState
          title="Belum ada surat"
          description="Mulai buat surat keluar pertama Anda"
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Surat</TableHead>
                <TableHead>Perihal</TableHead>
                <TableHead>Kepada</TableHead>
                <TableHead>Lembaga</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surats.map((surat) => (
                <TableRow key={surat.id}>
                  <TableCell className="font-mono text-sm">
                    {surat.nomor_surat || "-"}
                  </TableCell>
                  <TableCell>{truncate(surat.perihal, 50)}</TableCell>
                  <TableCell>{truncate(surat.kepada, 40)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {surat.lembaga?.kode}
                  </TableCell>
                  <TableCell>{formatTanggalPendek(surat.tanggal_surat)}</TableCell>
                  <TableCell>
                    <StatusBadge status={surat.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(ROUTES.SURAT_DETAIL(surat.id))}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {can.updateSurat && surat.status === "draft" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(ROUTES.SURAT_EDIT(surat.id))}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {can.deleteSurat && surat.status === "draft" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(surat.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Surat"
        description="Surat yang dihapus tidak dapat dikembalikan. Yakin ingin menghapus?"
      />
    </div>
  );
}
