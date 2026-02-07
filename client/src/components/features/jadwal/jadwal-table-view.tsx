"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Power,
  CheckCircle,
  XCircle,
  MapPin,
} from "lucide-react";
import { AvatarDisplay } from "@/components/shared";
import { getHariName, formatJam } from "@/lib/jadwal";
import { cn } from "@/lib/utils";
import { LOKASI_NAMES } from "@/types";
import type { JadwalWithGuru } from "@/types";

interface JadwalTableViewProps {
  jadwalList: JadwalWithGuru[];
  onEdit: (jadwal: JadwalWithGuru) => void;
  onDelete: (jadwal: JadwalWithGuru) => void;
  onToggleActive: (jadwal: JadwalWithGuru) => void;
}

const dayBadgeColors: Record<number, string> = {
  0: "bg-red-100 text-red-700 border-red-200",
  1: "bg-blue-100 text-blue-700 border-blue-200",
  2: "bg-green-100 text-green-700 border-green-200",
  3: "bg-yellow-100 text-yellow-700 border-yellow-200",
  4: "bg-purple-100 text-purple-700 border-purple-200",
  5: "bg-orange-100 text-orange-700 border-orange-200",
  6: "bg-pink-100 text-pink-700 border-pink-200",
};

export function JadwalTableView({
  jadwalList,
  onEdit,
  onDelete,
  onToggleActive,
}: JadwalTableViewProps) {
  const isToday = (hari: number) => new Date().getDay() === hari;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[120px]">Hari</TableHead>
                <TableHead className="w-[140px]">Jam</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Guru</TableHead>
                <TableHead className="w-[100px] text-center">Status</TableHead>
                <TableHead className="w-[100px] text-center">Aktif</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jadwalList.map((jadwal) => {
                const today = isToday(jadwal.hari);
                const badgeColor = dayBadgeColors[jadwal.hari] || dayBadgeColors[0];

                return (
                  <TableRow
                    key={jadwal.id}
                    className={cn(
                      !jadwal.is_active && "opacity-50 bg-muted/30",
                      today && jadwal.is_active && "bg-primary/5"
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("font-medium", badgeColor)}
                        >
                          {getHariName(jadwal.hari)}
                        </Badge>
                        {today && jadwal.is_active && (
                          <span className="text-[10px] text-primary font-medium">
                            Hari ini
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-sm font-medium">
                        {formatJam(jadwal.jam_mulai)} - {formatJam(jadwal.jam_selesai)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {jadwal.mapel || <span className="text-muted-foreground">-</span>}
                        </p>
                        {/* ✅ LOKASI BADGE - NEW! */}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {LOKASI_NAMES[jadwal.lokasi]}
                          </Badge>
                          {jadwal.keterangan && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {jadwal.keterangan}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AvatarDisplay
                          name={jadwal.guru?.nama || "?"}
                          imageUrl={jadwal.guru?.foto_url}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {jadwal.guru?.nama || "-"}
                          </p>
                          {jadwal.guru?.jabatan && (
                            <p className="text-xs text-muted-foreground truncate">
                              {jadwal.guru.jabatan}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {jadwal.is_active ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-400 mx-auto" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {jadwal.is_active ? "Jadwal Aktif" : "Jadwal Nonaktif"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    <TableCell className="text-center">
                      <Switch
                        checked={jadwal.is_active}
                        onCheckedChange={() => onToggleActive(jadwal)}
                      />
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(jadwal)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
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
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}