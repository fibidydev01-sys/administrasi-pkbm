import { z } from "zod";
import { getTemplate } from "@/constants/template-registry";

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
  kepada: z.string().max(500, "Tujuan maksimal 500 karakter").optional().or(z.literal("")),
  alamat_tujuan: z.string().max(500, "Alamat tujuan maksimal 500 karakter").optional().or(z.literal("")),
  isi_surat: z.string().optional().or(z.literal("")),
  lampiran: z.string().max(200, "Lampiran maksimal 200 karakter").optional().or(z.literal("")),
  sifat: z.enum(["Biasa", "Penting", "Segera", "Rahasia"]).optional(),
  tanggal_surat: z.string().optional(),
  tembusan: z.array(z.string().min(1, "Nama penerima tembusan wajib diisi")).optional(),
  template_id: z.string().optional(),
  template_data: z.record(z.string(), z.string()).optional(),
});

export type SuratFormData = z.infer<typeof suratSchema>;

// =============================================
// Template Field Validators
// =============================================

/**
 * Validate template-specific required fields.
 * Returns an object of field errors { fieldName: errorMessage }.
 */
export function validateTemplateFields(
  templateId: string,
  templateData: Record<string, string>
): Record<string, string> {
  const template = getTemplate(templateId);
  const errors: Record<string, string> = {};

  for (const field of template.fields) {
    if (field.required) {
      const value = templateData[field.name];
      if (!value || value.trim() === "") {
        errors[field.name] = `${field.label} wajib diisi`;
      }
    }
  }

  return errors;
}

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
