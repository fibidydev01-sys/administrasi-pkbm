// src/app/(dashboard)/riwayat/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Calendar,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks";
import { createClient } from "@/lib/supabase/client";
import {
  PageHeader,
  LoadingSpinner,
  EmptyAbsensi,
} from "@/components/shared";
import { formatTanggalPendek, formatTimestamp } from "@/lib/utils";
import { formatJam } from "@/lib/jadwal";
import type { Absensi, Jadwal } from "@/types";
import { RiwayatDrawer } from "@/components/features/riwayat/riwayat-drawer";
import { cn } from "@/lib/utils";

interface AbsensiWithJadwal extends Absensi {
  jadwal?: Jadwal | null;
}

const ITEMS_PER_PAGE = 12;

type ViewMode = "list" | "grid";

export default function RiwayatPage() {
  const { guru } = useAuth();
  const [absensiList, setAbsensiList] = useState<AbsensiWithJadwal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [filterMonth, setFilterMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Detail drawer
  const [selectedAbsensi, setSelectedAbsensi] = useState<AbsensiWithJadwal | null>(null);

  const fetchAbsensi = async () => {
    if (!guru?.id) return;

    setIsLoading(true);
    const supabase = createClient();

    try {
      let query = supabase
        .from("absensi")
        .select(`*, jadwal:jadwal_id(*)`, { count: "exact" })
        .eq("guru_id", guru.id)
        .order("tanggal", { ascending: false })
        .order("timestamp", { ascending: false });

      if (filterMonth) {
        const [year, month] = filterMonth.split("-");

        const startDate = `${year}-${month}-01`;

        // FIX: Hitung endDate tanpa toISOString() biar ga kena timezone shift
        const lastDay = new Date(parseInt(year), parseInt(month), 0);
        const endDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;

        query = query.gte("tanggal", startDate).lte("tanggal", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by tanggal + jadwal_id, only show 'masuk'
      const grouped = new Map<string, AbsensiWithJadwal>();

      (data as AbsensiWithJadwal[])?.forEach((item) => {
        if (item.tipe === "masuk") {
          const key = `${item.tanggal}-${item.jadwal_id}`;
          if (!grouped.has(key)) {
            grouped.set(key, item);
          }
        }
      });

      const uniqueList = Array.from(grouped.values()).sort((a, b) => {
        const dateCompare = b.tanggal.localeCompare(a.tanggal);
        if (dateCompare !== 0) return dateCompare;
        return b.timestamp.localeCompare(a.timestamp);
      });

      // Pagination di client
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE;

      setAbsensiList(uniqueList.slice(from, to));
      setTotalCount(uniqueList.length);
    } catch (error) {
      console.error("Error fetching absensi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsensi();
  }, [guru?.id, filterMonth, page]);

  useEffect(() => {
    setPage(1);
  }, [filterMonth]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
      options.push({ value, label });
    }
    return options;
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat Absensi"
        description="Lihat riwayat absensi Anda"
      />

      {/* Filters & View Toggle */}
      <div className="flex items-center justify-end gap-2">
        {/* ✅ FIX: Month Filter with proper positioning */}
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-[180px] h-10">
            <SelectValue placeholder="Pilih bulan" />
          </SelectTrigger>
          {/* ✅ CRITICAL FIX: position="popper" side="bottom" sideOffset={4} */}
          <SelectContent position="popper" side="bottom" sideOffset={4}>
            {monthOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border rounded-md">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-9"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-9"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Memuat riwayat..." />
        </div>
      ) : absensiList.length === 0 ? (
        <EmptyAbsensi />
      ) : (
        <>
          {/* ==================== GRID VIEW ==================== */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {absensiList.map((absensi) => (
                <AbsensiGridCard
                  key={absensi.id}
                  absensi={absensi}
                  onClick={() => setSelectedAbsensi(absensi)}
                />
              ))}
            </div>
          )}

          {/* ==================== LIST VIEW ==================== */}
          {viewMode === "list" && (
            <div className="space-y-3">
              {absensiList.map((absensi) => (
                <AbsensiListCard
                  key={absensi.id}
                  absensi={absensi}
                  onClick={() => setSelectedAbsensi(absensi)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Drawer */}
      <RiwayatDrawer
        absensi={selectedAbsensi}
        onClose={() => setSelectedAbsensi(null)}
      />
    </div>
  );
}

// ==================== GRID CARD COMPONENT ====================
interface AbsensiGridCardProps {
  absensi: AbsensiWithJadwal;
  onClick: () => void;
}

function AbsensiGridCard({ absensi, onClick }: AbsensiGridCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted hover:ring-2 hover:ring-primary transition-all"
    >
      {/* Photo */}
      {absensi.foto_url ? (
        <img
          src={absensi.foto_url}
          alt="Foto absen"
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <Calendar className="h-12 w-12 text-muted-foreground" />
        </div>
      )}

      {/* Badge Timestamp - Top Right */}
      <div className="absolute top-2 right-2">
        <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
          <Clock className="h-3 w-3 mr-1" />
          {formatTimestamp(absensi.timestamp)}
        </Badge>
      </div>

      {/* Hover Overlay - Show Details */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white space-y-1">
          <p className="font-semibold text-sm">
            {formatTanggalPendek(absensi.tanggal)}
          </p>
          {absensi.jadwal && (
            <p className="text-xs opacity-90">
              Sesi: {formatJam(absensi.jadwal.jam_mulai)} - {formatJam(absensi.jadwal.jam_selesai)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

// ==================== LIST CARD COMPONENT ====================
interface AbsensiListCardProps {
  absensi: AbsensiWithJadwal;
  onClick: () => void;
}

function AbsensiListCard({ absensi, onClick }: AbsensiListCardProps) {
  return (
    <Card
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          {absensi.foto_url ? (
            <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted">
              <img
                src={absensi.foto_url}
                alt="Foto absen"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-16 h-16 rounded-md bg-muted flex items-center justify-center">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">
                {formatTanggalPendek(absensi.tanggal)}
              </span>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {formatTimestamp(absensi.timestamp)}
              </Badge>
            </div>

            {absensi.jadwal && (
              <p className="text-xs text-muted-foreground">
                Sesi: {formatJam(absensi.jadwal.jam_mulai)} - {formatJam(absensi.jadwal.jam_selesai)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}