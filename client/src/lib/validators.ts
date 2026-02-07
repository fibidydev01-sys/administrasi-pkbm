import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi").min(6, "Password minimal 6 karakter"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const guruSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi").min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  nip: z.string().optional(),
  jabatan: z.string().optional(),
  no_hp: z.string().optional().refine(
    (val) => !val || /^[0-9+\-\s()]+$/.test(val),
    "Format nomor HP tidak valid"
  ),
  is_admin: z.boolean(),
  is_active: z.boolean(),
});

export type GuruFormDataSchema = z.infer<typeof guruSchema>;

export const changePasswordSchema = z.object({
  new_password: z.string().min(6, "Password minimal 6 karakter"),
  confirm_password: z.string().min(6, "Password minimal 6 karakter"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Password tidak cocok",
  path: ["confirm_password"],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const jadwalSchema = z.object({
  hari: z.number().min(0).max(6),
  jam_mulai: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Format waktu tidak valid"),
  jam_selesai: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Format waktu tidak valid"),
  guru_id: z.string().uuid("ID Guru tidak valid"),
  mapel: z.string().optional(),
  keterangan: z.string().optional(),
  lokasi: z.enum(["jiwan", "grobogan"]),
  is_active: z.boolean(),
}).refine((data) => data.jam_selesai > data.jam_mulai, {
  message: "Jam selesai harus lebih besar dari jam mulai",
  path: ["jam_selesai"],
});

export type JadwalFormDataSchema = z.infer<typeof jadwalSchema>;

// ✅ UPDATED: Dual Tolerance System
export const settingsSchema = z.object({
  nama_sekolah: z.string().min(1, "Nama sekolah wajib diisi").max(200, "Nama sekolah maksimal 200 karakter"),
  alamat_sekolah: z.string().optional().nullable(),

  // ✅ NEW: Dual Tolerance (4 kolom)
  toleransi_sebelum_masuk: z
    .number()
    .min(0, "Minimal 0 menit")
    .max(60, "Maksimal 60 menit"),
  toleransi_sesudah_masuk: z
    .number()
    .min(0, "Minimal 0 menit")
    .max(60, "Maksimal 60 menit"),
  toleransi_sebelum_pulang: z
    .number()
    .min(0, "Minimal 0 menit")
    .max(60, "Maksimal 60 menit"),
  toleransi_sesudah_pulang: z
    .number()
    .min(0, "Minimal 0 menit")
    .max(60, "Maksimal 60 menit"),

  auto_pulang: z.boolean(),
  jiwan_lat: z.number().min(-90).max(90).optional().nullable(),
  jiwan_lng: z.number().min(-180).max(180).optional().nullable(),
  jiwan_radius: z.number().min(10, "Radius minimal 10 meter").max(1000, "Radius maksimal 1000 meter"),
  grobogan_lat: z.number().min(-90).max(90).optional().nullable(),
  grobogan_lng: z.number().min(-180).max(180).optional().nullable(),
  grobogan_radius: z.number().min(10, "Radius minimal 10 meter").max(1000, "Radius maksimal 1000 meter"),
});

export type SettingsFormDataSchema = z.infer<typeof settingsSchema>;

export const absenSchema = z.object({
  guru_id: z.string().uuid("ID Guru tidak valid"),
  jadwal_id: z.string().uuid("ID Jadwal tidak valid"),
  tipe: z.enum(["masuk", "pulang"]),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  accuracy: z.number().positive().optional().nullable(),
  alamat: z.string().optional().nullable(),
  foto_url: z.string().url("URL foto tidak valid").optional().nullable(),
  foto_public_id: z.string().optional().nullable(),
  is_mock_location: z.boolean().default(false),
  device_info: z.string().optional().nullable(),
});

export type AbsenFormDataSchema = z.infer<typeof absenSchema>;

// =============================================
// Tukar Jadwal Validators
// =============================================

export const tukarJadwalSchema = z.object({
  jadwal_pemohon_id: z.string().uuid("ID Jadwal tidak valid"),
  tanggal_pemohon: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid"),
  tanggal_target: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid"),
  alasan: z.string().optional().nullable(),
  guru_target: z.array(z.object({
    guru_id: z.string().uuid("ID Guru tidak valid"),
    jadwal_id: z.string().uuid("ID Jadwal tidak valid"),
  })).min(1, "Minimal pilih 1 guru target"),
}).refine((data) => data.tanggal_pemohon !== data.tanggal_target, {
  message: "Tanggal pemohon dan target harus berbeda",
  path: ["tanggal_target"],
}).refine((data) => {
  const today = new Date().toISOString().split("T")[0];
  return data.tanggal_pemohon >= today || data.tanggal_target >= today;
}, {
  message: "Minimal satu tanggal harus hari ini atau ke depan",
  path: ["tanggal_pemohon"],
});

export type TukarJadwalFormData = z.infer<typeof tukarJadwalSchema>;

export const respondTukarJadwalSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  catatan: z.string().optional().nullable(),
});

export type RespondTukarJadwalFormData = z.infer<typeof respondTukarJadwalSchema>;

export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError<T> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function getFirstError<T>(error: z.ZodError<T>): string {
  const firstError = error.issues[0];
  return firstError?.message || "Validasi gagal";
}

export function getErrorMessages<T>(error: z.ZodError<T>): Record<string, string> {
  const messages: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (!messages[path]) {
      messages[path] = issue.message;
    }
  });
  return messages;
}
