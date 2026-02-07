"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  Clock,
  BookOpen,
  Calendar,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { AvatarDisplay } from "@/components/shared";
import { getHariName, formatJam, groupJadwalByHari, sortJadwalByTime } from "@/lib/jadwal";
import { cn } from "@/lib/utils";
import { HARI_OPTIONS, LOKASI_NAMES } from "@/types";
import type { JadwalWithGuru } from "@/types";

interface JadwalByDayViewProps {
  jadwalList: JadwalWithGuru[];
  onEdit: (jadwal: JadwalWithGuru) => void;
  onDelete: (jadwal: JadwalWithGuru) => void;
  onToggleActive: (jadwal: JadwalWithGuru) => void;
}

const dayColors: Record<number, { header: string; accent: string }> = {
  0: { header: "bg-red-500", accent: "border-l-red-500" },
  1: { header: "bg-blue-500", accent: "border-l-blue-500" },
  2: { header: "bg-green-500", accent: "border-l-green-500" },
  3: { header: "bg-yellow-500", accent: "border-l-yellow-500" },
  4: { header: "bg-purple-500", accent: "border-l-purple-500" },
  5: { header: "bg-orange-500", accent: "border-l-orange-500" },
  6: { header: "bg-pink-500", accent: "border-l-pink-500" },
};

export function JadwalByDayView({
  jadwalList,
  onEdit,
  onDelete,
  onToggleActive,
}: JadwalByDayViewProps) {
  const today = new Date().getDay();

  const groupedJadwal = useMemo(() => {
    const grouped = groupJadwalByHari(jadwalList);

    Object.keys(grouped).forEach((key) => {
      grouped[parseInt(key)] = sortJadwalByTime(grouped[parseInt(key)]);
    });

    return grouped;
  }, [jadwalList]);

  const daysWithJadwal = useMemo(() => {
    return HARI_OPTIONS.filter((day) => groupedJadwal[day.value]?.length > 0);
  }, [groupedJadwal]);

  if (daysWithJadwal.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Tidak ada jadwal untuk ditampilkan</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {daysWithJadwal.map((day) => {
        const dayJadwal = groupedJadwal[day.value] || [];
        const colors = dayColors[day.value] || dayColors[0];
        const isToday = today === day.value;
        const activeCount = dayJadwal.filter((j) => j.is_active).length;

        return (
          <Card
            key={day.value}
            className={cn(
              "overflow-hidden",
              isToday && "ring-2 ring-primary ring-offset-2"
            )}
          >
            <CardHeader
              className={cn(
                "py-3 text-white",
                colors.header
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  <CardTitle className="text-lg font-bold">
                    {day.label}
                  </CardTitle>
                  {isToday && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      Hari Ini
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {activeCount} aktif / {dayJadwal.length} total
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 divide-y">
              {dayJadwal.map((jadwal, index) => (
                <div
                  key={jadwal.id}
                  className={cn(
                    "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-l-4",
                    colors.accent,
                    !jadwal.is_active && "opacity-50 bg-muted/30"
                  )}
                >
                  <div className="flex-shrink-0 w-24 text-center">
                    <div className="bg-muted rounded-lg p-2">
                      <p className="font-mono text-sm font-bold">
                        {formatJam(jadwal.jam_mulai)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">sampai</p>
                      <p className="font-mono text-sm font-bold">
                        {formatJam(jadwal.jam_selesai)}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <p className="font-semibold truncate">
                            {jadwal.mapel || "Tidak ada mapel"}
                          </p>
                        </div>

                        {/* ✅ LOKASI BADGE - NEW! */}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {LOKASI_NAMES[jadwal.lokasi]}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <AvatarDisplay
                            name={jadwal.guru?.nama || "?"}
                            imageUrl={jadwal.guru?.foto_url}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="text-sm truncate">
                              {jadwal.guru?.nama || "Belum ada guru"}
                            </p>
                            {jadwal.guru?.jabatan && (
                              <p className="text-xs text-muted-foreground truncate">
                                {jadwal.guru.jabatan}
                              </p>
                            )}
                          </div>
                        </div>

                        {jadwal.keterangan && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            📝 {jadwal.keterangan}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={jadwal.is_active ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          jadwal.is_active && "bg-green-600"
                        )}
                      >
                        {jadwal.is_active ? "Aktif" : "Off"}
                      </Badge>
                      <Switch
                        checked={jadwal.is_active}
                        onCheckedChange={() => onToggleActive(jadwal)}
                      />
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(jadwal)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Jadwal
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleActive(jadwal)}>
                          <Power className="mr-2 h-4 w-4" />
                          {jadwal.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(jadwal)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus Jadwal
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}