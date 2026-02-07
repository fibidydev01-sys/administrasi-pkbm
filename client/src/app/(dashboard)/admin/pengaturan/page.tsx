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

      // ✅ NEW: Dual Tolerance defaults
      toleransi_sebelum_masuk: 15,
      toleransi_sesudah_masuk: 10,
      toleransi_sebelum_pulang: 15,
      toleransi_sesudah_pulang: 10,

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
        nama_sekolah: settings.nama_sekolah || "",
        alamat_sekolah: settings.alamat_sekolah || "",

        // ✅ NEW: Load dual tolerance values
        toleransi_sebelum_masuk: settings.toleransi_sebelum_masuk ?? 15,
        toleransi_sesudah_masuk: settings.toleransi_sesudah_masuk ?? 10,
        toleransi_sebelum_pulang: settings.toleransi_sebelum_pulang ?? 15,
        toleransi_sesudah_pulang: settings.toleransi_sesudah_pulang ?? 10,

        auto_pulang: settings.auto_pulang ?? true,
        jiwan_lat: settings.jiwan_lat ?? null,
        jiwan_lng: settings.jiwan_lng ?? null,
        jiwan_radius: settings.jiwan_radius || 100,
        grobogan_lat: settings.grobogan_lat ?? null,
        grobogan_lng: settings.grobogan_lng ?? null,
        grobogan_radius: settings.grobogan_radius || 100,
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

    toast.loading("Mengambil lokasi Jiwan...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("jiwan_lat", position.coords.latitude);
        form.setValue("jiwan_lng", position.coords.longitude);
        toast.dismiss();
        toast.success("Lokasi Jiwan berhasil diambil");
      },
      (error) => {
        toast.dismiss();
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

    toast.loading("Mengambil lokasi Grobogan...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("grobogan_lat", position.coords.latitude);
        form.setValue("grobogan_lng", position.coords.longitude);
        toast.dismiss();
        toast.success("Lokasi Grobogan berhasil diambil");
      },
      (error) => {
        toast.dismiss();
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

          {/* INFORMASI SEKOLAH */}
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
                      <Input {...field} value={field.value || ""} />
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

          {/* ✅ TOLERANSI WAKTU - DUAL TOLERANCE SYSTEM */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Toleransi Waktu Absensi
              </CardTitle>
              <CardDescription className="text-xs">
                Atur jendela waktu untuk absensi masuk dan pulang
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* ✅ SECTION: ABSEN MASUK */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Absen Masuk
                </h3>

                <div className="grid gap-4 sm:grid-cols-2 pl-4 border-l-2 border-green-200">
                  <FormField
                    control={form.control}
                    name="toleransi_sebelum_masuk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">
                          Sebelum Jam Mulai (menit)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={60}
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Window absen masuk dibuka{" "}
                          <strong>{field.value}</strong> menit sebelum jam
                          mulai
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toleransi_sesudah_masuk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">
                          Setelah Jam Mulai (menit)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={60}
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Window absen masuk ditutup{" "}
                          <strong>{field.value}</strong> menit setelah jam
                          mulai
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ✅ CONTOH VISUAL MASUK */}
                <Alert className="ml-4">
                  <AlertDescription className="text-xs">
                    <strong>Contoh:</strong> Jadwal mulai jam <strong>13:00</strong>
                    <br />
                    Window absen masuk:{" "}
                    <strong>
                      {(() => {
                        const sebelum = form.watch("toleransi_sebelum_masuk") ?? 0;
                        const sesudah = form.watch("toleransi_sesudah_masuk") ?? 0;
                        const jamStart = 13 * 60; // 13:00 in minutes
                        const start = jamStart - sebelum;
                        const end = jamStart + sesudah;
                        return `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")} - ${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
                      })()}
                    </strong>
                  </AlertDescription>
                </Alert>
              </div>

              {/* ✅ SECTION: ABSEN PULANG */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  Absen Pulang
                </h3>

                <div className="grid gap-4 sm:grid-cols-2 pl-4 border-l-2 border-purple-200">
                  <FormField
                    control={form.control}
                    name="toleransi_sebelum_pulang"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">
                          Sebelum Jam Selesai (menit)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={60}
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Window absen pulang dibuka{" "}
                          <strong>{field.value}</strong> menit sebelum jam
                          selesai
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toleransi_sesudah_pulang"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">
                          Setelah Jam Selesai (menit)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={60}
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Window absen pulang ditutup{" "}
                          <strong>{field.value}</strong> menit setelah jam
                          selesai
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ✅ CONTOH VISUAL PULANG */}
                <Alert className="ml-4">
                  <AlertDescription className="text-xs">
                    <strong>Contoh:</strong> Jadwal selesai jam <strong>14:45</strong>
                    <br />
                    Window absen pulang:{" "}
                    <strong>
                      {(() => {
                        const sebelum = form.watch("toleransi_sebelum_pulang") ?? 0;
                        const sesudah = form.watch("toleransi_sesudah_pulang") ?? 0;
                        const jamEnd = 14 * 60 + 45; // 14:45 in minutes
                        const start = jamEnd - sebelum;
                        const end = jamEnd + sesudah;
                        return `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")} - ${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
                      })()}
                    </strong>
                  </AlertDescription>
                </Alert>
              </div>

              {/* ✅ AUTO PULANG */}
              <FormField
                control={form.control}
                name="auto_pulang"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">
                        Auto-Complete Pulang
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Otomatis tandai pulang jika sudah lewat window absen pulang
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* LOKASI JIWAN */}
          <Card>
            <CardHeader className="pb-3 bg-blue-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-base text-blue-900">
                <MapPin className="h-5 w-5" />
                LOKASI JIWAN - MADIUN
              </CardTitle>
              <CardDescription className="text-xs text-blue-700">
                Atur koordinat GPS dan radius geofencing untuk lokasi Jiwan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="jiwan_lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Latitude Jiwan</FormLabel>
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
                      <FormLabel className="text-sm">Longitude Jiwan</FormLabel>
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

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetJiwanLocation}
                className="w-full sm:w-auto"
              >
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
                        value={field.value || 100}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Guru harus dalam radius {field.value}m dari lokasi Jiwan untuk absen
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* LOKASI GROBOGAN */}
          <Card>
            <CardHeader className="pb-3 bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-base text-green-900">
                <MapPin className="h-5 w-5" />
                LOKASI GROBOGAN - MADIUN
              </CardTitle>
              <CardDescription className="text-xs text-green-700">
                Atur koordinat GPS dan radius geofencing untuk lokasi Grobogan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="grobogan_lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Latitude Grobogan</FormLabel>
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
                      <FormLabel className="text-sm">Longitude Grobogan</FormLabel>
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

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetGroboanLocation}
                className="w-full sm:w-auto"
              >
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
                        value={field.value || 100}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Guru harus dalam radius {field.value}m dari lokasi Grobogan untuk absen
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
              💡 Sistem akan otomatis mencocokkan lokasi guru dengan lokasi jadwal yang dipilih (Jiwan atau Grobogan).
              Jika lokasi tidak diatur, geofencing tidak akan aktif.
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