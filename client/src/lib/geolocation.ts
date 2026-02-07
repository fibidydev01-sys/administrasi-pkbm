import type { LocationData, GeolocationResult } from "@/types";

export async function getCurrentPosition(): Promise<GeolocationResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        data: null,
        error: "Geolocation tidak didukung di browser ini",
      });
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const isMock = detectMockLocation(position);
        resolve({
          success: true,
          data: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            isMock,
          },
          error: null,
        });
      },
      (error) => {
        let errorMessage = "Gagal mendapatkan lokasi";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Izin lokasi ditolak. Mohon aktifkan GPS.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Informasi lokasi tidak tersedia.";
            break;
          case error.TIMEOUT:
            errorMessage = "Waktu permintaan lokasi habis.";
            break;
        }
        resolve({ success: false, data: null, error: errorMessage });
      },
      options
    );
  });
}

function detectMockLocation(position: GeolocationPosition): boolean {
  const coords = position.coords;
  const suspiciousAccuracy = coords.accuracy < 5;
  const noAltitude = coords.altitude === null;
  return suspiciousAccuracy && noAltitude;
}

export function isGeolocationAvailable(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

export async function requestGeolocationPermission(): Promise<PermissionState> {
  if (!navigator.permissions) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve("granted"),
        () => resolve("denied"),
        { timeout: 5000 }
      );
    });
  }
  const result = await navigator.permissions.query({ name: "geolocation" });
  return result.state;
}

export function watchPosition(
  onSuccess: (data: LocationData) => void,
  onError: (error: string) => void
): number | null {
  if (!navigator.geolocation) {
    onError("Geolocation tidak didukung");
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        isMock: detectMockLocation(position),
      });
    },
    (error) => onError(error.message),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

export function clearWatch(watchId: number): void {
  navigator.geolocation.clearWatch(watchId);
}