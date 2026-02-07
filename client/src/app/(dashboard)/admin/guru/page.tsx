"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GuruList, GuruGrid, GuruForm } from "@/components/features/admin";
import { ConfirmDialog } from "@/components/shared";
import { useGuruStore, useJadwalStore } from "@/stores";
import { useRequireAdmin } from "@/hooks";
import { toast } from "sonner";
import { filterGuruByLokasi } from "@/lib/guru-utils";
import type { Guru, LokasiType } from "@/types";

type ViewMode = "list" | "grid";

export default function AdminGuruPage() {
  const { isLoading: authLoading } = useRequireAdmin();

  const {
    guruList,
    isLoading,
    searchQuery,
    selectedIds,
    filterLokasi,
    fetchGuruList,
    setSearchQuery,
    batchDeleteGuru,
    clearSelection,
    setFilterLokasi,
  } = useGuruStore();

  const { jadwalList, fetchJadwalList } = useJadwalStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState<Guru | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    if (!authLoading) {
      fetchGuruList();
      fetchJadwalList();
    }
  }, [authLoading, fetchGuruList, fetchJadwalList]);

  const handleSuccess = () => {
    fetchGuruList();
  };

  const handleAdd = () => {
    setSelectedGuru(null);
    setDialogOpen(true);
  };

  const handleEdit = (guru: Guru) => {
    setSelectedGuru(guru);
    setDialogOpen(true);
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await batchDeleteGuru(selectedIds);

    if (result.success) {
      toast.success(`${selectedIds.length} guru berhasil dihapus`);
      setDeleteDialogOpen(false);
    } else {
      toast.error(result.error || "Gagal menghapus guru");
    }
  };

  const filteredGuru = (() => {
    let result = guruList;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (guru) =>
          guru.nama.toLowerCase().includes(query) ||
          guru.email.toLowerCase().includes(query) ||
          guru.nip?.toLowerCase().includes(query) ||
          guru.jabatan?.toLowerCase().includes(query)
      );
    }

    if (filterLokasi) {
      result = filterGuruByLokasi(result, jadwalList, filterLokasi);
    }

    return result;
  })();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Guru</h1>
          <p className="text-muted-foreground">Kelola data guru dan tutor</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Guru
        </Button>
      </div>

      {/* Filters + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Cari nama, email, NIP, jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ✅ FIX: Lokasi Filter with proper positioning */}
        <Select
          value={filterLokasi || "all"}
          onValueChange={(value) => {
            setFilterLokasi(value === "all" ? null : (value as LokasiType));
            clearSelection();
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semua Lokasi" />
          </SelectTrigger>
          {/* ✅ CRITICAL FIX: side="bottom" sideOffset={4} */}
          <SelectContent position="popper" side="bottom" sideOffset={4}>
            <SelectItem value="all">Semua Lokasi</SelectItem>
            <SelectItem value="jiwan">Jiwan</SelectItem>
            <SelectItem value="grobogan">Grobogan</SelectItem>
          </SelectContent>
        </Select>

        {/* View Toggle */}
        <div className="flex gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-muted p-3 rounded-lg flex items-center justify-between">
          <p className="text-sm font-medium">{selectedIds.length} guru terpilih</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Terpilih
            </Button>
          </div>
        </div>
      )}

      {/* Conditional Render: List or Grid */}
      {viewMode === "list" ? (
        <GuruList
          data={filteredGuru}
          isLoading={isLoading}
          onEdit={handleEdit}
          jadwalList={jadwalList}
        />
      ) : (
        <GuruGrid
          data={filteredGuru}
          isLoading={isLoading}
          onEdit={handleEdit}
          jadwalList={jadwalList}
        />
      )}

      {/* Result Count */}
      <p className="text-sm text-muted-foreground">
        Menampilkan {filteredGuru.length} dari {guruList.length} guru
        {filterLokasi && ` di lokasi ${filterLokasi}`}
      </p>

      {/* Form Dialog */}
      <GuruForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        guru={selectedGuru}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Guru Terpilih?"
        description={`Anda akan menonaktifkan ${selectedIds.length} guru. Mereka tidak akan bisa login lagi.`}
        onConfirm={handleBatchDelete}
      />
    </div>
  );
}