/**
 * Paper & Layout Configuration
 * Standar: Peraturan ANRI No. 5 Tahun 2021 (Tata Naskah Dinas)
 */

// Ukuran kertas dalam mm
export const PAPER_SIZE = {
  A4: { width: 210, height: 297, label: "A4 (210×297mm)" },
  F4: { width: 210, height: 330, label: "F4 / Folio (210×330mm)" },
} as const;

export type PaperSize = keyof typeof PAPER_SIZE;

// Margin standar tata naskah dinas (dalam mm)
export const MARGIN = {
  top: 20,
  right: 20,
  bottom: 25,
  left: 30,
} as const;

// Tipografi standar
export const SURAT_TYPOGRAPHY = {
  fontFamily: '"Times New Roman", Times, serif',
  bodySize: "12pt",
  kopIndukSize: "14pt",
  kopUnitSize: "16pt",
  kopAlamatSize: "10pt",
  nipSize: "10pt",
  lineHeight: 1.5,
  paragraphIndent: "1.25cm",
} as const;

// Kop surat
export const KOP_CONFIG = {
  logoSize: 28, // mm (standar: 25-30mm)
  dividerWeight: 2, // pt (standar: 1.75-2.25pt)
  gapBelowDivider: 8, // mm
} as const;

// Signature block
export const SIGNATURE_CONFIG = {
  width: "48%",
  signatureSpace: 60, // px, ruang TTD + stempel
  position: "right" as const,
} as const;

// Default paper size
export const DEFAULT_PAPER_SIZE: PaperSize = "F4";
