"use client";

import { useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, MoreVertical, MapPin } from "lucide-react";
import { useGuruStore } from "@/stores";
import { getGuruLokasiLabel } from "@/lib/guru-utils";
import type { Guru, JadwalWithGuru } from "@/types";

interface GuruListProps {
  data: Guru[];
  isLoading: boolean;
  onEdit: (guru: Guru) => void;
  jadwalList: JadwalWithGuru[];
}

export function GuruList({ data, isLoading, onEdit, jadwalList }: GuruListProps) {
  const { selectedIds, toggleSelectGuru, selectAllGuru } = useGuruStore();
  const selectAllRef = useRef<HTMLButtonElement>(null);

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      (selectAllRef.current as any).indeterminate = someSelected;
    }
  }, [someSelected]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-12">
        <p className="text-muted-foreground">Tidak ada data guru</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                ref={selectAllRef}
                checked={allSelected}
                onCheckedChange={() => selectAllGuru(data.map((g) => g.id))}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Guru</TableHead>
            <TableHead>Jabatan</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((guru) => (
            <TableRow key={guru.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(guru.id)}
                  onCheckedChange={() => toggleSelectGuru(guru.id)}
                  aria-label={`Select ${guru.nama}`}
                />
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{guru.nama}</span>
                    {guru.is_admin && (
                      <Badge variant="outline" className="text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {guru.email}
                  </span>
                </div>
              </TableCell>

              <TableCell>{guru.jabatan || "-"}</TableCell>

              <TableCell>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {getGuruLokasiLabel(guru, jadwalList)}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                {/* ✅ DIRECT EDIT BUTTON - No dropdown! */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(guru)}
                  className="h-8 w-8"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Edit guru</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}