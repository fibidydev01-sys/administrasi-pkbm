"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Camera,
  Download,
  Share,
  Plus,
} from "lucide-react";
import { useAuth, useMyJadwalToday } from "@/hooks";
import { detectBrowser } from "@/lib/browser-detection";
import { useSettingsStore } from "@/stores";
import {
  PageHeader,
  LoadingSpinner,
  TimeDisplay,
  EmptyJadwal,
} from "@/components/shared";
import { JadwalCard, AbsenForm } from "@/components/features/absen";
import { formatTanggal } from "@/lib/utils";
import { getHariName, getCurrentDayIndex } from "@/lib/jadwal";
import type { JadwalStatus } from "@/types";

export default function AbsenPage() {
  const { guru, isLoading: authLoading } = useAuth();
  const { settings, fetchSettings, isLoading: settingsLoading } = useSettingsStore();
  const { jadwalWithStatus, jadwalList, isLoading: jadwalLoading } = useMyJadwalToday(guru?.id);

  const [selectedJadwal, setSelectedJadwal] = useState<JadwalStatus | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const today = new Date();
  const todayName = getHariName(getCurrentDayIndex());
  const isLoading = authLoading || jadwalLoading || settingsLoading;

  const activeJadwal = jadwalWithStatus.filter(
    (j) => j.isWithinWindow && (j.canAbsenMasuk || j.canAbsenPulang)
  );
  const completedJadwal = jadwalWithStatus.filter(
    (j) => j.hasAbsenMasuk && j.hasAbsenPulang
  );
  const upcomingJadwal = jadwalWithStatus.filter(
    (j) => !j.isWithinWindow && !j.hasAbsenMasuk && !j.hasAbsenPulang
  );
  const waitingPulang = jadwalWithStatus.filter(
    (j) => j.hasAbsenMasuk && !j.hasAbsenPulang && !j.canAbsenPulang
  );

  const handleAbsen = (jadwalStatus: JadwalStatus) => {
    setSelectedJadwal(jadwalStatus);
    setShowForm(true);
  };

  const handleAbsenSuccess = () => {
    setShowForm(false);
    setSelectedJadwal(null);
  };

  const handleAbsenCancel = () => {
    setShowForm(false);
    setSelectedJadwal(null);
  };

  if (showForm && selectedJadwal) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader
          title={`Absen ${selectedJadwal.canAbsenMasuk ? "Masuk" : "Pulang"}`}
          backHref="/absen"
          backLabel="Kembali"
        />
        <AbsenForm
          jadwalStatus={selectedJadwal}
          onSuccess={handleAbsenSuccess}
          onCancel={handleAbsenCancel}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <InstallBanner />

      <div className="text-center">
        <h1 className="text-2xl font-bold">Absensi</h1>
        <p className="text-muted-foreground">
          {formatTanggal(today)}
        </p>
      </div>

      <Card>
        <CardContent className="py-6">
          <TimeDisplay showIcon showDate={false} />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Memuat jadwal..." />
        </div>
      ) : jadwalWithStatus.length === 0 ? (
        <EmptyJadwal />
      ) : (
        <>
          {activeJadwal.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 font-semibold text-green-600">
                <Camera className="h-5 w-5" />
                Sesi Aktif - Silakan Absen
              </h2>
              {activeJadwal.map((jadwalStatus) => (
                <JadwalCard
                  key={jadwalStatus.jadwal.id}
                  jadwalStatus={jadwalStatus}
                  onAbsen={() => handleAbsen(jadwalStatus)}
                />
              ))}
            </div>
          )}

          {waitingPulang.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 font-semibold text-blue-600">
                <Clock className="h-5 w-5" />
                Menunggu Waktu Pulang
              </h2>
              {waitingPulang.map((jadwalStatus) => (
                <JadwalCard
                  key={jadwalStatus.jadwal.id}
                  jadwalStatus={jadwalStatus}
                  onAbsen={() => { }}
                />
              ))}
            </div>
          )}

          {completedJadwal.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 font-semibold text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Absensi Selesai
              </h2>
              {completedJadwal.map((jadwalStatus) => (
                <JadwalCard
                  key={jadwalStatus.jadwal.id}
                  jadwalStatus={jadwalStatus}
                  onAbsen={() => { }}
                />
              ))}
            </div>
          )}

          {upcomingJadwal.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 font-semibold text-muted-foreground">
                <Calendar className="h-5 w-5" />
                Jadwal Berikutnya
              </h2>
              {upcomingJadwal.map((jadwalStatus) => (
                <JadwalCard
                  key={jadwalStatus.jadwal.id}
                  jadwalStatus={jadwalStatus}
                  onAbsen={() => { }}
                />
              ))}
            </div>
          )}

          {settings && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Absen dibuka <strong>{settings.toleransi_sebelum} menit</strong> sebelum
                dan <strong>{settings.toleransi_sesudah} menit</strong> setelah jam sesi.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}

// =============================================
// Install Banner - visible when app not installed
// =============================================
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [browserInfo, setBrowserInfo] = useState(() => detectBrowser());
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const info = detectBrowser();
    setBrowserInfo(info);
    if (info.isInStandaloneMode) {
      setInstalled(true);
      return;
    }

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed || browserInfo.isInStandaloneMode) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  // iOS Safari
  if (browserInfo.isIOS && browserInfo.isSafari) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <Download className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-xs text-green-800">
          Install app: tap <Share className="h-3 w-3 inline mx-0.5" /> lalu pilih <Plus className="h-3 w-3 inline mx-0.5" /> <strong>"Add to Home Screen"</strong>
        </AlertDescription>
      </Alert>
    );
  }

  // Chrome/Edge/Android — native install
  if (deferredPrompt) {
    return (
      <Alert
        className="border-green-200 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors"
        onClick={handleInstall}
      >
        <Download className="h-4 w-4 text-green-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-xs text-green-800">
            Install aplikasi untuk akses lebih cepat
          </span>
          <span className="text-xs font-semibold text-green-700 ml-2 shrink-0">
            Install
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  // No install prompt available (browser doesn't support or already captured)
  return null;
}