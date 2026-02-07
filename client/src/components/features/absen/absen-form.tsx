"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { CameraCapture } from "./camera-capture";
import { LocationDisplay } from "./location-display";
import { AbsenSuccess } from "./absen-success";
import { useAbsenStore, useSettingsStore } from "@/stores";
import { useAuth } from "@/hooks";
import { getDeviceInfo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { JadwalStatus } from "@/types";

interface AbsenFormProps {
  jadwalStatus: JadwalStatus;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  alamat: string;
  isMock: boolean;
  isWithinRadius: boolean;
}

export function AbsenForm({
  jadwalStatus,
  onSuccess,
  onCancel,
  className,
}: AbsenFormProps) {
  const { guru } = useAuth();
  const { settings } = useSettingsStore();
  const { submitAbsen, fotoBlob, fotoPreviewUrl, setFoto, clearFoto, isSubmitting } =
    useAbsenStore();

  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { jadwal, canAbsenMasuk, canAbsenPulang } = jadwalStatus;
  const tipe = canAbsenMasuk ? "masuk" : "pulang";

  const schoolLat = jadwal.lokasi === "jiwan" ? settings?.jiwan_lat : settings?.grobogan_lat;
  const schoolLng = jadwal.lokasi === "jiwan" ? settings?.jiwan_lng : settings?.grobogan_lng;
  const radiusAbsen = jadwal.lokasi === "jiwan" ? settings?.jiwan_radius : settings?.grobogan_radius;

  const handleLocationChange = useCallback((data: LocationState) => {
    setLocation(data);
    setError(null);
  }, []);

  const handleCapture = useCallback(
    (blob: Blob, previewUrl: string) => {
      setFoto(blob, previewUrl);
      setError(null);
    },
    [setFoto]
  );

  const handleClearFoto = useCallback(() => {
    clearFoto();
  }, [clearFoto]);

  const canSubmit =
    !isSubmitting &&
    fotoBlob &&
    location &&
    !location.isMock &&
    (canAbsenMasuk || canAbsenPulang);

  const handleSubmit = async () => {
    if (!guru || !location || !fotoBlob) {
      setError("Lengkapi foto dan lokasi terlebih dahulu");
      return;
    }

    if (location.isMock) {
      setError("Terdeteksi lokasi palsu. Absen tidak dapat dilakukan.");
      return;
    }

    setError(null);

    const result = await submitAbsen({
      guru_id: guru.id,
      jadwal_id: jadwal.id,
      tipe,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      alamat: location.alamat,
      is_mock_location: location.isMock,
      device_info: getDeviceInfo(),
    });

    if (result.success) {
      setSuccess(true);
      // Auto redirect after 3 seconds
      setTimeout(() => {
        onSuccess?.();
      }, 3000);
    } else {
      setError(result.error || "Gagal menyimpan absensi");
    }
  };

  // ✅ SUCCESS SCREEN with Lottie
  if (success) {
    return (
      <AbsenSuccess
        tipe={tipe}
        onDone={onSuccess}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            Absen {tipe === "masuk" ? "Masuk" : "Pulang"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {jadwal.mapel || "Sesi Mengajar"} • {jadwal.jam_mulai.slice(0, 5)} - {jadwal.jam_selesai.slice(0, 5)}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Foto Selfie <span className="text-destructive">*</span>
            </label>
            <CameraCapture
              onCapture={handleCapture}
              onClear={handleClearFoto}
              previewUrl={fotoPreviewUrl}
              disabled={isSubmitting}
            />
            {!fotoBlob && (
              <p className="mt-1 text-xs text-muted-foreground">
                Ambil foto selfie untuk verifikasi kehadiran
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Lokasi <span className="text-destructive">*</span>
            </label>
            <LocationDisplay
              schoolLat={schoolLat}
              schoolLng={schoolLng}
              radiusAbsen={radiusAbsen}
              onLocationChange={handleLocationChange}
            />
          </div>

          {location?.isMock && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Terdeteksi penggunaan lokasi palsu (fake GPS). Absen tidak dapat dilakukan.
              </AlertDescription>
            </Alert>
          )}

          {location && !location.isWithinRadius && schoolLat && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Anda berada di luar radius sekolah ({radiusAbsen}m).
                Absen tetap dapat dilakukan tetapi akan ditandai.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg bg-muted p-3 text-sm">
            <div className="flex items-center gap-2">
              <span className={fotoBlob ? "text-green-600" : "text-muted-foreground"}>
                {fotoBlob ? "✓" : "○"} Foto
              </span>
              <span className={location ? "text-green-600" : "text-muted-foreground"}>
                {location ? "✓" : "○"} Lokasi
              </span>
              {location && !location.isMock && (
                <span className="text-green-600">✓ Valid</span>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                `Simpan Absen ${tipe === "masuk" ? "Masuk" : "Pulang"}`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}