"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  BellOff,
  BellRing,
  Volume2,
  VolumeX,
  CheckCircle,
  XCircle,
  Smartphone,
} from "lucide-react";
import { useNotificationContext } from "@/components/providers";
import { cn } from "@/lib/utils";

export function NotificationPanel() {
  const { permission, isSupported, requestPermission, sendNotification, playSound } =
    useNotificationContext();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    await requestPermission();
    setIsRequesting(false);
  };

  const handleTestNotification = async () => {
    await sendNotification({
      title: "Test Notifikasi",
      body: "Ini adalah test notifikasi dari sistem absensi Yayasan",
      url: "/admin/rekap",
      playSound: soundEnabled,
    });
  };

  const handleTestSound = () => {
    playSound();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5" />
          Pengaturan Notifikasi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            {permission === "granted" ? (
              <div className="p-2 bg-green-100 rounded-full">
                <BellRing className="h-5 w-5 text-green-600" />
              </div>
            ) : permission === "denied" ? (
              <div className="p-2 bg-red-100 rounded-full">
                <BellOff className="h-5 w-5 text-red-600" />
              </div>
            ) : (
              <div className="p-2 bg-yellow-100 rounded-full">
                <Bell className="h-5 w-5 text-yellow-600" />
              </div>
            )}
            <div>
              <p className="font-medium text-sm">Status Notifikasi</p>
              <p className="text-xs text-muted-foreground">
                {!isSupported
                  ? "Browser tidak mendukung"
                  : permission === "granted"
                    ? "Aktif - Anda akan menerima notifikasi"
                    : permission === "denied"
                      ? "Diblokir - Aktifkan di pengaturan browser"
                      : "Belum diaktifkan"}
              </p>
            </div>
          </div>
          <Badge
            variant={permission === "granted" ? "default" : "secondary"}
            className={cn(
              permission === "granted" && "bg-green-600",
              permission === "denied" && "bg-red-600 text-white"
            )}
          >
            {permission === "granted" ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Aktif
              </>
            ) : permission === "denied" ? (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Diblokir
              </>
            ) : (
              "Belum Aktif"
            )}
          </Badge>
        </div>

        {/* Enable Button */}
        {permission === "default" && isSupported && (
          <Button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Bell className="h-4 w-4 mr-2" />
            {isRequesting ? "Meminta izin..." : "Aktifkan Notifikasi"}
          </Button>
        )}

        {/* Denied - Instructions */}
        {permission === "denied" && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium mb-1">
              Notifikasi Diblokir
            </p>
            <p className="text-xs text-red-600">
              Untuk mengaktifkan, klik ikon gembok/info di address bar browser, lalu
              izinkan notifikasi.
            </p>
          </div>
        )}

        {/* Sound Toggle */}
        {permission === "granted" && (
          <>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-sm">Suara Notifikasi</p>
                  <p className="text-xs text-muted-foreground">
                    Putar suara saat notifikasi masuk
                  </p>
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>

            {/* Test Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestSound}
                className="flex-1"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Test Suara
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                className="flex-1"
              >
                <BellRing className="h-4 w-4 mr-2" />
                Test Notifikasi
              </Button>
            </div>
          </>
        )}

        {/* PWA Install Hint */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Install Aplikasi</p>
            <p className="text-xs text-blue-600">
              Untuk pengalaman terbaik, install aplikasi ini ke home screen HP Anda.
              Notifikasi akan bekerja lebih baik di mode aplikasi.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}