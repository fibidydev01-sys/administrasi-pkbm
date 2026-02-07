// src/components/features/riwayat/riwayat-drawer.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { AvatarDisplay, StatusBadge, AbsenTypeBadge } from "@/components/shared";
import { formatTanggalPendek, formatTimestamp } from "@/lib/utils";
import { formatJam } from "@/lib/jadwal";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Absensi, Jadwal } from "@/types";

interface AbsensiWithJadwal extends Absensi {
  jadwal?: Jadwal | null;
}

interface RelatedAbsensi {
  masuk: Absensi | null;
  pulang: Absensi | null;
}

interface RiwayatDrawerProps {
  absensi: AbsensiWithJadwal | null;
  onClose: () => void;
}

export function RiwayatDrawer({ absensi, onClose }: RiwayatDrawerProps) {
  const [relatedAbsensi, setRelatedAbsensi] = useState<RelatedAbsensi>({
    masuk: null,
    pulang: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch related absensi (masuk & pulang for same jadwal & date)
  useEffect(() => {
    const fetchRelated = async () => {
      if (!absensi?.jadwal_id || !absensi?.tanggal) return;

      setIsLoading(true);
      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from("absensi")
          .select("*")
          .eq("jadwal_id", absensi.jadwal_id)
          .eq("tanggal", absensi.tanggal)
          .in("tipe", ["masuk", "pulang"]);

        if (error) throw error;

        const masuk = data?.find((a) => a.tipe === "masuk") || null;
        const pulang = data?.find((a) => a.tipe === "pulang") || null;

        setRelatedAbsensi({ masuk, pulang });
      } catch (error) {
        console.error("Error fetching related absensi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (absensi) {
      fetchRelated();
    }
  }, [absensi]);

  if (!absensi) return null;

  return (
    <Drawer open={!!absensi} onOpenChange={() => onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b px-4 py-3">
          <DrawerTitle>Detail Absensi</DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 py-4 space-y-4">
          {/* Header Info */}
          <div className="w-full max-w-md mx-auto space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Tanggal</p>
                <p className="font-semibold text-sm">{formatTanggalPendek(absensi.tanggal)}</p>
              </div>
            </div>

            {absensi.jadwal && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Sesi Jadwal</p>
                  <p className="font-semibold text-sm">
                    {formatJam(absensi.jadwal.jam_mulai)} - {formatJam(absensi.jadwal.jam_selesai)}
                  </p>
                  {absensi.jadwal.mapel && (
                    <p className="text-xs text-muted-foreground">{absensi.jadwal.mapel}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator className="max-w-md mx-auto my-3" />

          {/* Absen Masuk */}
          <div className="space-y-2">
            <div className="w-full max-w-md mx-auto flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Absen Masuk
              </h3>
              {relatedAbsensi.masuk && (
                <AbsenTypeBadge tipe="masuk" />
              )}
            </div>

            {relatedAbsensi.masuk ? (
              <div className="w-full max-w-md mx-auto space-y-2">
                <AbsensiDetail absensi={relatedAbsensi.masuk} />
                <AbsensiPhoto absensi={relatedAbsensi.masuk} />
              </div>
            ) : (
              <div className="w-full max-w-md mx-auto p-4 bg-muted/30 border border-dashed rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Belum absen masuk</p>
              </div>
            )}
          </div>

          <Separator className="max-w-md mx-auto my-3" />
          <div className="space-y-2">
            <div className="w-full max-w-md mx-auto flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Absen Pulang
              </h3>
              {relatedAbsensi.pulang && (
                <AbsenTypeBadge tipe="pulang" />
              )}
            </div>

            {relatedAbsensi.pulang ? (
              <div className="w-full max-w-md mx-auto space-y-2">
                <AbsensiDetail absensi={relatedAbsensi.pulang} />
                <AbsensiPhoto absensi={relatedAbsensi.pulang} />
              </div>
            ) : (
              <div className="w-full max-w-md mx-auto p-4 bg-muted/30 border border-dashed rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Belum absen pulang</p>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ==================== PHOTO COMPONENT (OUTSIDE CARD) ====================
interface AbsensiPhotoProps {
  absensi: Absensi;
}

function AbsensiPhoto({ absensi }: AbsensiPhotoProps) {
  return (
    <div className="mt-2">
      {absensi.foto_url ? (
        <div className="w-full aspect-square rounded-lg overflow-hidden bg-muted">
          <img
            src={absensi.foto_url}
            alt={`Foto ${absensi.tipe}`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-square rounded-lg bg-muted/50 border border-dashed flex flex-col items-center justify-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">Tidak ada foto</p>
        </div>
      )}
    </div>
  );
}

// ==================== DETAIL COMPONENT ====================
interface AbsensiDetailProps {
  absensi: Absensi;
}

function AbsensiDetail({ absensi }: AbsensiDetailProps) {
  const isAuto = absensi.status === "auto";

  return (
    <div
      className={cn(
        "p-3 border rounded-lg space-y-3",
        isAuto
          ? "bg-orange-50 border-orange-200"
          : absensi.tipe === "masuk"
            ? "bg-green-50 border-green-200"
            : "bg-purple-50 border-purple-200"
      )}
    >
      {/* Time & Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Clock
            className={cn(
              "h-4 w-4",
              isAuto
                ? "text-orange-600"
                : absensi.tipe === "masuk"
                  ? "text-green-600"
                  : "text-purple-600"
            )}
          />
          <div>
            <p
              className={cn(
                "font-semibold text-sm",
                isAuto
                  ? "text-orange-700"
                  : absensi.tipe === "masuk"
                    ? "text-green-700"
                    : "text-purple-700"
              )}
            >
              {formatTimestamp(absensi.timestamp)}
            </p>
            {isAuto && (
              <p className="text-xs text-orange-600">Auto-complete oleh sistem</p>
            )}
          </div>
        </div>

        <StatusBadge status={absensi.status} />
      </div>

      {/* Location */}
      {absensi.alamat && (
        <div className="flex items-start gap-2">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Lokasi</p>
            <p className="text-xs">{absensi.alamat}</p>
          </div>
        </div>
      )}

      {/* Accuracy */}
      {absensi.accuracy && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Akurasi GPS: ±{Math.round(absensi.accuracy)}m</span>
        </div>
      )}

      {/* Mock Location Warning */}
      {absensi.is_mock_location && (
        <div className="flex items-center gap-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Terdeteksi fake GPS</span>
        </div>
      )}

      {/* Notes */}
      {absensi.catatan && (
        <div className="p-2 bg-background rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Catatan</p>
          <p className="text-xs">{absensi.catatan}</p>
        </div>
      )}
    </div>
  );
}
