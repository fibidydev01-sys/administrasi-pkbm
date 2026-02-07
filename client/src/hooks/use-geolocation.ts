"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCurrentPosition,
  isGeolocationAvailable,
  requestGeolocationPermission,
} from "@/lib/geolocation";
import { reverseGeocode } from "@/lib/reverse-geocode";
import type { LocationData } from "@/types";

interface UseGeolocationReturn {
  location: LocationData | null;
  alamat: string | null;
  error: string | null;
  isLoading: boolean;
  isSupported: boolean;
  permissionState: PermissionState | null;
  refresh: () => Promise<void>;
}

export function useGeolocation(autoFetch: boolean = false): UseGeolocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [alamat, setAlamat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);

  useEffect(() => {
    setIsSupported(isGeolocationAvailable());
  }, []);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const state = await requestGeolocationPermission();
        setPermissionState(state);
      } catch {
        setPermissionState(null);
      }
    };

    if (isSupported) {
      checkPermission();
    }
  }, [isSupported]);

  const refresh = useCallback(async () => {
    if (!isSupported) {
      setError("Geolocation tidak didukung di browser ini");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getCurrentPosition();

      if (!result.success || !result.data) {
        setError(result.error || "Gagal mendapatkan lokasi");
        setLocation(null);
        setAlamat(null);
        return;
      }

      setLocation(result.data);
      setPermissionState("granted");

      try {
        const address = await reverseGeocode(
          result.data.latitude,
          result.data.longitude
        );
        setAlamat(address);
      } catch {
        setAlamat(
          `${result.data.latitude.toFixed(6)}, ${result.data.longitude.toFixed(6)}`
        );
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mendapatkan lokasi");
      console.error("Geolocation error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  useEffect(() => {
    if (autoFetch && isSupported) {
      refresh();
    }
  }, [autoFetch, isSupported, refresh]);

  return {
    location,
    alamat,
    error,
    isLoading,
    isSupported,
    permissionState,
    refresh,
  };
}

export function useWatchPosition() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  const startWatching = useCallback(() => {
    if (!isGeolocationAvailable()) {
      setError("Geolocation tidak didukung");
      return null;
    }

    setIsWatching(true);
    setError(null);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          isMock: false,
        });
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return watchId;
  }, []);

  const stopWatching = useCallback((watchId: number) => {
    navigator.geolocation.clearWatch(watchId);
    setIsWatching(false);
  }, []);

  return {
    location,
    error,
    isWatching,
    startWatching,
    stopWatching,
  };
}