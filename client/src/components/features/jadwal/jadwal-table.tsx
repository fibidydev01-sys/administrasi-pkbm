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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
  User,
  BookOpen,
} from "lucide-react";
import { getHariName } from "@/lib/jadwal";
import type { JadwalWithGuru } from "@/types";

interface JadwalTableProps {
  jadwalList: JadwalWithGuru[];
  onEdit: (jadwal: JadwalWithGuru) => void;
  onDelete: (jadwal: JadwalWithGuru) => void;
  isLoading?: boolean;
}

export function JadwalTable({ jadwalList, onEdit, onDelete, isLoading }: JadwalTableProps) {
  const formatTime = (time: string) => time.slice(0, 5);

  return (
    <>
      {/* MOBILE VIEW - Card List */}
      <div className="space-y-3 md:hidden">
        {jadwalList.map((jadwal) => (
          <Card key={jadwal.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-3">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    {/* Hari & Jam */}
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-medium">
                        {getHariName(jadwal.hari)}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(jadwal.jam_mulai)} - {formatTime(jadwal.jam_selesai)}
                      </span>
                    </div>

                    {/* Mapel */}
                    <p className="font-medium text-sm flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      {jadwal.mapel || "Tidak ada mapel"}
                    </p>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge
                      variant={jadwal.is_active ? "default" : "secondary"}
                      className={`text-xs ${jadwal.is_active ? "bg-green-600" : ""}`}
                    >
                      {jadwal.is_active ? "Aktif" : "Off"}
                    </Badge>

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
                        <DropdownMenuItem
                          onClick={() => onDelete(jadwal)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Guru Info */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                  <User className="h-3.5 w-3.5" />
                  <span className="truncate">
                    {jadwal.guru?.nama || "Belum ada guru"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {jadwalList.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data jadwal
          </div>
        )}
      </div>

      {/* DESKTOP VIEW - Table */}
      <div className="hidden md:block">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Hari</TableHead>
                <TableHead className="w-[140px]">Jam</TableHead>
                <TableHead>Guru</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jadwalList.map((jadwal) => (
                <TableRow key={jadwal.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {getHariName(jadwal.hari)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatTime(jadwal.jam_mulai)} - {formatTime(jadwal.jam_selesai)}
                  </TableCell>
                  <TableCell>
                    {jadwal.guru?.nama || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {jadwal.mapel || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={jadwal.is_active ? "default" : "secondary"}>
                      {jadwal.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(jadwal)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
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
              ))}

              {jadwalList.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Tidak ada data jadwal
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}