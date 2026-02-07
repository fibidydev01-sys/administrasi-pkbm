import type { SuratSifat, SuratStatus } from "@/types";

/**
 * Surat sifat options
 */
export const SURAT_SIFAT_OPTIONS: { value: SuratSifat; label: string }[] = [
  { value: "Biasa", label: "Biasa" },
  { value: "Penting", label: "Penting" },
  { value: "Segera", label: "Segera" },
  { value: "Rahasia", label: "Rahasia" },
];

/**
 * Surat status options
 */
export const SURAT_STATUS_OPTIONS: { value: SuratStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Disetujui" },
  { value: "sent", label: "Terkirim" },
  { value: "archived", label: "Diarsipkan" },
];

/**
 * Status badge colors
 */
export const SURAT_STATUS_COLORS: Record<SuratStatus, string> = {
  draft: "secondary",
  approved: "default",
  sent: "outline",
  archived: "outline",
};

/**
 * Lembaga kode to variant mapping for surat layout
 */
export const LEMBAGA_VARIANT_MAP: Record<string, string> = {
  YYS: "yayasan",
  PKBM: "pkbm",
  RA: "ra",
  KB: "kb",
  TK: "tk",
};
