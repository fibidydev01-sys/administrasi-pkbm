// src/components/shared/offline-detector.tsx
"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Offline Detector Component
 * Shows real-time network status like WhatsApp's "No Internet" indicator
 *
 * Features:
 * - Detects online/offline status
 * - Shows alert when offline
 * - Shows "Back Online" notification when connection restored
 * - Auto-hides after 5 seconds when back online
 * - Clean UI with Wifi icons only (no emoji/warning icons)
 * - SOLID background (NO transparency!)
 */
export function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);

    // Handler when connection restored
    const handleOnline = () => {
      setIsOnline(true);

      // Show "Back Online" notification only if was offline before
      if (wasOffline) {
        setShowOfflineAlert(true);

        // Auto hide after 5 seconds
        setTimeout(() => {
          setShowOfflineAlert(false);
          setWasOffline(false);
        }, 5000);
      }
    };

    // Handler when connection lost
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowOfflineAlert(true);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  // Don't show anything if online and no recent offline event
  if (isOnline && !showOfflineAlert) return null;

  return (
    <div
      className="fixed top-4 left-4 right-4 z-[9999] animate-in slide-in-from-top-5 duration-300"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className={`
          flex items-center justify-between
          px-4 py-3 rounded-lg shadow-2xl
          border-2
          ${isOnline
            ? 'bg-green-100 border-green-300 text-green-900'
            : 'bg-red-100 border-red-300 text-red-900'
          }
        `}
        style={{
          backgroundColor: isOnline ? '#dcfce7' : '#fee2e2',
          opacity: 1,
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-700 flex-shrink-0" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-700 flex-shrink-0" />
          )}

          <p className={`text-sm font-semibold ${isOnline ? 'text-green-900' : 'text-red-900'}`}>
            {isOnline ? (
              "Koneksi internet tersambung kembali"
            ) : (
              "Tidak ada koneksi internet"
            )}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 flex-shrink-0 hover:bg-white/50 ${
            isOnline ? 'text-green-700 hover:text-green-900' : 'text-red-700 hover:text-red-900'
          }`}
          onClick={() => setShowOfflineAlert(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
