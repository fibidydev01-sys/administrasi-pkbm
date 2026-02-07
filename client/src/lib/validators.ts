import { z } from "zod";

// =============================================
// Auth Validators
// =============================================

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi").min(6, "Password minimal 6 karakter"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// =============================================
// Surat Validators
// =============================================

export const suratSchema = z.object({
  lembaga_id: z.string().min(1, "Lembaga wajib dipilih"),
  perihal: z.string().min(1, "Perihal wajib diisi").max(500, "Perihal maksimal 500 karakter"),
  kepada: z.string().min(1, "Tujuan wajib diisi").max(500, "Tujuan maksimal 500 karakter"),
  alamat_tujuan: z.string().max(500, "Alamat tujuan maksimal 500 karakter").optional().or(z.literal("")),
  isi_surat: z.string().min(1, "Isi surat wajib diisi"),
  lampiran: z.string().max(200, "Lampiran maksimal 200 karakter").optional().or(z.literal("")),
  sifat: z.enum(["Biasa", "Penting", "Segera", "Rahasia"]).default("Biasa"),
  tanggal_surat: z.string().optional(),
  tembusan: z.array(z.string().min(1, "Nama penerima tembusan wajib diisi")).optional().default([]),
  template_id: z.string().optional().or(z.literal("")),
  template_data: z.record(z.string(), z.string()).optional(),
});

export type SuratFormData = z.infer<typeof suratSchema>;

// =============================================
// Template Validators
// =============================================

export const bodyPartSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), value: z.string().min(1, "Teks wajib diisi") }),
  z.object({ type: z.literal("field_group"), section: z.string().min(1, "Section wajib diisi") }),
]);

export const templateFieldSchema = z.object({
  nama_field: z.string().min(1, "Nama field wajib diisi").max(100),
  label: z.string().min(1, "Label wajib diisi").max(200),
  tipe: z.enum(["text", "textarea", "date", "number", "select"]).default("text"),
  urutan: z.number().int().min(0).default(0),
  required: z.boolean().default(false),
  placeholder: z.string().max(300).optional().or(z.literal("")),
  default_value: z.string().max(500).optional().or(z.literal("")),
  options: z.array(z.string()).optional(),
  section: z.string().min(1, "Section wajib diisi").max(100),
});

export const templateSchema = z.object({
  nama: z.string().min(1, "Nama template wajib diisi").max(200),
  kategori: z.string().min(1, "Kategori wajib diisi").max(100),
  perihal_default: z.string().max(500).optional().or(z.literal("")),
  body_parts: z.array(bodyPartSchema).min(1, "Minimal 1 bagian body"),
  lembaga_id: z.string().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  fields: z.array(templateFieldSchema).optional().default([]),
});

export type TemplateFormData = z.infer<typeof templateSchema>;
export type TemplateFieldFormData = z.infer<typeof templateFieldSchema>;

// =============================================
// Lembaga Validators
// =============================================

export const lembagaSchema = z.object({
  kode: z.string().min(1, "Kode wajib diisi").max(10, "Kode maksimal 10 karakter"),
  nama: z.string().min(1, "Nama wajib diisi").max(200, "Nama maksimal 200 karakter"),
  alamat: z.string().min(1, "Alamat wajib diisi").max(500, "Alamat maksimal 500 karakter"),
  telepon: z.string().max(20, "Telepon maksimal 20 karakter").optional().or(z.literal("")),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  website: z.string().max(200, "Website maksimal 200 karakter").optional().or(z.literal("")),
  nomor_prefix: z.string().min(1, "Prefix nomor wajib diisi").max(20, "Prefix maksimal 20 karakter"),
  ttd_jabatan: z.string().max(100, "Jabatan TTD maksimal 100 karakter").optional().or(z.literal("")),
  ttd_nama: z.string().max(100, "Nama TTD maksimal 100 karakter").optional().or(z.literal("")),
  ttd_nip: z.string().max(50, "NIP maksimal 50 karakter").optional().or(z.literal("")),
});

export type LembagaFormData = z.infer<typeof lembagaSchema>;

// =============================================
// Helpers
// =============================================

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
