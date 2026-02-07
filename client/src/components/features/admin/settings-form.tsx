"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Clock, MapPin, Info } from "lucide-react";
import { useRequireAdmin } from "@/hooks";
import { useSettingsStore } from "@/stores";
import { PageHeader, LoadingSpinner, NotificationPanel } from "@/components/shared";
import { settingsSchema, type SettingsFormDataSchema } from "@/lib/validators";
import { toast } from "sonner";

export default function AdminPengaturanPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const { settings, fetchSettings, updateSettings, isLoading, isSubmitting } = useSettingsStore();

  const form = useForm<SettingsFormDataSchema>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      nama_sekolah: "",
      alamat_sekolah: "",
      toleransi_sebelum: 15,
      toleransi_sesudah: 10,
      auto_pulang: true,
      jiwan_lat: null,
      jiwan_lng: null,
      jiwan_radius: 100,
      grobogan_lat: null,
      grobogan_lng: null,
      grobogan_radius: 100,
    },
  });

  useEffect(() => {
    if (!authLoading) {
      fetchSettings();
    }
  }, [authLoading, fetchSettings]);

  useEffect(() => {
    if (settings) {
      form.reset({
        nama_sekolah: settings.nama_sekolah,
        alamat_sekolah: settings.alamat_sekolah || "",
        toleransi_sebelum: settings.toleransi_sebelum,
        toleransi_sesudah: settings.toleransi_sesudah,
        auto_pulang: settings.auto_pulang,
        jiwan_lat: settings.jiwan_lat,
        jiwan_lng: settings.jiwan_lng,
        jiwan_radius: settings.jiwan_radius,
        grobogan_lat: settings.grobogan_lat,
        grobogan_lng: settings.grobogan_lng,
        grobogan_radius: settings.grobogan_radius,
      });
    }
  }, [settings, form]);

  const handleSubmit = async (data: SettingsFormDataSchema) => {
    const result = await updateSettings(data);
    if (result.success) {
      toast.success("Pengaturan berhasil disimpan");
    } else {
      toast.error(result.error || "Gagal menyimpan pengaturan");
    }
  };

  const handleGetJiwanLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung di browser ini");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("jiwan_lat", position.coords.latitude);
        form.setValue("jiwan_lng", position.coords.longitude);
        toast.success("Lokasi Jiwan berhasil diambil");
      },
      (error) => {
        toast.error("Gagal mendapatkan lokasi: " + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleGetGroboanLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung di browser ini");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("grobogan_lat", position.coords.latitude);
        form.setValue("grobogan_lng", position.coords.longitude);
        toast.success("Lokasi Grobogan berhasil diambil");
      },
      (error) => {
        toast.error("Gagal mendapatkan lokasi: " + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Memuat pengaturan..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      <PageHeader title="Pengaturan" description="Konfigurasi sistem absensi" />

      <NotificationPanel />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4" />
                Informasi Sekolah
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="nama_sekolah"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Sekolah</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alamat_sekolah"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Sekolah</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Alamat lengkap sekolah"
                        className="resize-none"
                        rows={2}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Toleransi Waktu
              </CardTitle>
              <CardDescription className="text-xs">
                Atur jendela waktu untuk absensi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="toleransi_sebelum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Toleransi Sebelum (menit)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={60}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Absen dibuka {field.value} menit sebelum jadwal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="toleransi_sesudah"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Toleransi Sesudah (menit)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={60}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Absen masih bisa {field.value} menit setelah jadwal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="auto_pulang"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Auto-Complete Pulang</FormLabel>
                      <FormDescription className="text-xs">
                        Otomatis tandai pulang jika sudah lewat jam
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Lokasi Jiwan - Madiun
              </CardTitle>
              <CardDescription className="text-xs">
                Atur lokasi dan radius geofencing Jiwan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="jiwan_lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="-7.123456"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jiwan_lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="111.123456"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="button" variant="outline" size="sm" onClick={handleGetJiwanLocation}>
                <MapPin className="mr-2 h-4 w-4" />
                Ambil Lokasi Jiwan Saat Ini
              </Button>

              <FormField
                control={form.control}
                name="jiwan_radius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Radius Jiwan (meter)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={10}
                        max={1000}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Guru harus dalam radius {field.value}m dari lokasi Jiwan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Lokasi Grobogan - Madiun
              </CardTitle>
              <CardDescription className="text-xs">
                Atur lokasi dan radius geofencing Grobogan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="grobogan_lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="-7.123456"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grobogan_lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="111.123456"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="button" variant="outline" size="sm" onClick={handleGetGroboanLocation}>
                <MapPin className="mr-2 h-4 w-4" />
                Ambil Lokasi Grobogan Saat Ini
              </Button>

              <FormField
                control={form.control}
                name="grobogan_radius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Radius Grobogan (meter)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={10}
                        max={1000}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Guru harus dalam radius {field.value}m dari lokasi Grobogan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Jika lokasi tidak diatur, geofencing tidak akan aktif dan guru bisa absen dari
              mana saja.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Simpan Pengaturan
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}