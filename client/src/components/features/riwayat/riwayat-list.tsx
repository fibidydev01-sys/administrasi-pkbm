"use client";

import { useState, useEffect, useMemo } from "react";
import { MapPin, Clock, Image as ImageIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EmptyState,
  LoadingSpinner,
} from "@/components/shared";
import { RiwayatFilter, type RiwayatFilterValues } from "./riwayat-filter";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores";
import { formatTanggalPendek, formatTimestamp } from "@/lib/utils";
import type { Absensi } from "@/types";

const defaultFilters: RiwayatFilterValues = {
  startDate: undefined,
  endDate: undefined,
  status: "all",
};

export function RiwayatList() {
  const { guru } = useAuthStore();
  const [riwayat, setRiwayat] = useState<Absensi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<RiwayatFilterValues>(defaultFilters);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch riwayat
  useEffect(() => {
    const fetchRiwayat = async () => {
      if (!guru?.id) return;

      setIsLoading(true);
      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from("absensi")
          .select("*")
          .eq("guru_id", guru.id)
          .order("timestamp", { ascending: false })
          .limit(100);

        if (error) throw error;
        setRiwayat(data || []);
      } catch (error) {
        console.error("Error fetching riwayat:", error);
        setRiwayat([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiwayat();
  }, [guru?.id]);

  // Filter data
  const filteredRiwayat = useMemo(() => {
    return riwayat.filter((item) => {
      // Date filter
      if (filters.startDate) {
        const itemDate = new Date(item.tanggal);
        if (itemDate < filters.startDate) return false;
      }
      if (filters.endDate) {
        const itemDate = new Date(item.tanggal);
        if (itemDate > filters.endDate) return false;
      }

      // Status filter
      if (filters.status !== "all" && item.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [riwayat, filters]);

  // Group by date AND jadwal_id, show only 'masuk'
  const groupedRiwayat = useMemo(() => {
    const groups: Record<string, Absensi[]> = {};

    // Only show 'masuk' records, one per tanggal+jadwal_id
    const sessionGroups = new Map<string, Absensi>();

    filteredRiwayat.forEach((item) => {
      // Only process 'masuk' type
      if (item.tipe === "masuk") {
        const sessionKey = `${item.tanggal}-${item.jadwal_id}`;
        if (!sessionGroups.has(sessionKey)) {
          sessionGroups.set(sessionKey, item);
        }
      }
    });

    // Then group by date for display
    Array.from(sessionGroups.values()).forEach((item) => {
      const dateKey = item.tanggal;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    // Sort each group by timestamp
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    });

    return groups;
  }, [filteredRiwayat]);

  const dateKeys = Object.keys(groupedRiwayat).sort((a, b) =>
    b.localeCompare(a)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Memuat riwayat..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <Card>
        <CardContent className="pt-4">
          <RiwayatFilter
            values={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
          />
        </CardContent>
      </Card>

      {/* List */}
      {dateKeys.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat"
          description={
            filters.startDate || filters.endDate || filters.status !== "all"
              ? "Tidak ada data dengan filter yang dipilih"
              : "Riwayat absensi Anda akan muncul di sini"
          }
        />
      ) : (
        <div className="space-y-4">
          {dateKeys.map((dateKey) => (
            <div key={dateKey}>
              {/* Date header */}
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 sticky top-0 bg-background py-1">
                {formatTanggalPendek(dateKey)}
              </h3>

              {/* Items for this date */}
              <div className="space-y-2">
                {groupedRiwayat[dateKey].map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        {/* Photo thumbnail */}
                        {item.foto_url ? (
                          <button
                            onClick={() => setSelectedImage(item.foto_url)}
                            className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={item.foto_url}
                              alt="Foto absen"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ) : (
                          <div className="flex-shrink-0 w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimestamp(item.timestamp)}
                            </Badge>
                          </div>

                          {item.alamat && (
                            <div className="flex items-start gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{item.alamat}</span>
                            </div>
                          )}

                          {item.catatan && (
                            <p className="text-xs text-muted-foreground italic">
                              Catatan: {item.catatan}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image preview dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Foto Absen</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Foto absen"
              className="w-full rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}