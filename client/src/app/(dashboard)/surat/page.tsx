"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Eye, Pencil, Trash2, Search } from "lucide-react";

import { useSuratList, useSurat, useLembagaList, usePermissions } from "@/hooks";
import { ROUTES } from "@/constants";
import { formatTanggalPendek } from "@/lib/date";
import { truncate } from "@/lib/format";

import { PageHeader, EmptyState, StatusBadge, DeleteConfirmDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { surats, loading, refresh } = useSuratList(filterLembaga);
  const { deleteSurat } = useSurat();
  const { lembagas } = useLembagaList();
  const { can } = usePermissions();

  // Client-side filter by status & search
  const filteredSurats = useMemo(() => {
    let result = surats;

    if (filterStatus) {
      result = result.filter((s) => s.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.perihal.toLowerCase().includes(q) ||
          s.kepada.toLowerCase().includes(q) ||
          (s.nomor_surat && s.nomor_surat.toLowerCase().includes(q))
      );
    }

    return result;
  }, [surats, filterStatus, searchQuery]);

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

      {/* Filter & Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari perihal, tujuan, atau nomor surat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filterLembaga ?? "all"}
              onValueChange={(val) => setFilterLembaga(val === "all" ? undefined : val)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
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
            <Select
              value={filterStatus ?? "all"}
              onValueChange={(val) => setFilterStatus(val === "all" ? undefined : val)}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="sent">Terkirim</SelectItem>
                <SelectItem value="archived">Diarsipkan</SelectItem>
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
          action={
            can.createSurat
              ? { label: "Buat Surat Pertama", onClick: () => router.push(ROUTES.SURAT_BUAT) }
              : undefined
          }
        />
      ) : filteredSurats.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Tidak ditemukan"
          description="Tidak ada surat yang cocok dengan filter atau pencarian"
          action={{ label: "Reset Filter", onClick: () => { setSearchQuery(""); setFilterStatus(undefined); setFilterLembaga(undefined); } }}
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
              {filteredSurats.map((surat) => (
                <TableRow key={surat.id} className="cursor-pointer" onClick={() => router.push(ROUTES.SURAT_DETAIL(surat.id))}>
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
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
