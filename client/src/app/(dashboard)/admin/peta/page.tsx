"use client";

import { useEffect, useState } from "react";
import { PageHeader, LoadingSpinner } from "@/components/shared";
import { MapView } from "@/components/features/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingsStore } from "@/stores";
import { useRequireAdmin } from "@/hooks";
import { MapPin, Settings, Info, Navigation, Ruler, Link2 } from "lucide-react";

export default function PetaPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const { settings, fetchSettings, isLoading: settingsLoading } = useSettingsStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"jiwan" | "grobogan">("jiwan");

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ✅ Force refresh active map every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000); // 30 detik

    return () => clearInterval(interval);
  }, []);

  const openGoogleMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  };

  if (authLoading || settingsLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Memuat peta..." />
      </div>
    );
  }

  const hasJiwanLocation = settings?.jiwan_lat && settings?.jiwan_lng;
  const hasGroboganLocation = settings?.grobogan_lat && settings?.grobogan_lng;

  return (
    <div className="space-y-4 pb-28">
      <PageHeader
        title="Peta Lokasi Absensi"
        description="Lihat lokasi absensi guru hari ini secara realtime"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/admin/pengaturan"}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Atur Lokasi</span>
            <span className="sm:hidden">Atur</span>
          </Button>
        }
      />

      {/* ✅ TABS NAVIGATION */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "jiwan" | "grobogan")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="jiwan" className="gap-2">
            <MapPin className="h-4 w-4" />
            Jiwan
            {hasJiwanLocation && (
              <Badge variant="secondary" className="ml-1 bg-blue-600 text-white text-[10px] px-1.5 py-0">
                Aktif
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="grobogan" className="gap-2">
            <MapPin className="h-4 w-4" />
            Grobogan
            {hasGroboganLocation && (
              <Badge variant="secondary" className="ml-1 bg-green-600 text-white text-[10px] px-1.5 py-0">
                Aktif
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ✅ TAB CONTENT: JIWAN */}
        <TabsContent value="jiwan" className="space-y-4 mt-4">
          {/* Info Card */}
          <Card className="bg-blue-50/50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-blue-900">
                <MapPin className="h-5 w-5" />
                LOKASI JIWAN - MADIUN
                {hasJiwanLocation && (
                  <Badge variant="default" className="ml-auto bg-blue-600">
                    Aktif
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasJiwanLocation ? (
                <>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5" />
                        Latitude
                      </span>
                      <span className="font-mono font-medium text-blue-900">
                        {settings.jiwan_lat?.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5" />
                        Longitude
                      </span>
                      <span className="font-mono font-medium text-blue-900">
                        {settings.jiwan_lng?.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <Ruler className="h-3.5 w-3.5" />
                        Radius
                      </span>
                      <span className="font-medium text-blue-900">
                        {settings.jiwan_radius}m
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      openGoogleMaps(
                        settings.jiwan_lat!,
                        settings.jiwan_lng!,
                        "Lokasi Jiwan"
                      )
                    }
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Buka di Google Maps
                  </Button>
                </>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Lokasi Jiwan belum diatur. Silakan atur di halaman Pengaturan.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Map */}
          {hasJiwanLocation && (
            <MapView
              key={`jiwan-${refreshKey}`}
              title="Peta Lokasi Jiwan - Madiun"
              schoolLocation={{
                lat: settings.jiwan_lat!,
                lng: settings.jiwan_lng!,
                radius: settings.jiwan_radius || 100,
              }}
              filterLokasi="jiwan"
            />
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              💡 Peta diperbarui otomatis setiap 30 detik. Marker menampilkan lokasi
              absensi terakhir setiap guru hari ini di lokasi Jiwan.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* ✅ TAB CONTENT: GROBOGAN */}
        <TabsContent value="grobogan" className="space-y-4 mt-4">
          {/* Info Card */}
          <Card className="bg-green-50/50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-green-900">
                <MapPin className="h-5 w-5" />
                LOKASI GROBOGAN - MADIUN
                {hasGroboganLocation && (
                  <Badge variant="default" className="ml-auto bg-green-600">
                    Aktif
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasGroboganLocation ? (
                <>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5" />
                        Latitude
                      </span>
                      <span className="font-mono font-medium text-green-900">
                        {settings.grobogan_lat?.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5" />
                        Longitude
                      </span>
                      <span className="font-mono font-medium text-green-900">
                        {settings.grobogan_lng?.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <Ruler className="h-3.5 w-3.5" />
                        Radius
                      </span>
                      <span className="font-medium text-green-900">
                        {settings.grobogan_radius}m
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      openGoogleMaps(
                        settings.grobogan_lat!,
                        settings.grobogan_lng!,
                        "Lokasi Grobogan"
                      )
                    }
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Buka di Google Maps
                  </Button>
                </>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Lokasi Grobogan belum diatur. Silakan atur di halaman
                    Pengaturan.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Map */}
          {hasGroboganLocation && (
            <MapView
              key={`grobogan-${refreshKey}`}
              title="Peta Lokasi Grobogan - Madiun"
              schoolLocation={{
                lat: settings.grobogan_lat!,
                lng: settings.grobogan_lng!,
                radius: settings.grobogan_radius || 100,
              }}
              filterLokasi="grobogan"
            />
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              💡 Peta diperbarui otomatis setiap 30 detik. Marker menampilkan lokasi
              absensi terakhir setiap guru hari ini di lokasi Grobogan.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
