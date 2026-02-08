/**
 * Template Surat Types
 * Sistem Persuratan - Administrasi PKBM
 *
 * Referensi: INFRA_TEMPLATE_SURAT.md
 * Standar: Peraturan ANRI No. 5 Tahun 2021
 */

import type { SuratSifat } from "./index";

// =============================================
// Template ID
// =============================================

export type TemplateId =
  | "surat-keterangan-aktif"
  | "surat-undangan"
  | "surat-tugas"
  | "surat-pemberitahuan"
  | "surat-permohonan"
  | "surat-umum"
  | (string & {}); // extensible

// =============================================
// Template Field
// =============================================

export type FieldType = "text" | "textarea" | "select" | "date";

export interface TemplateField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
}

// =============================================
// Template Config
// =============================================

export type TemplateKategori = "keterangan" | "korespondensi" | "arahan" | "umum";

export interface TemplateStruktur {
  judulTengah?: string;
  pakaiKepada: boolean;
  pakaiTembusan: boolean;
  pembuka: string;
  penutup: string;
}

export interface TemplateDataBlock {
  label: string;
  source: "lembaga" | "input";
  fieldNames: string[];
}

export interface TemplateConfig {
  id: TemplateId;
  nama: string;
  deskripsi: string;
  kategori: TemplateKategori;

  struktur: TemplateStruktur;

  defaults: {
    perihal?: string;
    sifat?: SuratSifat;
    lampiran?: string;
  };

  fields: TemplateField[];

  bodyComposer: "structured" | "freeform";

  dataBlocks?: TemplateDataBlock[];
}

// =============================================
// Template Data (stored in DB as JSONB)
// =============================================

export type TemplateData = Record<string, string>;
