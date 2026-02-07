# Arsitektur Template Surat - Sistem Persuratan PKBM

**Version:** 2.0.0
**Status:** Blueprint untuk Implementasi
**Referensi Regulasi:** Peraturan ANRI No. 5 Tahun 2021 (Pedoman Tata Naskah Dinas)

---

## 1. KONDISI SAAT INI

### 1.1 Pipeline Rendering

```
[SuratPreview]  →  [SuratRenderer]  →  [Layout per Lembaga]  →  [Shared Components]
  (A4 wrapper)       (router kode)       (YYS/PKBM/RA/KB/TK)     (Kop, Meta, Body, TTD, Tembusan)
```

### 1.2 Komponen yang Sudah Ada

| File | Fungsi | Status |
|------|--------|--------|
| `surat-preview.tsx` | Wrapper A4, shadow, margin | Ada - perlu perbaikan margin |
| `surat-renderer.tsx` | Router layout by kode lembaga | Ada - OK |
| `layouts/*.tsx` | 5 layout per lembaga | Ada - perlu standarisasi |
| `shared/kop-surat.tsx` | Kop surat + logo + garis | Ada - perlu perbaikan ukuran |
| `shared/surat-meta.tsx` | Nomor, Lampiran, Hal | Ada - perlu tambah Sifat, Hal underline |
| `shared/surat-body.tsx` | Pembuka + isi + penutup | Ada - perlu perbaikan indent |
| `shared/signature-block.tsx` | TTD + nama + NIP | Ada - perlu perbaikan posisi |
| `shared/tembusan-list.tsx` | Daftar tembusan | Ada - OK |
| `globals.css` | Print styles | Ada - perlu update margin & paper size |

### 1.3 Masalah di Implementasi Saat Ini

| # | Masalah | Detail |
|---|---------|--------|
| 1 | **Margin tidak sesuai standar** | Saat ini: 25/20/20/25mm. Standar: **20/20/25/30mm** |
| 2 | **Hanya support A4** | Belum ada opsi F4 (210×330mm) |
| 3 | **Kop logo terlalu kecil** | 80×80px (≈21mm). Standar: 25-30mm |
| 4 | **Garis kop kurang tebal** | Perlu 1.75-2.25pt solid |
| 5 | **Hal tidak di-underline** | Standar: perihal harus bergaris bawah |
| 6 | **Preview ≠ Print** | CSS print override beda dengan screen |
| 7 | **Tidak ada tujuan block standar** | "Kepada Yth." harus format tertentu |
| 8 | **Indent paragraph belum pas** | Standar: 1.25cm dari margin kiri |
| 9 | **Signature block hardcoded** | Width w-1/2, tanpa stempel area |

---

## 2. STANDAR TATA NASKAH DINAS INDONESIA

### 2.1 Ukuran Kertas

| Kertas | Lebar | Tinggi | Penggunaan |
|--------|-------|--------|------------|
| **A4** | 210mm | 297mm | Surat resmi, standar pemerintah |
| **F4** | 210mm | 330mm | Umum di Indonesia, naskah panjang |

### 2.2 Margin Standar

```
┌─────────────────────────────────────┐
│            TOP: 20mm                │
│         (2cm dari tepi atas)        │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │                               │  │
│L │       AREA KONTEN             │R │
│E │       160mm × variable        │I │
│F │                               │G │
│T │                               │H │
│  │                               │T │
│3 │                               │  │
│0 │                               │2 │
│m │                               │0 │
│m │                               │m │
│  │                               │m │
│  └───────────────────────────────┘  │
│           BOTTOM: 25mm              │
│        (2.5cm dari tepi bawah)      │
└─────────────────────────────────────┘
```

| Sisi | Ukuran | Alasan |
|------|--------|--------|
| **Atas** | 20mm (2cm) | Standar ANRI |
| **Kanan** | 20mm (2cm) | Standar ANRI |
| **Bawah** | 25mm (2.5cm) | Standar ANRI |
| **Kiri** | 30mm (3cm) | Ruang jilid/ordner |

### 2.3 Tipografi Standar

| Elemen | Font | Ukuran | Style |
|--------|------|--------|-------|
| Nama lembaga induk | Arial/TNR | 13-14pt | UPPERCASE, bold |
| Nama lembaga unit | Arial/TNR | 14-16pt | UPPERCASE, bold |
| Alamat/kontak | Arial/TNR | 9-10pt | Regular |
| Body surat | Arial/TNR | 12pt | Regular, justify |
| Nama penandatangan | Arial/TNR | 12pt | Bold, underline |
| NIP | Arial/TNR | 10pt | Regular |

### 2.4 Layout Vertikal (Urutan Elemen)

```
┌─────────────────────────────────────────────────┐
│ [LOGO]  NAMA LEMBAGA INDUK (uppercase, bold)    │
│         NAMA LEMBAGA UNIT (uppercase, bold)     │
│         Alamat · Telp · Email · Website         │
│─────────────────────────────────────────────────│ ← garis 1.75-2.25pt
│                                                 │
│ Nomor    : 001/YYS/II/2026                      │
│ Sifat    : Biasa            ← opsional          │
│ Lampiran : 1 (satu) berkas  ← opsional          │
│ Hal      : Undangan Rapat   ← underline         │
│                                                 │
│ Kepada Yth.                                     │
│ Bapak/Ibu [Nama]                                │
│ di                                              │
│     [Tempat/Kota]                               │
│                                                 │
│ Dengan hormat,                                  │
│                                                 │
│     [Alinea pembuka - indent 1.25cm]            │
│                                                 │
│     [Isi surat - indent 1.25cm, justify]        │
│                                                 │
│     [Alinea penutup]                            │
│                                                 │
│                      [Kota], [Tanggal]          │
│                      [Jabatan],                 │
│                                                 │
│                      -- ttd + stempel --        │
│                                                 │
│                      [Nama Lengkap]             │ ← bold, underline
│                      NIP. xxxxxxxx              │
│                                                 │
│ Tembusan:                                       │
│ 1. [Penerima 1]                                 │
│ 2. [Penerima 2]                                 │
└─────────────────────────────────────────────────┘
```

---

## 3. ARSITEKTUR PERBAIKAN

### 3.1 Prinsip

1. **PATEN** — Layout fixed sesuai standar, bukan dynamic editor
2. **WYSIWYG** — Preview di screen = hasil print
3. **No Puppeteer** — Print via `window.print()`, CSS-only layout
4. **Multi-paper** — Support A4 dan F4
5. **Reusable** — Shared components, variant per lembaga

### 3.2 Konstanta Baru: `constants/paper-config.ts`

```typescript
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

// Area konten = paper width - margin left - margin right
// A4: 210 - 30 - 20 = 160mm
// F4: 210 - 30 - 20 = 160mm (sama, karena lebar kertas sama)

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
  logoSize: 28,        // mm (standar: 25-30mm)
  dividerWeight: 2,    // pt (standar: 1.75-2.25pt)
  gapBelowDivider: 8,  // mm (≈2 spasi)
} as const;

// Signature block
export const SIGNATURE_CONFIG = {
  width: "48%",         // ≈48 ketukan dari total lebar
  signatureSpace: 60,   // px, ruang TTD + stempel
  position: "right" as const,
} as const;

// Default paper size
export const DEFAULT_PAPER_SIZE: PaperSize = "F4";
```

### 3.3 Perubahan Komponen

#### A. `surat-preview.tsx` — Support Multi-Paper

**Sebelum:**
```tsx
<div className="bg-white shadow-lg mx-auto max-w-[210mm] min-h-[297mm]
  p-[25mm_20mm_20mm_25mm] ...">
```

**Sesudah:**
```tsx
interface SuratPreviewProps {
  surat: SuratWithRelations;
  paperSize?: PaperSize;  // default: DEFAULT_PAPER_SIZE
}

export function SuratPreview({ surat, paperSize = DEFAULT_PAPER_SIZE }: SuratPreviewProps) {
  const paper = PAPER_SIZE[paperSize];
  const m = MARGIN;

  return (
    <div
      className="surat-preview bg-white shadow-lg mx-auto text-black font-serif print:shadow-none"
      style={{
        width: `${paper.width}mm`,
        minHeight: `${paper.height}mm`,
        padding: `${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm`,
        fontSize: SURAT_TYPOGRAPHY.bodySize,
        fontFamily: SURAT_TYPOGRAPHY.fontFamily,
        lineHeight: SURAT_TYPOGRAPHY.lineHeight,
      }}
      data-paper-size={paperSize}
    >
      <SuratRenderer surat={surat} />
    </div>
  );
}
```

#### B. `kop-surat.tsx` — Perbaikan Ukuran & Garis

**Perubahan:**

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| Logo size | `w-20 h-20` (80px ≈ 21mm) | `width/height: ${KOP_CONFIG.logoSize}mm` (28mm) |
| Nama lembaga induk | `fontSize` dari variant config | `SURAT_TYPOGRAPHY.kopIndukSize` (14pt) |
| Nama lembaga unit | `fontSize` dari variant config | `SURAT_TYPOGRAPHY.kopUnitSize` (16pt) |
| Alamat | `text-[10pt]` | `SURAT_TYPOGRAPHY.kopAlamatSize` (10pt) |
| Garis pemisah | `border-t-[3px] border-double` | `border-t solid ${KOP_CONFIG.dividerWeight}pt` |
| Gap di bawah garis | `mb-5` | `marginBottom: ${KOP_CONFIG.gapBelowDivider}mm` |

**Catatan variant:**
- Semua variant pakai **garis single solid** (sesuai standar ANRI)
- Perbedaan antar variant hanya: **posisi logo** (center vs left) dan **hierarki nama**
- Double border dihapus (tidak standar)

#### C. `surat-meta.tsx` — Tambah Sifat + Hal Underline

**Perubahan:**

```tsx
interface SuratMetaProps {
  nomorSurat: string;
  perihal: string;
  lampiran?: string | null;
  sifat?: string | null;      // BARU
}

// Urutan field:
// 1. Nomor    : xxx
// 2. Sifat    : xxx  ← opsional, hanya tampil jika bukan "Biasa"
// 3. Lampiran : xxx  ← opsional
// 4. Hal      : xxx  ← UNDERLINE
```

**Detail perubahan:**
- Tampilkan Sifat di bawah Nomor jika bukan "Biasa"
- Perihal (Hal) diberi `text-decoration: underline`
- Label column width: `w-20` (≈80px, cukup untuk "Lampiran")
- Colon (:) di column terpisah agar rata

#### D. `surat-body.tsx` — Perbaikan Indent

**Perubahan:**

```tsx
// Indent paragraph pertama: 1.25cm dari margin kiri
// Ini sesuai standar tata naskah dinas

<div className="surat-body" style={{ marginTop: "5mm" }}>
  <p style={{ textIndent: SURAT_TYPOGRAPHY.paragraphIndent }}>
    Dengan hormat,
  </p>

  <div
    className="surat-content text-justify leading-relaxed"
    style={{
      textIndent: SURAT_TYPOGRAPHY.paragraphIndent,  // 1.25cm
      marginTop: "3mm",
    }}
    dangerouslySetInnerHTML={{ __html: isiSurat }}
  />

  <p style={{
    textIndent: SURAT_TYPOGRAPHY.paragraphIndent,
    marginTop: "3mm",
  }}>
    Demikian surat ini kami sampaikan...
  </p>
</div>
```

**CSS pendukung di globals.css:**

```css
.surat-content p {
  text-indent: 1.25cm;
  margin-bottom: 0;
}

.surat-content p + p {
  margin-top: 0.5em;
}
```

#### E. `signature-block.tsx` — Perbaikan Layout

**Perubahan:**

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| Width | `w-1/2` (50%) | `SIGNATURE_CONFIG.width` (48%) |
| Position | prop `left/center/right` | Selalu **right** (standar) |
| TTD space | `h-16` (64px) atau `60px` | `SIGNATURE_CONFIG.signatureSpace` (60px) |
| Nama | `text-center font-bold underline` | font-bold + underline (tetap) |
| NIP prefix | Tidak ada | Tambah "NIP." di depan |
| Stempel area | Tidak ada | Ruang di kiri TTD |

**Struktur baru:**

```
              [Kota], [Tanggal Lengkap]
              [Jabatan],


              --- area ttd + stempel ---


              [Nama Pejabat]                ← bold, underline
              NIP. xxxxxxxxxxxxx
```

#### F. `globals.css` — Update Print & Paper Styles

**Perubahan utama:**

```css
/* ============================================
   SURAT TEMPLATE STYLES
   Standar: Peraturan ANRI No. 5 Tahun 2021
   ============================================ */

.surat-preview {
  font-family: "Times New Roman", Times, serif;
  font-size: 12pt;
  line-height: 1.5;
  color: #000;
}

/* Paragraph indent standar 1.25cm */
.surat-body {
  text-align: justify;
}

.surat-body p,
.surat-content {
  text-indent: 1.25cm;
}

/* Kop surat */
.kop-surat h1,
.kop-surat h2 {
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Garis pemisah kop */
.kop-divider {
  border: none;
  border-top: 2pt solid #000;
  margin-top: 3mm;
  margin-bottom: 8mm;
}

/* Signature block */
.signature-block {
  page-break-inside: avoid;
}

/* ============================================
   PRINT STYLES
   ============================================ */

@media print {
  /* Hide semua UI */
  header, nav, aside, footer,
  .sidebar, .mobile-nav, .no-print,
  [data-sidebar], button:not(.print-visible) {
    display: none !important;
  }

  body {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* A4 default */
  @page {
    size: A4 portrait;
    margin: 0;
  }

  /* F4 override */
  .surat-preview[data-paper-size="F4"] {
    min-height: 330mm;
  }

  @page f4 {
    size: 210mm 330mm;
    margin: 0;
  }

  .surat-preview[data-paper-size="F4"] {
    page: f4;
  }

  /* Container print */
  .surat-preview {
    box-shadow: none !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Kop border harus print */
  .kop-divider {
    border-top: 2pt solid #000 !important;
  }

  /* Page break rules */
  .signature-block,
  .tembusan-list,
  .surat-meta {
    page-break-inside: avoid;
  }
}
```

---

## 4. DETAIL PAGE: PAPER SIZE SELECTOR

### 4.1 Di `/surat/[id]/page.tsx`

Tambah toggle ukuran kertas di toolbar (sebelum tombol Print):

```tsx
// State
const [paperSize, setPaperSize] = useState<PaperSize>(DEFAULT_PAPER_SIZE);

// UI - di deretan action buttons, sebelum Print
<Select value={paperSize} onValueChange={(v) => setPaperSize(v as PaperSize)}>
  <SelectTrigger className="w-[140px] no-print">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="A4">A4 (210×297)</SelectItem>
    <SelectItem value="F4">F4 (210×330)</SelectItem>
  </SelectContent>
</Select>

<Button onClick={() => window.print()}>
  <Printer className="mr-2 h-4 w-4" /> Print
</Button>

// Preview
<SuratPreview surat={surat} paperSize={paperSize} />
```

### 4.2 Di `/surat/buat/page.tsx` dan `/surat/[id]/edit/page.tsx`

Tambah field `paperSize` di form (opsional, untuk preview saat mengisi):

```tsx
// Di SuratForm, tambah live preview panel (split view)
// Kiri: form input
// Kanan: preview realtime

// Ini OPSIONAL untuk tahap selanjutnya
```

---

## 5. TAHAPAN IMPLEMENTASI

### Tahap 1 — Konstanta & CSS (Fondasi)

| # | Task | File |
|---|------|------|
| 1.1 | Buat `paper-config.ts` | `constants/paper-config.ts` |
| 1.2 | Update barrel export | `constants/index.ts` |
| 1.3 | Update CSS surat & print | `globals.css` |

### Tahap 2 — Perbaikan Shared Components

| # | Task | File |
|---|------|------|
| 2.1 | Perbaiki KopSurat (logo size, garis, tipografi) | `shared/kop-surat.tsx` |
| 2.2 | Perbaiki SuratMeta (sifat, hal underline, spacing) | `shared/surat-meta.tsx` |
| 2.3 | Perbaiki SuratBody (indent 1.25cm, spacing) | `shared/surat-body.tsx` |
| 2.4 | Perbaiki SignatureBlock (width, NIP prefix, stempel area) | `shared/signature-block.tsx` |

### Tahap 3 — Preview & Paper Size

| # | Task | File |
|---|------|------|
| 3.1 | Update SuratPreview (dynamic paper, inline style) | `surat-preview.tsx` |
| 3.2 | Update detail page (paper size selector) | `surat/[id]/page.tsx` |

### Tahap 4 — Standarisasi Layout per Lembaga

| # | Task | File |
|---|------|------|
| 4.1 | Update YayasanLayout (tujuan block standar) | `layouts/yayasan-layout.tsx` |
| 4.2 | Update PKBM/RA/KB/TK Layout (sama) | `layouts/*.tsx` |

### Tahap 5 — Verifikasi

| # | Task | Detail |
|---|------|--------|
| 5.1 | Test print A4 | Margin pas, garis kop muncul, TTD tidak terpotong |
| 5.2 | Test print F4 | Tinggi halaman benar (330mm) |
| 5.3 | Test preview = print | Screen dan print layout identik |
| 5.4 | Test semua variant | 5 lembaga (YYS, PKBM, RA, KB, TK) |

---

## 6. FILE YANG DIUBAH (RINGKASAN)

| File | Aksi | Prioritas |
|------|------|-----------|
| `constants/paper-config.ts` | **BARU** | P0 |
| `constants/index.ts` | EDIT (tambah export) | P0 |
| `app/globals.css` | EDIT (rewrite surat section) | P0 |
| `shared/kop-surat.tsx` | EDIT (logo, garis, tipografi) | P1 |
| `shared/surat-meta.tsx` | EDIT (sifat, underline hal) | P1 |
| `shared/surat-body.tsx` | EDIT (indent 1.25cm) | P1 |
| `shared/signature-block.tsx` | EDIT (width, NIP, stempel) | P1 |
| `surat-preview.tsx` | EDIT (dynamic paper size) | P2 |
| `surat/[id]/page.tsx` | EDIT (paper selector) | P2 |
| `layouts/yayasan-layout.tsx` | EDIT (tujuan block) | P3 |
| `layouts/pkbm-layout.tsx` | EDIT (tujuan block) | P3 |
| `layouts/ra-layout.tsx` | EDIT (tujuan block) | P3 |
| `layouts/kb-layout.tsx` | EDIT (tujuan block) | P3 |
| `layouts/tk-layout.tsx` | EDIT (tujuan block) | P3 |

**Total: 1 file baru, 14 file edit**

---

## 7. YANG TIDAK TERMASUK (BUKAN MVP)

| Fitur | Alasan | Kapan |
|-------|--------|-------|
| Rich text editor (TipTap) | Butuh library tambahan | Post-MVP |
| PDF generation (jsPDF/Puppeteer) | Print via browser cukup untuk MVP | Post-MVP |
| Drag-and-drop layout editor | Over-engineering untuk MVP | Tidak perlu |
| Custom font upload | Cukup pakai TNR sistem | Tidak perlu |
| Multi-page surat otomatis | CSS `page-break` sudah handle | Post-MVP jika perlu |
| Logo upload UI | Bisa set manual via Supabase Storage | Post-MVP |
| Preview realtime di form | Nice-to-have | Post-MVP |

---

## 8. REFERENSI

- **Peraturan ANRI No. 5 Tahun 2021** — Pedoman Umum Tata Naskah Dinas
- **Permendagri No. 1 Tahun 2023** — Tata Naskah Dinas Pemerintah Daerah
- **ISO 216** — Ukuran kertas A4 (210×297mm)
- **F4/Folio** — 210×330mm (standar pasar Indonesia)
