"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftRight,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Loader2,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { formatTanggalPendek } from "@/lib/utils";
import { getHariName, formatJam } from "@/lib/jadwal";
import type { TukarJadwalWithRelations } from "@/types";

const STATUS_CONFIG = {
  pending: { label: "Menunggu", variant: "outline" as const, icon: Clock },
  approved: { label: "Disetujui", variant: "default" as const, icon: CheckCircle2 },
  rejected: { label: "Ditolak", variant: "destructive" as const, icon: XCircle },
  cancelled: { label: "Dibatalkan", variant: "secondary" as const, icon: Ban },
  expired: { label: "Kedaluwarsa", variant: "secondary" as const, icon: AlertTriangle },
};

interface TukarJadwalCardProps {
  tukarJadwal: TukarJadwalWithRelations;
  currentGuruId: string;
  mode: "saya" | "masuk";
  onApprove?: (tukarGuruId: string, tukarJadwalId: string) => void;
  onReject?: (tukarGuruId: string, tukarJadwalId: string) => void;
  onCancel?: (id: string) => void;
  isSubmitting?: boolean;
}

export function TukarJadwalCard({
  tukarJadwal,
  currentGuruId,
  mode,
  onApprove,
  onReject,
  onCancel,
  isSubmitting = false,
}: TukarJadwalCardProps) {
  const statusConfig = STATUS_CONFIG[tukarJadwal.status];
  const StatusIcon = statusConfig.icon;

  // Find current guru's entry in tukar_jadwal_guru (for incoming requests)
  const myEntry = tukarJadwal.tukar_jadwal_guru.find(
    (tg) => tg.guru_id === currentGuruId
  );

  const canRespond = mode === "masuk" && myEntry?.status === "pending" && tukarJadwal.status === "pending";
  const canCancelRequest = mode === "saya" && tukarJadwal.status === "pending";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header: Status + Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Tukar Jadwal</span>
          </div>
          <Badge variant={statusConfig.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Swap Info */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
          {/* Jadwal Pemohon (Left) */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatTanggalPendek(tukarJadwal.tanggal_pemohon)}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium truncate">{tukarJadwal.pemohon?.nama}</span>
            </div>
            {tukarJadwal.jadwal_pemohon && (
              <div className="text-xs text-muted-foreground">
                {tukarJadwal.jadwal_pemohon.mapel && (
                  <span className="block">{tukarJadwal.jadwal_pemohon.mapel}</span>
                )}
                <span>
                  {formatJam(tukarJadwal.jadwal_pemohon.jam_mulai)} - {formatJam(tukarJadwal.jadwal_pemohon.jam_selesai)}
                </span>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Guru Target (Right) */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatTanggalPendek(tukarJadwal.tanggal_target)}
            </div>
            {tukarJadwal.tukar_jadwal_guru.map((tg) => (
              <div key={tg.id} className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium truncate">{tg.guru?.nama}</span>
                  {tukarJadwal.tukar_jadwal_guru.length > 1 && (
                    <Badge variant={
                      tg.status === "approved" ? "default" :
                      tg.status === "rejected" ? "destructive" : "outline"
                    } className="text-[9px] px-1 py-0 h-4">
                      {tg.status === "approved" ? "OK" : tg.status === "rejected" ? "X" : "?"}
                    </Badge>
                  )}
                </div>
                {tg.jadwal && (
                  <div className="text-xs text-muted-foreground pl-4.5">
                    {tg.jadwal.mapel && <span>{tg.jadwal.mapel} - </span>}
                    {formatJam(tg.jadwal.jam_mulai)} - {formatJam(tg.jadwal.jam_selesai)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Alasan */}
        {tukarJadwal.alasan && (
          <p className="text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1.5">
            Alasan: {tukarJadwal.alasan}
          </p>
        )}

        {/* Action Buttons */}
        {canRespond && myEntry && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onApprove?.(myEntry.id, tukarJadwal.id)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-1" />
              )}
              Setuju
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => onReject?.(myEntry.id, tukarJadwal.id)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              Tolak
            </Button>
          </div>
        )}

        {canCancelRequest && (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => onCancel?.(tukarJadwal.id)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Ban className="h-4 w-4 mr-1" />
            )}
            Batalkan Permintaan
          </Button>
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-muted-foreground text-right">
          {new Date(tukarJadwal.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </CardContent>
    </Card>
  );
}
