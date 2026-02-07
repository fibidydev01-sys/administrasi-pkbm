"use client";

import { Card, CardContent } from "@/components/ui/card";
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
  Clock,
  User,
  BookOpen,
  Power,
  Calendar,
  MapPin,
} from "lucide-react";
import { AvatarDisplay } from "@/components/shared";
import { getHariName, formatJam } from "@/lib/jadwal";
import { cn } from "@/lib/utils";
import { LOKASI_NAMES } from "@/types";
import type { JadwalWithGuru } from "@/types";

interface JadwalCardGridProps {
  jadwalList: JadwalWithGuru[];
  onEdit: (jadwal: JadwalWithGuru) => void;
  onDelete: (jadwal: JadwalWithGuru) => void;
  onToggleActive: (jadwal: JadwalWithGuru) => void;
}

const dayColors: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  1: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  2: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  3: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  4: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  5: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  6: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
};

export function JadwalCardGrid({
  jadwalList,
  onEdit,
  onDelete,
  onToggleActive,
}: JadwalCardGridProps) {
  const isToday = (hari: number) => new Date().getDay() === hari;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {jadwalList.map((jadwal) => {
        const colors = dayColors[jadwal.hari] || dayColors[0];
        const today = isToday(jadwal.hari);

        return (
          <Card
            key={jadwal.id}
            className={cn(
              "overflow-hidden transition-all hover:shadow-md",
              !jadwal.is_active && "opacity-60",
              today && jadwal.is_active && "ring-2 ring-primary ring-offset-2"
            )}
          >
            <div className={cn("px-4 py-2 border-b", colors.bg, colors.border)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className={cn("h-4 w-4", colors.text)} />
                  <span className={cn("font-semibold text-sm", colors.text)}>
                    {getHariName(jadwal.hari)}
                  </span>
                  {today && jadwal.is_active && (
                    <Badge variant="default" className="text-[10px] h-5">
                      Hari Ini
                    </Badge>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
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

            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {formatJam(jadwal.jam_mulai)} - {formatJam(jadwal.jam_selesai)}
                  </p>
                  <p className="text-xs text-muted-foreground">Jam Mengajar</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {jadwal.mapel || "Tidak ada mapel"}
                  </p>
                  {jadwal.keterangan && (
                    <p className="text-xs text-muted-foreground truncate">
                      {jadwal.keterangan}
                    </p>
                  )}
                  {/* ✅ LOKASI BADGE - NEW! */}
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {LOKASI_NAMES[jadwal.lokasi]}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t">
                <AvatarDisplay
                  name={jadwal.guru?.nama || "?"}
                  imageUrl={jadwal.guru?.foto_url}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {jadwal.guru?.nama || "Belum ada guru"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {jadwal.guru?.jabatan || "Guru"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge
                    variant={jadwal.is_active ? "default" : "secondary"}
                    className={jadwal.is_active ? "bg-green-600" : ""}
                  >
                    {jadwal.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
                <Switch
                  checked={jadwal.is_active}
                  onCheckedChange={() => onToggleActive(jadwal)}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}