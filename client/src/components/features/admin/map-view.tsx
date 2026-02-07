"use client";

import { useState, useEffect, useMemo } from "react";
import { MapPin, RefreshCw, Users, School, LogIn, LogOut, Clock, AlertTriangle, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Map as LeafletMap, MapMarker, MapPopup, MapTileLayer, MapZoomControl } from "@/components/ui/map";
import { createClient } from "@/lib/supabase/client";
import { getToday, formatWaktu } from "@/lib/utils";
import type { AbsensiWithGuru, LokasiType } from "@/types";
import { toast } from "sonner";

interface MapViewProps {
  title?: string;
  schoolLocation?: {
    lat: number;
    lng: number;
    radius: number;
  };
  filterLokasi?: LokasiType;
}

export function MapView({ title, schoolLocation, filterLokasi }: MapViewProps) {
  const [absensiData, setAbsensiData] = useState<AbsensiWithGuru[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const defaultCenter = useMemo(() => {
    if (schoolLocation?.lat && schoolLocation?.lng) {
      return { lat: schoolLocation.lat, lng: schoolLocation.lng };
    }
    return { lat: -7.6, lng: 111.5 };
  }, [schoolLocation]);

  const fetchData = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const today = getToday();

    try {
      let query = supabase
        .from("absensi")
        .select(`
          *,
          guru:guru_id (
            id,
            nama,
            foto_url,
            jabatan
          ),
          jadwal:jadwal_id (
            id,
            lokasi
          )
        `)
        .eq("tanggal", today)
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("timestamp", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = (data as any[]) || [];

      if (filterLokasi) {
        filteredData = filteredData.filter(
          (item) => item.jadwal?.lokasi === filterLokasi
        );
      }

      setAbsensiData(filteredData as AbsensiWithGuru[]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching map data:", error);
      setAbsensiData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Initial fetch
  useEffect(() => {
    fetchData();
  }, [filterLokasi]);

  // ✅ REALTIME SUBSCRIPTION
  useEffect(() => {
    const supabase = createClient();
    const today = getToday();

    const channel = supabase
      .channel(`map-absensi-${filterLokasi || "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "absensi",
          filter: `tanggal=eq.${today}`,
        },
        (payload) => {
          console.log("🔴 Realtime update:", payload);

          // Refresh data when there's a change
          fetchData();

          // Show toast notification
          if (payload.eventType === "INSERT") {
            toast.success("Absensi baru ditambahkan", {
              description: "Peta diperbarui",
              duration: 3000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filterLokasi]);

  const markers = useMemo(() => {
    const guruMap = new Map<string, AbsensiWithGuru>();

    absensiData.forEach((item) => {
      const existing = guruMap.get(item.guru_id);
      if (!existing || new Date(item.timestamp) > new Date(existing.timestamp)) {
        guruMap.set(item.guru_id, item);
      }
    });

    return Array.from(guruMap.values());
  }, [absensiData]);

  const masukCount = absensiData.filter((a) => a.tipe === "masuk").length;
  const pulangCount = absensiData.filter((a) => a.tipe === "pulang").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            {title || "Peta Lokasi Absensi Hari Ini"}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm pt-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{markers.length} guru</span>
          </div>
          <Badge variant="default" className="bg-green-600">
            {masukCount} Masuk
          </Badge>
          <Badge variant="secondary">{pulangCount} Pulang</Badge>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
            <Clock className="h-3 w-3" />
            Update: {lastUpdate.toLocaleTimeString("id-ID")}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full h-[500px] rounded-lg" />
        ) : (
          <div className="w-full h-[500px] rounded-lg overflow-hidden border shadow-sm">
            <LeafletMap
              center={[defaultCenter.lat, defaultCenter.lng]}
              zoom={schoolLocation ? 16 : 12}
            >
              <MapTileLayer />
              <MapZoomControl />

              {/* ✅ MARKER SEKOLAH */}
              {schoolLocation && (
                <MapMarker position={[schoolLocation.lat, schoolLocation.lng]}>
                  <MapPopup>
                    <div className="text-center p-2">
                      <School className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <p className="font-semibold">{title || "Lokasi Sekolah"}</p>
                      <p className="text-sm text-gray-600">
                        Radius: {schoolLocation.radius}m
                      </p>
                    </div>
                  </MapPopup>
                </MapMarker>
              )}

              {/* ✅ MARKER ABSENSI */}
              {markers.map((item) => (
                <MapMarker
                  key={item.id}
                  position={[item.latitude!, item.longitude!]}
                >
                  <MapPopup>
                    <div className="min-w-[220px] p-3 space-y-3">
                      {/* Header — nama + status dot */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${item.tipe === "masuk"
                              ? "bg-green-500"
                              : "bg-purple-500"
                              }`}
                          />
                          <span className="font-semibold text-sm text-gray-800">
                            {item.guru?.nama || "Unknown"}
                          </span>
                        </div>
                        {item.is_mock_location && (
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                      </div>

                      {/* Jabatan */}
                      {item.guru?.jabatan && (
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-500">
                            {item.guru.jabatan}
                          </span>
                        </div>
                      )}

                      {/* Divider */}
                      <div className="border-t" />

                      {/* Status + Waktu */}
                      <div className="flex items-center gap-2">
                        {item.tipe === "masuk" ? (
                          <LogIn className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        ) : (
                          <LogOut className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                        )}
                        <span
                          className={`text-xs font-medium ${item.tipe === "masuk"
                            ? "text-green-600"
                            : "text-purple-600"
                            }`}
                        >
                          {item.tipe === "masuk" ? "Masuk" : "Pulang"}
                        </span>
                        <span className="text-gray-300">|</span>
                        <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-500">
                          {formatWaktu(item.waktu)}
                        </span>
                      </div>

                      {/* Alamat */}
                      {item.alamat && (
                        <div className="flex items-start gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-500 leading-relaxed">
                            {item.alamat}
                          </span>
                        </div>
                      )}

                      {/* Fake GPS warning */}
                      {item.is_mock_location && (
                        <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded px-2 py-1">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          <span className="text-xs text-red-600 font-medium">
                            Fake GPS Detected
                          </span>
                        </div>
                      )}
                    </div>
                  </MapPopup>
                </MapMarker>
              ))}
            </LeafletMap>
          </div>
        )}

        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Absen Masuk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Absen Pulang</span>
          </div>
          {schoolLocation && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Sekolah</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}