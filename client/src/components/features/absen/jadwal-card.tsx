"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  Circle,
  ChevronRight,
  Calendar,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatJadwalRange, getHariName } from "@/lib/jadwal";
import type { JadwalStatus } from "@/types";

interface JadwalCardProps {
  jadwalStatus: JadwalStatus;
  onAbsen: (tipe: "masuk" | "pulang") => void;
  isSubmitting?: boolean;
  className?: string;
}

export function JadwalCard({
  jadwalStatus,
  onAbsen,
  isSubmitting = false,
  className,
}: JadwalCardProps) {
  const {
    jadwal,
    canAbsenMasuk,
    canAbsenPulang,
    hasAbsenMasuk,
    hasAbsenPulang,
    windowStart,
    windowEnd,
    isWithinWindow,
    message,
  } = jadwalStatus;

  const isComplete = hasAbsenMasuk && hasAbsenPulang;

  return (
    <Card
      className={cn(
        "transition-all",
        isWithinWindow && !isComplete && "ring-2 ring-primary shadow-lg",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{jadwal.mapel || "Sesi Mengajar"}</h3>
            <p className="text-sm text-muted-foreground">
              {getHariName(jadwal.hari)}, {formatJadwalRange(jadwal)}
            </p>
          </div>
          {isComplete ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="mr-1 h-3 w-3" />
              Selesai
            </Badge>
          ) : isWithinWindow ? (
            <Badge variant="default" className="animate-pulse">
              <Clock className="mr-1 h-3 w-3" />
              Aktif
            </Badge>
          ) : (
            <Badge variant="outline">
              <Clock className="mr-1 h-3 w-3" />
              {windowStart} - {windowEnd}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Absen */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {hasAbsenMasuk ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <span className={cn("text-sm", hasAbsenMasuk && "text-green-600 font-medium")}>
              Masuk
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasAbsenPulang ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <span className={cn("text-sm", hasAbsenPulang && "text-green-600 font-medium")}>
              Pulang
            </span>
          </div>
        </div>

        {/* Message */}
        {!isComplete && (
          <p className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
            {message}
          </p>
        )}

        {/* Action Buttons - Show when within window */}
        {isWithinWindow && !isComplete && (
          <div className="flex gap-2">
            {canAbsenMasuk && (
              <Button
                onClick={() => onAbsen("masuk")}
                disabled={isSubmitting}
                className="flex-1 gap-2"
                size="lg"
              >
                <Camera className="h-5 w-5" />
                Absen Masuk
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {canAbsenPulang && (
              <Button
                onClick={() => onAbsen("pulang")}
                disabled={isSubmitting}
                variant="secondary"
                className="flex-1 gap-2"
                size="lg"
              >
                <Camera className="h-5 w-5" />
                Absen Pulang
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Show info when not in window */}
        {!isWithinWindow && !isComplete && (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground">
              Absen dibuka pada jam {windowStart}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Empty state
export function JadwalListEmpty({ className }: { className?: string }) {
  return (
    <Card className={cn("p-8 text-center", className)}>
      <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 font-semibold">Tidak Ada Jadwal</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Anda tidak memiliki jadwal mengajar hari ini.
      </p>
    </Card>
  );
}