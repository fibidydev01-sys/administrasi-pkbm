"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, CalendarOff } from "lucide-react";
import { AvatarDisplay } from "@/components/shared";
import { createClient } from "@/lib/supabase/client";
import { formatJam } from "@/lib/jadwal";
import { cn } from "@/lib/utils";
import type { Guru, Jadwal, Absensi } from "@/types";
import { AttendanceDetailDrawer } from "./attendance-detail-drawer";

interface RekapAttendanceProps {
  selectedDate: Date;
}

interface AbsensiWithDetails extends Absensi {
  guru: Guru;
  jadwal: Jadwal | null;
}

interface AttendanceRecord {
  guru: Guru;
  jadwal: Jadwal | null;
  absenMasuk: Absensi | null;
  absenPulang: Absensi | null;
}

// Helper: Format tanggal ke YYYY-MM-DD (local timezone)
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Format waktu dari timestamp
function formatWaktuFromTimestamp(timestamp: string | null): string {
  if (!timestamp) return "-";

  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta"
    });
  } catch {
    return "-";
  }
}

export function RekapAttendance({ selectedDate }: RekapAttendanceProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [hasJadwalToday, setHasJadwalToday] = useState(false);

  const formattedDate = useMemo(() => {
    return selectedDate.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [selectedDate]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const supabase = createClient();

      const dateStr = formatDateLocal(selectedDate);
      const dayOfWeek = selectedDate.getDay();

      try {
        const { data: absensiData, error: absensiError } = await supabase
          .from("absensi")
          .select(`
            *,
            guru:guru_id(*),
            jadwal:jadwal_id(*)
          `)
          .eq("tanggal", dateStr)
          .order("timestamp", { ascending: true });

        if (absensiError) throw absensiError;

        const { data: jadwalData, error: jadwalError } = await supabase
          .from("jadwal")
          .select("*, guru:guru_id(*)")
          .eq("hari", dayOfWeek)
          .eq("is_active", true)
          .order("jam_mulai");

        if (jadwalError) throw jadwalError;

        setHasJadwalToday((jadwalData?.length || 0) > 0);

        const recordsMap = new Map<string, AttendanceRecord>();

        (absensiData as AbsensiWithDetails[])?.forEach((absen) => {
          const guruId = absen.guru_id;

          if (!recordsMap.has(guruId)) {
            recordsMap.set(guruId, {
              guru: absen.guru,
              jadwal: absen.jadwal,
              absenMasuk: null,
              absenPulang: null,
            });
          }

          const record = recordsMap.get(guruId)!;
          if (absen.tipe === "masuk") {
            record.absenMasuk = absen;
          } else if (absen.tipe === "pulang") {
            record.absenPulang = absen;
          }
        });

        jadwalData?.forEach((jadwal: any) => {
          const guruId = jadwal.guru_id;
          if (!recordsMap.has(guruId)) {
            recordsMap.set(guruId, {
              guru: jadwal.guru,
              jadwal: jadwal,
              absenMasuk: null,
              absenPulang: null,
            });
          }
        });

        const records = Array.from(recordsMap.values()).sort((a, b) =>
          a.guru.nama.localeCompare(b.guru.nama)
        );

        setAttendanceRecords(records);
      } catch (error) {
        console.error("Error fetching attendance:", error);
        setAttendanceRecords([]);
        setHasJadwalToday(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const totalRecords = attendanceRecords.length;
  const totalHadir = attendanceRecords.filter((r) => r.absenMasuk !== null).length;

  if (isLoading) {
    return (
      <div className="space-y-4 pb-28">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const isHoliday = !hasJadwalToday && totalRecords === 0;

  return (
    <div className="space-y-4 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{formattedDate}</h3>
          {isHoliday ? (
            <p className="text-sm text-muted-foreground">-</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {totalHadir}/{totalRecords} hadir
            </p>
          )}
        </div>
        {!isHoliday && totalRecords > 0 && (
          <Badge
            variant={totalHadir === totalRecords ? "default" : "secondary"}
            className={cn(totalHadir === totalRecords && totalHadir > 0 && "bg-green-600")}
          >
            {Math.round((totalHadir / totalRecords) * 100)}%
          </Badge>
        )}
      </div>

      {isHoliday && (
        <Card>
          <CardContent className="py-8 text-center">
            <CalendarOff className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Tidak ada jadwal untuk hari ini</p>
            <p className="text-xs text-muted-foreground mt-1">(Hari libur / tidak ada aktivitas)</p>
          </CardContent>
        </Card>
      )}

      {!isHoliday && attendanceRecords.length > 0 && (
        <div className="space-y-2">
          {attendanceRecords.map((record) => (
            <AttendanceCard
              key={record.guru.id}
              record={record}
              onClick={() => setSelectedRecord(record)}
            />
          ))}
        </div>
      )}

      {/* ✅ DRAWER - Pola sama seperti riwayat */}
      <AttendanceDetailDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}

function AttendanceCard({ record, onClick }: { record: AttendanceRecord; onClick: () => void }) {
  const { guru, jadwal, absenMasuk, absenPulang } = record;
  const hasAttendance = absenMasuk !== null;

  const masukWaktu = formatWaktuFromTimestamp(absenMasuk?.timestamp || null);
  const pulangWaktu = formatWaktuFromTimestamp(absenPulang?.timestamp || null);

  const masukIsAuto = absenMasuk?.status === "auto";
  const pulangIsAuto = absenPulang?.status === "auto";

  return (
    <Card
      className={cn(
        "cursor-pointer hover:bg-muted/50 transition-colors",
        !hasAttendance && "opacity-60"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <AvatarDisplay name={guru.nama} imageUrl={guru.foto_url} size="sm" />

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{guru.nama}</p>
            <p className="text-xs text-muted-foreground truncate">
              {jadwal?.mapel || guru.jabatan || "Guru"}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            {jadwal && (
              <p className="text-xs text-muted-foreground">
                {formatJam(jadwal.jam_mulai)} - {formatJam(jadwal.jam_selesai)}
              </p>
            )}
            {hasAttendance ? (
              <p className="text-xs font-medium">
                <span className={masukIsAuto ? "text-orange-600" : "text-green-600"}>
                  {masukWaktu}
                </span>
                {" → "}
                <span className={pulangIsAuto ? "text-orange-600" : absenPulang ? "text-green-600" : "text-muted-foreground"}>
                  {pulangWaktu}
                </span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Belum absen</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}