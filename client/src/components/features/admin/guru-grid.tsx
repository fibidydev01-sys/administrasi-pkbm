"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, MoreVertical, MapPin } from "lucide-react";
import { AvatarDisplay } from "@/components/shared";
import { useGuruStore } from "@/stores";
import { getGuruLokasiLabel } from "@/lib/guru-utils";
import type { Guru, JadwalWithGuru } from "@/types";

interface GuruGridProps {
  data: Guru[];
  isLoading: boolean;
  onEdit: (guru: Guru) => void;
  jadwalList: JadwalWithGuru[];
}

export function GuruGrid({ data, isLoading, onEdit, jadwalList }: GuruGridProps) {
  const { selectedIds, toggleSelectGuru } = useGuruStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-12">
        <p className="text-muted-foreground">Tidak ada data guru</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((guru) => {
        const lokasiLabel = getGuruLokasiLabel(guru, jadwalList);
        const isSelected = selectedIds.includes(guru.id);

        return (
          <Card
            key={guru.id}
            className={`relative p-6 hover:shadow-md transition-shadow ${isSelected ? "ring-2 ring-primary" : ""
              }`}
          >
            {/* Checkbox - Top Left */}
            <div className="absolute top-3 left-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleSelectGuru(guru.id)}
                aria-label={`Select ${guru.nama}`}
              />
            </div>

            {/* Edit Button - Top Right */}
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(guru)}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Edit guru</span>
              </Button>
            </div>

            {/* Content - Centered */}
            <div className="flex flex-col items-center text-center space-y-3 mt-4">
              {/* Avatar */}
              <AvatarDisplay
                name={guru.nama}
                imageUrl={guru.foto_url}
                size="lg"
              />

              {/* Nama + Admin Badge */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="font-semibold text-base leading-tight">
                    {guru.nama}
                  </h3>
                  {guru.is_admin && (
                    <Badge variant="outline" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {guru.email}
                </p>
              </div>

              {/* Lokasi Badge */}
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">
                  {lokasiLabel}
                </Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}