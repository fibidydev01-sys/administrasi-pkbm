"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  Users,
  RefreshCw,
} from "lucide-react";
import { useRequireAdmin } from "@/hooks";
import { useJadwalStore, useGuruStore } from "@/stores";
import { PageHeader, LoadingSpinner, DeleteConfirmDialog } from "@/components/shared";
import { JadwalForm } from "@/components/features/jadwal";
import { JadwalCardGrid } from "@/components/features/jadwal";
import { HARI_OPTIONS } from "@/types";
import { toast } from "sonner";
import type { JadwalWithGuru, JadwalInsert, JadwalUpdate, LokasiType } from "@/types";

export default function AdminJadwalPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const {
    jadwalList,
    fetchJadwalList,
    createJadwal,
    updateJadwal,
    deleteJadwal,
    toggleJadwalActive,
    selectedJadwal,
    setSelectedJadwal,
    filterHari,
    setFilterHari,
    isLoading,
    isSubmitting,
  } = useJadwalStore();

  const { guruList, fetchGuruList } = useGuruStore();

  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [jadwalToDelete, setJadwalToDelete] = useState<JadwalWithGuru | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGuru, setFilterGuru] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLokasi, setFilterLokasi] = useState<LokasiType | null>(null);

  // ✅ Load jadwal dan guru saat pertama kali - filter default: HARI INI
  useEffect(() => {
    if (!authLoading) {
      // Set filter ke hari ini
      const todayIndex = new Date().getDay();
      setFilterHari(todayIndex);

      fetchJadwalList();
      fetchGuruList();
    }
  }, [authLoading, fetchJadwalList, fetchGuruList, setFilterHari]);

  const filteredJadwal = jadwalList.filter((jadwal) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        jadwal.mapel?.toLowerCase().includes(query) ||
        jadwal.guru?.nama.toLowerCase().includes(query) ||
        jadwal.keterangan?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    if (filterHari !== null && jadwal.hari !== filterHari) return false;
    if (filterGuru !== "all" && jadwal.guru_id !== filterGuru) return false;
    if (filterStatus === "active" && !jadwal.is_active) return false;
    if (filterStatus === "inactive" && jadwal.is_active) return false;
    if (filterLokasi && jadwal.lokasi !== filterLokasi) return false;
    return true;
  });

  const stats = {
    total: jadwalList.length,
    active: jadwalList.filter((j) => j.is_active).length,
    inactive: jadwalList.filter((j) => !j.is_active).length,
    todayCount: jadwalList.filter((j) => j.hari === new Date().getDay() && j.is_active).length,
  };

  const handleAdd = () => {
    setSelectedJadwal(null);
    setShowForm(true);
  };

  const handleEdit = (jadwal: JadwalWithGuru) => {
    setSelectedJadwal(jadwal);
    setShowForm(true);
  };

  const handleDelete = (jadwal: JadwalWithGuru) => {
    setJadwalToDelete(jadwal);
    setShowDeleteDialog(true);
  };

  const handleToggleActive = async (jadwal: JadwalWithGuru) => {
    const result = await toggleJadwalActive(jadwal.id, !jadwal.is_active);
    if (result.success) {
      toast.success(jadwal.is_active ? "Jadwal dinonaktifkan" : "Jadwal diaktifkan");
    } else {
      toast.error(result.error || "Gagal mengubah status");
    }
  };

  const confirmDelete = async () => {
    if (!jadwalToDelete) return;
    const result = await deleteJadwal(jadwalToDelete.id);
    if (result.success) {
      toast.success("Jadwal berhasil dihapus");
    } else {
      toast.error(result.error || "Gagal menghapus jadwal");
    }
    setShowDeleteDialog(false);
    setJadwalToDelete(null);
  };

  const handleFormSubmit = async (data: JadwalInsert | JadwalUpdate) => {
    let result;
    if (selectedJadwal) {
      result = await updateJadwal(selectedJadwal.id, data as JadwalUpdate);
    } else {
      result = await createJadwal(data as JadwalInsert);
    }
    if (result.success) {
      toast.success(selectedJadwal ? "Jadwal diperbarui" : "Jadwal ditambahkan");
      setShowForm(false);
      setSelectedJadwal(null);
    } else {
      toast.error(result.error || "Gagal menyimpan jadwal");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterHari(new Date().getDay()); // Reset ke hari ini
    setFilterGuru("all");
    setFilterStatus("all");
    setFilterLokasi(null);
  };

  const hasActiveFilters =
    searchQuery ||
    (filterHari !== null && filterHari !== new Date().getDay()) || // Filter aktif jika bukan hari ini
    filterGuru !== "all" ||
    filterStatus !== "all" ||
    filterLokasi !== null;

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Memuat..." />
      </div>
    );
  }

  // ✅ NAMA HARI UNTUK DISPLAY
  const getCurrentDayName = () => {
    if (filterHari === null) return "Semua Hari";
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[filterHari];
  };

  return (
    <div className="space-y-4 pb-24">
      <PageHeader
        title="Kelola Jadwal"
        description={`Menampilkan jadwal hari ${getCurrentDayName()}`}
        action={
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Tambah Jadwal</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.total}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.active}</p>
                <p className="text-[10px] text-muted-foreground">Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-100 rounded-lg">
                <Clock className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.inactive}</p>
                <p className="text-[10px] text-muted-foreground">Nonaktif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.todayCount}</p>
                <p className="text-[10px] text-muted-foreground">Hari Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari mapel, guru..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchJadwalList()}
                disabled={isLoading}
                className="h-9 w-9 flex-shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Filter className="h-3 w-3" />
                <span>Filter:</span>
              </div>

              <div className="flex flex-wrap gap-2 flex-1">
                {/* Hari Filter */}
                <Select
                  value={filterHari?.toString() ?? "all"}
                  onValueChange={(v) => setFilterHari(v === "all" ? null : parseInt(v))}
                >
                  <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue placeholder="Hari" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" sideOffset={4}>
                    <SelectItem value="all">Semua Hari</SelectItem>
                    {HARI_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Guru Filter */}
                <Select value={filterGuru} onValueChange={setFilterGuru}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue placeholder="Guru" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" sideOffset={4}>
                    <SelectItem value="all">Semua Guru</SelectItem>
                    {guruList
                      .filter((g) => g.is_active)
                      .map((guru) => (
                        <SelectItem key={guru.id} value={guru.id}>
                          {guru.nama}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" sideOffset={4}>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>

                {/* Lokasi Filter */}
                <Select
                  value={filterLokasi ?? "all"}
                  onValueChange={(v) => setFilterLokasi(v === "all" ? null : v as LokasiType)}
                >
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue placeholder="Lokasi" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" sideOffset={4}>
                    <SelectItem value="all">Semua Lokasi</SelectItem>
                    <SelectItem value="jiwan">Jiwan</SelectItem>
                    <SelectItem value="grobogan">Grobogan</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 text-xs text-muted-foreground"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              {filteredJadwal.length} dari {jadwalList.length} jadwal
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Memuat jadwal..." />
        </div>
      ) : filteredJadwal.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {hasActiveFilters ? "Tidak Ada Hasil" : "Belum Ada Jadwal"}
          </h3>
          <p className="text-muted-foreground mb-4 text-sm">
            {hasActiveFilters
              ? "Tidak ada jadwal yang cocok dengan filter"
              : "Mulai dengan menambahkan jadwal baru"}
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Reset Filter
            </Button>
          ) : (
            <Button size="sm" onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Jadwal
            </Button>
          )}
        </Card>
      ) : (
        <JadwalCardGrid
          jadwalList={filteredJadwal}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      <JadwalForm
        open={showForm}
        onOpenChange={setShowForm}
        jadwal={selectedJadwal}
        guruList={guruList}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        itemName={jadwalToDelete ? `jadwal ${jadwalToDelete.mapel || "ini"}` : "jadwal ini"}
        isLoading={isSubmitting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}