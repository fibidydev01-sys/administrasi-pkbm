"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw, AlertTriangle, CheckCircle, Navigation } from "lucide-react";
import { useGeolocation } from "@/hooks";
import { cn } from "@/lib/utils";
import { formatDistance, calculateDistance } from "@/lib/utils";

interface LocationDisplayProps {
  schoolLat?: number | null;
  schoolLng?: number | null;
  radiusAbsen?: number;
  onLocationChange?: (data: {
    latitude: number;
    longitude: number;
    accuracy: number;
    alamat: string;
    isMock: boolean;
    isWithinRadius: boolean;
  }) => void;
  className?: string;
}

export function LocationDisplay({
  schoolLat,
  schoolLng,
  radiusAbsen = 100,
  onLocationChange,
  className,
}: LocationDisplayProps) {
  const { location, alamat, error, isLoading, refresh, permissionState } =
    useGeolocation(true); // Auto-fetch on mount

  const [hasReported, setHasReported] = useState(false);

  const hasSchoolLocation = schoolLat != null && schoolLng != null;

  // Calculate distance from school
  const distance = hasSchoolLocation && location
    ? calculateDistance(location.latitude, location.longitude, schoolLat!, schoolLng!)
    : null;

  const isWithinRadius = distance !== null && distance <= radiusAbsen;

  // Report location change to parent
  useEffect(() => {
    if (location && alamat !== null && onLocationChange) {
      onLocationChange({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        alamat: alamat || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
        isMock: location.isMock,
        isWithinRadius: hasSchoolLocation ? isWithinRadius : true,
      });
      setHasReported(true);
    }
  }, [location, alamat, isWithinRadius, hasSchoolLocation, onLocationChange]);

  return (
    <Card className={cn(className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Location icon */}
          <div
            className={cn(
              "rounded-full p-2 flex-shrink-0",
              location
                ? isWithinRadius || !hasSchoolLocation
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-600"
                : error
                  ? "bg-red-100 text-red-600"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {location ? (
              <MapPin className="h-5 w-5" />
            ) : error ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Navigation className="h-5 w-5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-sm">Lokasi Anda</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
                className="h-8 px-2"
              >
                <RefreshCw
                  className={cn("h-4 w-4", isLoading && "animate-spin")}
                />
                <span className="ml-1 text-xs">Refresh</span>
              </Button>
            </div>

            {/* Loading state */}
            {isLoading && !location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Mendapatkan lokasi...</span>
              </div>
            )}

            {/* Error state */}
            {error && !location && (
              <div className="space-y-2">
                <p className="text-sm text-destructive">{error}</p>
                {permissionState === "denied" && (
                  <p className="text-xs text-muted-foreground">
                    Aktifkan izin lokasi di pengaturan browser untuk melanjutkan.
                  </p>
                )}
              </div>
            )}

            {/* Success state */}
            {location && (
              <div className="space-y-2">
                {/* Address */}
                <p className="text-sm truncate" title={alamat || undefined}>
                  {alamat || "Memuat alamat..."}
                </p>

                {/* Coordinates & accuracy */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </span>
                  <span>Akurasi: ±{Math.round(location.accuracy)}m</span>
                </div>

                {/* Distance from school */}
                {hasSchoolLocation && distance !== null && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">
                      Jarak ke sekolah: {formatDistance(distance)}
                    </span>
                  </div>
                )}

                {/* Status badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {/* Within radius status */}
                  {hasSchoolLocation && (
                    <div
                      className={cn(
                        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                        isWithinRadius
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      )}
                    >
                      {isWithinRadius ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Dalam radius
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3" />
                          Di luar radius ({formatDistance(distance! - radiusAbsen)} lebih)
                        </>
                      )}
                    </div>
                  )}

                  {/* Mock location warning */}
                  {location.isMock && (
                    <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
                      <AlertTriangle className="h-3 w-3" />
                      Fake GPS Terdeteksi!
                    </div>
                  )}

                  {/* Valid location */}
                  {!location.isMock && (
                    <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3" />
                      Lokasi Valid
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}