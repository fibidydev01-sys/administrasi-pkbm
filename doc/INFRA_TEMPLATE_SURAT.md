# Infrastruktur Template Surat — Blueprint MVP

**Version:** 1.0.0
**Status:** Blueprint (Belum Implementasi)
**Referensi:** Peraturan ANRI No. 5 Tahun 2021, Permendagri No. 1 Tahun 2023
**Scope:** MVP — Dropdown pilih template, form dinamis, render standar

---

## 1. MASALAH YANG DISELESAIKAN

### Kondisi Saat Ini

```
User buka /surat/buat  →  Form kosong  →  Isi semua manual  →  Submit
```

- Setiap surat dimulai dari nol
- User harus tahu sendiri struktur masing-masing jenis surat
- Tidak ada panduan format per jenis surat
- Rawan inkonsisten antar surat sejenis

### Kondisi Setelah Template System

```
User buka /surat/buat  →  [ Pilih Template ▼ ]  →  Form terisi sebagian  →  Lengkapi  →  Submit
                             │
                             ├─ Surat Keterangan Aktif
                             ├─ Surat Undangan
                             ├─ Surat Tugas
                             ├─ Surat Pemberitahuan
                             ├─ Surat Permohonan
                             └─ Surat Umum (kosong, seperti sekarang)
```

- Pilih template, form langsung terisi: perihal default, body boilerplate, field tambahan muncul
- Konsisten antar surat sejenis
- Tetap bisa diedit 100% (template = titik awal, bukan penjara)

---

## 2. KATALOG TEMPLATE MVP

### 2.1 Daftar Template

| # | Template ID | Nama Tampilan | Konteks Penggunaan |
|---|-------------|---------------|---------------------|
| 1 | `surat-keterangan-aktif` | Surat Keterangan Aktif | Menerangkan peserta didik masih aktif belajar |
| 2 | `surat-undangan` | Surat Undangan | Mengundang pihak ke acara/rapat |
| 3 | `surat-tugas` | Surat Tugas | Menugaskan pegawai/tutor untuk kegiatan |
| 4 | `surat-pemberitahuan` | Surat Pemberitahuan | Memberitahu informasi ke pihak tertentu |
| 5 | `surat-permohonan` | Surat Permohonan | Meminta sesuatu ke pihak lain |
| 6 | `surat-umum` | Surat Umum | Template kosong, isi bebas (default) |

### 2.2 Kenapa Template Ini?

Berdasarkan kebutuhan administrasi PKBM dan lembaga pendidikan nonformal:

- **Surat Keterangan Aktif** — Paling sering diminta oleh wali peserta didik (untuk KIP, BPJS, dll)
- **Surat Undangan** — Rutin setiap bulan (rapat koordinasi, rapat wali, acara)
- **Surat Tugas** — Kegiatan dinas, pelatihan, workshop
- **Surat Pemberitahuan** — Pengumuman libur, perubahan jadwal, info umum
- **Surat Permohonan** — Kerjasama, bantuan, izin kegiatan
- **Surat Umum** — Fallback untuk jenis surat yang tidak tercover

---

## 3. ANATOMI TEMPLATE

### 3.1 Prinsip Dasar

Setiap template terdiri dari **3 lapisan**:

```
┌─────────────────────────────────────────────────────────┐
│  LAPISAN 1: LAYOUT (sudah ada)                          │
│  → Kop surat, margin, tipografi, paper size             │
│  → Ditentukan oleh LEMBAGA (YYS/PKBM/RA/KB/TK)        │
│  → TIDAK berubah berdasarkan template                   │
├─────────────────────────────────────────────────────────┤
│  LAPISAN 2: STRUKTUR (baru — dari template)             │
│  → Urutan elemen dalam body surat                       │
│  → Field tambahan yang muncul di form                   │
│  → Boilerplate text (pembuka, penutup)                  │
│  → Blok data khusus (tabel, daftar)                     │
├─────────────────────────────────────────────────────────┤
│  LAPISAN 3: DATA (dari user input)                      │
│  → Nama penerima, tanggal, isi spesifik                 │
│  → Data peserta didik, data acara, dll                  │
│  → 100% bisa diedit oleh user                           │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Hubungan Template ↔ Layout

```
Template (jenis surat)        Layout (lembaga)
─────────────────────         ────────────────
Surat Keterangan Aktif  ──┐
Surat Undangan          ──┤
Surat Tugas             ──┼──→  YayasanLayout / PKBMLayout / RALayout / ...
Surat Pemberitahuan     ──┤
Surat Permohonan        ──┤     (dipilih otomatis berdasarkan lembaga_id)
Surat Umum              ──┘
```

**Kesimpulan:** Template menentukan ISI, Layout menentukan TAMPILAN. Keduanya independen.

---

## 4. SCHEMA TEMPLATE — DETAIL PER JENIS

### 4.1 Surat Keterangan Aktif

**Fungsi:** Menerangkan bahwa seseorang adalah peserta didik aktif di lembaga.

**Standar ANRI:** Termasuk naskah dinas korespondensi — surat keterangan.

```
┌──────────────────────────────────────────────────────┐
│ [KOP SURAT — dari layout lembaga]                    │
│──────────────────────────────────────────────────────│
│                                                      │
│ Nomor    : 001/PKBM/II/2026                          │
│ Lampiran : -                                         │
│ Hal      : Surat Keterangan Aktif                    │
│                                                      │
│                  SURAT KETERANGAN                     │  ← judul tengah, bold
│              Nomor: 001/PKBM/II/2026                 │  ← nomor diulang
│                                                      │
│ Yang bertanda tangan di bawah ini:                   │  ← pembuka PATEN
│                                                      │
│ Nama     : [ttd_nama dari lembaga]                   │  ← auto-fill
│ Jabatan  : [ttd_jabatan dari lembaga]                │  ← auto-fill
│                                                      │
│ Dengan ini menerangkan bahwa:                        │  ← transisi PATEN
│                                                      │
│ Nama          : [input: nama_peserta]                │
│ Tempat, Tgl   : [input: ttl_peserta]                 │  ← field tambahan
│ NISN          : [input: nisn]                        │  ← field tambahan
│ Program       : [input: program_paket]               │  ← Paket A/B/C
│ Semester      : [input: semester]                    │
│ Tahun Ajaran  : [input: tahun_ajaran]                │
│                                                      │
│ Adalah benar peserta didik aktif pada [nama_lembaga] │  ← auto-fill
│ yang beralamat di [alamat_lembaga].                  │  ← auto-fill
│                                                      │
│ Surat keterangan ini dibuat untuk keperluan          │
│ [input: keperluan] dan agar dapat dipergunakan       │  ← field tambahan
│ sebagaimana mestinya.                                │
│                                                      │
│                       [TTD BLOCK — dari layout]      │
└──────────────────────────────────────────────────────┘
```

**Field Tambahan (di atas field standar):**

| Field | Label Form | Tipe | Wajib | Contoh Isi |
|-------|-----------|------|-------|------------|
| `nama_peserta` | Nama Peserta Didik | text | Ya | Muhammad Rizky Aditya |
| `ttl_peserta` | Tempat, Tanggal Lahir | text | Ya | Jakarta, 15 Maret 2005 |
| `nisn` | NISN | text | Tidak | 0012345678 |
| `program_paket` | Program | select | Ya | Paket A / Paket B / Paket C |
| `semester` | Semester | text | Ya | Ganjil / Genap |
| `tahun_ajaran` | Tahun Ajaran | text | Ya | 2025/2026 |
| `keperluan` | Keperluan | text | Ya | pengajuan KIP / beasiswa / dll |

**Default Values:**

```
perihal     → "Surat Keterangan Aktif"
kepada      → "" (dikosongkan — surat keterangan tidak perlu "Kepada Yth.")
lampiran    → "-"
sifat       → "Biasa"
```

**Catatan Struktur:**
- Surat keterangan TIDAK menggunakan blok "Kepada Yth." — langsung ke judul
- Ada judul tengah "SURAT KETERANGAN" (uppercase, bold, centered)
- Pembuka dan penutup PATEN (tidak bisa diedit kecuali bagian data)

---

### 4.2 Surat Undangan

**Fungsi:** Mengundang pihak untuk hadir di suatu acara/kegiatan.

**Standar ANRI:** Naskah dinas korespondensi — surat undangan.

```
┌──────────────────────────────────────────────────────┐
│ [KOP SURAT — dari layout lembaga]                    │
│──────────────────────────────────────────────────────│
│                                                      │
│ Nomor    : 002/PKBM/II/2026                          │
│ Sifat    : Penting                                   │  ← opsional
│ Lampiran : -                                         │
│ Hal      : Undangan [input: nama_acara]              │
│                                                      │
│ Kepada Yth.                                          │
│ [input: kepada]                                      │
│ di                                                   │
│     [input: alamat_tujuan]                           │
│                                                      │
│ Dengan hormat,                                       │  ← pembuka PATEN
│                                                      │
│     [input: paragraf_pembuka]                        │  ← alasan/konteks undangan
│                                                      │
│ Sehubungan dengan hal tersebut, kami mengundang      │  ← transisi PATEN
│ Bapak/Ibu untuk hadir pada:                          │
│                                                      │
│ Hari/Tanggal  : [input: hari_tanggal]                │
│ Waktu         : [input: waktu]                       │  ← "09.00 - selesai"
│ Tempat        : [input: tempat]                      │
│ Acara         : [input: nama_acara]                  │
│                                                      │
│     Demikian undangan ini kami sampaikan. Atas        │  ← penutup PATEN
│ perhatian dan kehadiran Bapak/Ibu, kami ucapkan      │
│ terima kasih.                                        │
│                                                      │
│                       [TTD BLOCK — dari layout]      │
│                                                      │
│ Tembusan:                                            │
│ 1. [input: tembusan]                                 │
└──────────────────────────────────────────────────────┘
```

**Field Tambahan:**

| Field | Label Form | Tipe | Wajib | Contoh Isi |
|-------|-----------|------|-------|------------|
| `nama_acara` | Nama Acara | text | Ya | Rapat Koordinasi Bulanan |
| `paragraf_pembuka` | Isi Pembuka | textarea | Ya | Dalam rangka meningkatkan mutu... |
| `hari_tanggal` | Hari/Tanggal | text | Ya | Senin, 10 Februari 2026 |
| `waktu` | Waktu | text | Ya | 09.00 - 12.00 WIB |
| `tempat` | Tempat | text | Ya | Aula PKBM Al-Hikmah |

**Default Values:**

```
perihal     → "Undangan {nama_acara}"     (auto-compose)
kepada      → ""                          (manual input)
lampiran    → "-"
sifat       → "Penting"
```

---

### 4.3 Surat Tugas

**Fungsi:** Menugaskan seseorang untuk melaksanakan kegiatan tertentu.

**Standar ANRI:** Naskah dinas arahan — surat tugas.

```
┌──────────────────────────────────────────────────────┐
│ [KOP SURAT — dari layout lembaga]                    │
│──────────────────────────────────────────────────────│
│                                                      │
│                     SURAT TUGAS                      │  ← judul tengah, bold
│              Nomor: 003/PKBM/II/2026                 │
│                                                      │
│ Yang bertanda tangan di bawah ini:                   │  ← pembuka PATEN
│                                                      │
│ Nama     : [ttd_nama dari lembaga]                   │  ← auto-fill
│ Jabatan  : [ttd_jabatan dari lembaga]                │  ← auto-fill
│                                                      │
│ Dengan ini menugaskan kepada:                        │  ← transisi PATEN
│                                                      │
│ Nama     : [input: nama_ditugaskan]                  │
│ NIP/NIK  : [input: nip_ditugaskan]                   │  ← opsional
│ Jabatan  : [input: jabatan_ditugaskan]               │
│                                                      │
│ Untuk:                                               │
│ [input: uraian_tugas]                                │
│                                                      │
│ yang dilaksanakan pada:                              │
│                                                      │
│ Hari/Tanggal  : [input: hari_tanggal]                │
│ Waktu         : [input: waktu]                       │
│ Tempat        : [input: tempat]                      │
│                                                      │
│ Demikian surat tugas ini dibuat untuk dilaksanakan   │  ← penutup PATEN
│ dengan penuh tanggung jawab.                         │
│                                                      │
│                       [TTD BLOCK — dari layout]      │
└──────────────────────────────────────────────────────┘
```

**Field Tambahan:**

| Field | Label Form | Tipe | Wajib | Contoh Isi |
|-------|-----------|------|-------|------------|
| `nama_ditugaskan` | Nama Yang Ditugaskan | text | Ya | Ahmad Fauzi, S.Pd. |
| `nip_ditugaskan` | NIP/NIK | text | Tidak | 198501012010011001 |
| `jabatan_ditugaskan` | Jabatan | text | Ya | Tutor Paket C |
| `uraian_tugas` | Uraian Tugas | textarea | Ya | Mengikuti Bimbingan Teknis... |
| `hari_tanggal` | Hari/Tanggal | text | Ya | Senin - Rabu, 10-12 Februari 2026 |
| `waktu` | Waktu | text | Ya | 08.00 - 16.00 WIB |
| `tempat` | Tempat | text | Ya | Hotel Mulia, Jakarta |

**Default Values:**

```
perihal     → "Surat Tugas"
kepada      → "{nama_ditugaskan}"         (auto-compose)
lampiran    → "-"
sifat       → "Biasa"
```

**Catatan Struktur:**
- Surat Tugas TIDAK menggunakan blok "Kepada Yth."
- Ada judul tengah "SURAT TUGAS" (uppercase, bold, centered)
- Format mirip Surat Keterangan (judul + data block)

---

### 4.4 Surat Pemberitahuan

**Fungsi:** Memberitahukan informasi kepada pihak tertentu.

**Standar ANRI:** Naskah dinas korespondensi — surat biasa.

```
┌──────────────────────────────────────────────────────┐
│ [KOP SURAT — dari layout lembaga]                    │
│──────────────────────────────────────────────────────│
│                                                      │
│ Nomor    : 004/PKBM/II/2026                          │
│ Lampiran : [input: lampiran]                         │
│ Hal      : [input: perihal]                          │
│                                                      │
│ Kepada Yth.                                          │
│ [input: kepada]                                      │
│ di                                                   │
│     [input: alamat_tujuan]                           │
│                                                      │
│ Dengan hormat,                                       │  ← pembuka PATEN
│                                                      │
│     [input: isi_surat]                               │  ← body bebas
│                                                      │
│     Demikian pemberitahuan ini kami sampaikan.        │  ← penutup PATEN
│ Atas perhatian Bapak/Ibu, kami ucapkan terima kasih. │
│                                                      │
│                       [TTD BLOCK — dari layout]      │
│                                                      │
│ Tembusan:                                            │
│ 1. [input: tembusan]                                 │
└──────────────────────────────────────────────────────┘
```

**Field Tambahan:** Tidak ada — menggunakan field standar yang sudah ada.

**Default Values:**

```
perihal     → "Pemberitahuan "             (user melanjutkan)
kepada      → ""
lampiran    → "-"
sifat       → "Biasa"
isi_surat   → "Dengan ini kami memberitahukan bahwa "  (boilerplate awal)
```

**Catatan:** Template ini paling mirip dengan Surat Umum, bedanya hanya di default perihal dan boilerplate pembuka.

---

### 4.5 Surat Permohonan

**Fungsi:** Meminta/memohon sesuatu kepada pihak lain.

**Standar ANRI:** Naskah dinas korespondensi — surat biasa.

```
┌──────────────────────────────────────────────────────┐
│ [KOP SURAT — dari layout lembaga]                    │
│──────────────────────────────────────────────────────│
│                                                      │
│ Nomor    : 005/PKBM/II/2026                          │
│ Lampiran : [input: lampiran]                         │
│ Hal      : Permohonan [input: perihal_detail]        │
│                                                      │
│ Kepada Yth.                                          │
│ [input: kepada]                                      │
│ di                                                   │
│     [input: alamat_tujuan]                           │
│                                                      │
│ Dengan hormat,                                       │  ← pembuka PATEN
│                                                      │
│     [input: isi_surat]                               │  ← body bebas
│                                                      │
│     Demikian permohonan ini kami sampaikan. Atas      │  ← penutup PATEN
│ perhatian dan kerjasama Bapak/Ibu, kami ucapkan      │
│ terima kasih.                                        │
│                                                      │
│                       [TTD BLOCK — dari layout]      │
│                                                      │
│ Tembusan:                                            │
│ 1. [input: tembusan]                                 │
└──────────────────────────────────────────────────────┘
```

**Field Tambahan:**

| Field | Label Form | Tipe | Wajib | Contoh Isi |
|-------|-----------|------|-------|------------|
| `perihal_detail` | Detail Perihal | text | Ya | Izin Penggunaan Gedung |

**Default Values:**

```
perihal     → "Permohonan {perihal_detail}"  (auto-compose)
kepada      → ""
lampiran    → "-"
sifat       → "Biasa"
```

---

### 4.6 Surat Umum (Default)

**Fungsi:** Template kosong — sama seperti sistem saat ini.

Tidak ada field tambahan, tidak ada boilerplate. User mengisi semua dari nol. Template ini menjadi fallback untuk jenis surat yang tidak masuk kategori di atas.

---

## 5. ARSITEKTUR TEKNIS — TEMPLATE REGISTRY

### 5.1 Prinsip Utama: 1 File, 1 Object, Selesai

```
NAMBAH TEMPLATE BARU = TAMBAH 1 OBJECT DI ARRAY

Tidak perlu:
  ✗ Buat komponen React baru
  ✗ Edit form
  ✗ Edit renderer
  ✗ Edit dropdown
  ✗ Tambah route
  ✗ Migrasi database

Cukup:
  ✓ Buka constants/template-registry.ts
  ✓ Copy-paste object template yang mirip
  ✓ Edit isinya
  ✓ Selesai — dropdown, form, renderer otomatis nge-pick
```

**Kenapa bisa?** Karena template adalah **data (config object)**, bukan komponen. Form, dropdown, dan renderer membaca dari registry yang sama. Tambah entry di registry = semua otomatis menyesuaikan.

### 5.2 Struktur Data Template

Setiap template didefinisikan sebagai object dengan kontrak berikut:

```typescript
// Ilustrasi kontrak — BUKAN kode implementasi

type TemplateId =
  | "surat-keterangan-aktif"
  | "surat-undangan"
  | "surat-tugas"
  | "surat-pemberitahuan"
  | "surat-permohonan"
  | "surat-umum"
  | string;                  // ← extensible, tambah template baru tinggal tambah string

type FieldType = "text" | "textarea" | "select" | "date";

interface TemplateField {
  name: string;              // key unik, contoh: "nama_peserta"
  label: string;             // label di form, contoh: "Nama Peserta Didik"
  type: FieldType;
  required: boolean;
  placeholder?: string;      // hint di input
  options?: string[];         // untuk type "select"
  defaultValue?: string;
}

// === BAGIAN INI YANG BIKIN NAMBAH TEMPLATE ENAK ===
// Satu object = satu template lengkap
// Form, dropdown, renderer SEMUA baca dari sini

interface TemplateConfig {
  id: TemplateId;
  nama: string;              // nama tampilan di dropdown
  deskripsi: string;         // tooltip/hint singkat
  kategori: "keterangan" | "korespondensi" | "arahan" | "umum";

  // Struktur surat — menentukan rendering
  struktur: {
    judulTengah?: string;    // "SURAT KETERANGAN" — jika ada, render centered bold
    pakaiKepada: boolean;    // true = ada blok "Kepada Yth.", false = langsung body
    pakaiTembusan: boolean;  // true = tampilkan input tembusan
    pembuka: string;         // teks pembuka PATEN
    penutup: string;         // teks penutup PATEN
  };

  // Default values untuk field standar — auto-fill saat template dipilih
  defaults: {
    perihal?: string;
    sifat?: SuratSifat;
    lampiran?: string;
  };

  // Field tambahan khusus template ini
  // Form otomatis render input untuk setiap field di array ini
  fields: TemplateField[];

  // Cara merangkai body surat dari fields
  bodyComposer: "structured" | "freeform";
  // "structured" = body dirangkai otomatis dari fields (Surat Keterangan, Surat Tugas)
  // "freeform"   = body dari textarea isi_surat biasa (Surat Undangan, Pemberitahuan)

  // Blok data terstruktur (tabel "Nama: ..., Jabatan: ...", dll)
  // Renderer otomatis generate tabel dari array ini
  dataBlocks?: {
    label: string;           // "Yang bertanda tangan di bawah ini:"
    // source: dari mana data diambil
    source: "lembaga" | "input";
    // fields: field mana yang ditampilkan di blok ini
    fieldNames: string[];    // ["nama_peserta", "ttl_peserta", "nisn", ...]
  }[];
}
```

### 5.3 Contoh Ilustrasi: Surat Keterangan Aktif

```typescript
// Ilustrasi — BUKAN kode implementasi

const suratKeteranganAktif: TemplateConfig = {
  id: "surat-keterangan-aktif",
  nama: "Surat Keterangan Aktif",
  deskripsi: "Menerangkan peserta didik masih aktif belajar",
  kategori: "keterangan",

  struktur: {
    judulTengah: "SURAT KETERANGAN",
    pakaiKepada: false,
    pakaiTembusan: false,
    pembuka: "Yang bertanda tangan di bawah ini:",
    penutup:
      "Surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.",
  },

  defaults: {
    perihal: "Surat Keterangan Aktif",
    sifat: "Biasa",
    lampiran: "-",
  },

  fields: [
    {
      name: "nama_peserta",
      label: "Nama Peserta Didik",
      type: "text",
      required: true,
      placeholder: "Contoh: Muhammad Rizky Aditya",
    },
    {
      name: "ttl_peserta",
      label: "Tempat, Tanggal Lahir",
      type: "text",
      required: true,
      placeholder: "Contoh: Jakarta, 15 Maret 2005",
    },
    {
      name: "nisn",
      label: "NISN",
      type: "text",
      required: false,
      placeholder: "10 digit",
    },
    {
      name: "program_paket",
      label: "Program",
      type: "select",
      required: true,
      options: ["Paket A", "Paket B", "Paket C"],
    },
    {
      name: "semester",
      label: "Semester",
      type: "select",
      required: true,
      options: ["Ganjil", "Genap"],
    },
    {
      name: "tahun_ajaran",
      label: "Tahun Ajaran",
      type: "text",
      required: true,
      placeholder: "Contoh: 2025/2026",
    },
    {
      name: "keperluan",
      label: "Keperluan",
      type: "text",
      required: true,
      placeholder: "Contoh: pengajuan KIP",
    },
  ],

  bodyComposer: "structured",
};
```

### 5.4 Contoh Ilustrasi: Surat Undangan

```typescript
// Ilustrasi — BUKAN kode implementasi

const suratUndangan: TemplateConfig = {
  id: "surat-undangan",
  nama: "Surat Undangan",
  deskripsi: "Mengundang pihak untuk hadir di acara/kegiatan",
  kategori: "korespondensi",

  struktur: {
    judulTengah: undefined,     // tidak ada judul tengah
    pakaiKepada: true,          // ada "Kepada Yth."
    pakaiTembusan: true,
    pembuka: "Dengan hormat,",
    penutup:
      "Demikian undangan ini kami sampaikan. Atas perhatian dan kehadiran Bapak/Ibu, kami ucapkan terima kasih.",
  },

  defaults: {
    perihal: "Undangan ",       // user melanjutkan
    sifat: "Penting",
    lampiran: "-",
  },

  fields: [
    {
      name: "nama_acara",
      label: "Nama Acara",
      type: "text",
      required: true,
      placeholder: "Contoh: Rapat Koordinasi Bulanan",
    },
    {
      name: "paragraf_pembuka",
      label: "Isi Pembuka",
      type: "textarea",
      required: true,
      placeholder: "Alasan/konteks undangan...",
    },
    {
      name: "hari_tanggal",
      label: "Hari/Tanggal",
      type: "text",
      required: true,
      placeholder: "Contoh: Senin, 10 Februari 2026",
    },
    {
      name: "waktu",
      label: "Waktu",
      type: "text",
      required: true,
      placeholder: "Contoh: 09.00 - 12.00 WIB",
    },
    {
      name: "tempat",
      label: "Tempat",
      type: "text",
      required: true,
      placeholder: "Contoh: Aula PKBM Al-Hikmah",
    },
  ],

  bodyComposer: "freeform",
};
```

---

## 6. ALUR DATA — DARI TEMPLATE KE DATABASE

### 6.1 Saat User Memilih Template

```
User klik dropdown → pilih "Surat Keterangan Aktif"
                            │
                            ▼
                    Form membaca TemplateConfig
                            │
                            ▼
                  ┌─────────────────────────────┐
                  │ 1. Default values terisi:    │
                  │    perihal → "Surat Ket..."  │
                  │    sifat   → "Biasa"         │
                  │    lampiran → "-"            │
                  │                              │
                  │ 2. Field tambahan muncul:    │
                  │    - Nama Peserta Didik      │
                  │    - TTL                     │
                  │    - NISN                    │
                  │    - Program Paket           │
                  │    - Semester                │
                  │    - Tahun Ajaran            │
                  │    - Keperluan               │
                  │                              │
                  │ 3. Field "Kepada" di-hide    │
                  │    (pakaiKepada = false)     │
                  └─────────────────────────────┘
```

### 6.2 Saat User Submit

```
Submit form
    │
    ▼
Data field tambahan → di-compose menjadi isi_surat (HTML/text)
    │
    ▼
Insert ke surat_keluar (tabel yang SUDAH ADA):
    │
    ├─ lembaga_id      → dari dropdown lembaga (existing)
    ├─ nomor_surat     → auto-generate (existing)
    ├─ perihal         → "Surat Keterangan Aktif"
    ├─ kepada          → "" atau nama peserta
    ├─ isi_surat       → body yang sudah di-compose
    ├─ lampiran        → "-"
    ├─ sifat           → "Biasa"
    ├─ template_id     → "surat-keterangan-aktif"    ← FIELD BARU
    ├─ template_data   → { nama_peserta: "...", ... } ← FIELD BARU (JSONB)
    └─ ... (field existing lainnya)
```

### 6.3 Perubahan Database

Hanya **2 kolom baru** di tabel `surat_keluar`:

```sql
-- Ilustrasi — BUKAN migration script

ALTER TABLE surat_keluar
  ADD COLUMN template_id VARCHAR(50) DEFAULT 'surat-umum',
  ADD COLUMN template_data JSONB DEFAULT '{}'::jsonb;

-- template_id  : referensi ke template mana yang dipakai
-- template_data: data field tambahan dari template
--                contoh: {"nama_peserta": "Ahmad", "nisn": "001234", ...}

CREATE INDEX idx_surat_template ON surat_keluar(template_id)
  WHERE deleted_at IS NULL;

COMMENT ON COLUMN surat_keluar.template_id IS 'ID template yang digunakan saat membuat surat';
COMMENT ON COLUMN surat_keluar.template_data IS 'Data field tambahan dari template (JSONB)';
```

**Kenapa JSONB?**
- Setiap template punya field berbeda — schema-less cocok
- Tidak perlu ALTER TABLE setiap tambah template baru
- PostgreSQL JSONB bisa di-index dan di-query
- Data ini hanya dipakai saat render, bukan untuk filter/sort utama

### 6.4 Saat Render/Preview

```
Load surat dari database
    │
    ▼
Baca template_id → cari TemplateConfig dari registry
    │
    ▼
Baca template_data → parse data field tambahan
    │
    ▼
Render body sesuai bodyComposer:
    │
    ├─ "structured" → rangkai dari template_data (data block, tabel)
    │                  Contoh: Surat Keterangan → generate tabel data peserta
    │
    └─ "freeform"   → gunakan isi_surat langsung (existing behavior)
                      Plus blok waktu/tempat dari template_data jika ada
```

---

## 7. PETA FILE — PERUBAHAN YANG DIPERLUKAN

### 7.1 File Baru

| File | Fungsi |
|------|--------|
| `constants/template-registry.ts` | Registry semua template (TemplateConfig[]) |
| `types/template.ts` | Type definitions: TemplateId, TemplateConfig, TemplateField |
| `components/features/surat/forms/template-selector.tsx` | Dropdown "Pilih Template" |
| `components/features/surat/forms/template-fields.tsx` | Render field tambahan sesuai template |
| `lib/template-composer.ts` | Fungsi compose body dari template_data |

### 7.2 File yang Diubah

| File | Perubahan |
|------|-----------|
| `types/index.ts` | Tambah export template types, update SuratFormData |
| `constants/surat-config.ts` | Tambah export template registry |
| `components/features/surat/forms/surat-form.tsx` | Integrasikan template selector + dynamic fields |
| `components/features/surat/surat-renderer.tsx` | Baca template_id, render body sesuai template |
| `components/features/surat/shared/surat-body.tsx` | Support structured body dari template |
| `lib/validators.ts` | Tambah validasi field template |

### 7.3 Migrasi Database

| File | Perubahan |
|------|-----------|
| `doc/SQL_MIGRATION_TEMPLATE_SYSTEM.md` | ALTER TABLE + index untuk template_id dan template_data |

### 7.4 Visualisasi Dependency

```
template-registry.ts (data)
        │
        ▼
template-selector.tsx  ──→  surat-form.tsx  ──→  API  ──→  surat_keluar (DB)
        │                         │                              │
        ▼                         ▼                              ▼
template-fields.tsx       template-composer.ts          surat-renderer.tsx
(form dinamis)            (compose isi_surat)           (render dari DB)
                                                               │
                                                               ▼
                                                        surat-body.tsx
                                                   (support structured body)
```

---

## 8. UX FLOW — STEP BY STEP

### 8.1 Membuat Surat Baru

```
┌────────────────────────────────────────────────────────────┐
│  BUAT SURAT BARU                                           │
│                                                            │
│  Lembaga:    [ PKBM Al-Hikmah          ▼ ]                │  ← existing
│                                                            │
│  Template:   [ Pilih Template...       ▼ ]                │  ← BARU
│              ┌──────────────────────────┐                  │
│              │ ○ Surat Keterangan Aktif │                  │
│              │ ○ Surat Undangan         │                  │
│              │ ○ Surat Tugas            │                  │
│              │ ○ Surat Pemberitahuan    │                  │
│              │ ○ Surat Permohonan       │                  │
│              │ ○ Surat Umum (kosong)    │                  │
│              └──────────────────────────┘                  │
│                                                            │
│  ─── setelah pilih "Surat Keterangan Aktif" ───           │
│                                                            │
│  Perihal:    [ Surat Keterangan Aktif        ]            │  ← auto-fill
│  Sifat:      [ Biasa                   ▼ ]                │  ← auto-fill
│                                                            │
│  ── DATA PESERTA DIDIK ──────────────────────              │  ← section baru
│                                                            │
│  Nama:       [                               ]            │
│  TTL:        [                               ]            │
│  NISN:       [                               ]            │
│  Program:    [ Paket A / Paket B / Paket C ▼]            │
│  Semester:   [ Ganjil / Genap            ▼ ]              │
│  Thn Ajaran: [                               ]            │
│  Keperluan:  [                               ]            │
│                                                            │
│                          [ Batal ]  [ Simpan Draft ]       │
└────────────────────────────────────────────────────────────┘
```

### 8.2 Mengganti Template

```
User sudah pilih "Surat Undangan"
    │
    ▼
User ganti ke "Surat Tugas"
    │
    ▼
Konfirmasi: "Ganti template? Data field template sebelumnya akan direset."
    │
    ├─ Ya  → Reset field template, isi defaults baru
    └─ Batal → Tetap di template sebelumnya
```

### 8.3 Edit Surat yang Sudah Ada

```
User buka /surat/{id}/edit
    │
    ▼
Load surat dari DB → baca template_id dan template_data
    │
    ▼
Form ditampilkan sesuai template asli
Field tambahan terisi dari template_data
    │
    ▼
User bisa edit semua field (termasuk ganti template)
```

---

## 9. STANDAR ANRI — KLASIFIKASI NASKAH DINAS

Referensi untuk validasi template sudah sesuai standar:

### 9.1 Jenis Naskah Dinas (Peraturan ANRI No. 5 Tahun 2021)

```
Naskah Dinas
├── Naskah Dinas Arahan
│   ├── Peraturan
│   ├── Pedoman
│   ├── Petunjuk Pelaksanaan
│   ├── Standar Operasional Prosedur
│   ├── Surat Edaran
│   ├── Keputusan (SK)                ← post-MVP
│   ├── Instruksi
│   └── SURAT TUGAS                   ← MVP template #3
│
├── Naskah Dinas Korespondensi
│   ├── Surat Biasa/Dinas             ← MVP template #4,5,6
│   ├── SURAT KETERANGAN              ← MVP template #1
│   ├── SURAT UNDANGAN                ← MVP template #2
│   ├── Surat Pengantar
│   ├── Nota Dinas
│   └── Memorandum
│
└── Naskah Dinas Khusus
    ├── Berita Acara
    ├── Surat Kuasa
    ├── Perjanjian Kerjasama
    └── ...
```

### 9.2 Elemen Wajib Per Jenis Surat

| Elemen | SK Aktif | Undangan | Tugas | Pemberitahuan | Permohonan |
|--------|:-------:|:-------:|:-----:|:-------------:|:----------:|
| Kop Surat | Ya | Ya | Ya | Ya | Ya |
| Nomor Surat | Ya | Ya | Ya | Ya | Ya |
| Judul Tengah | **Ya** | Tidak | **Ya** | Tidak | Tidak |
| Blok "Kepada Yth." | Tidak | **Ya** | Tidak | **Ya** | **Ya** |
| Blok Data (tabel) | **Ya** | **Ya** | **Ya** | Tidak | Tidak |
| Pembuka Standar | Ya | Ya | Ya | Ya | Ya |
| Body Bebas | Tidak | Sebagian | Tidak | **Ya** | **Ya** |
| Penutup Standar | Ya | Ya | Ya | Ya | Ya |
| TTD + Nama + NIP | Ya | Ya | Ya | Ya | Ya |
| Tembusan | Tidak | Opsional | Tidak | Opsional | Opsional |

---

## 10. BATASAN MVP

### 10.1 Termasuk MVP

- 6 template (5 jenis + 1 umum)
- Dropdown selector di form pembuatan surat
- Field tambahan dinamis per template
- Default values auto-fill
- Body composer (structured + freeform)
- Simpan template_id + template_data ke DB
- Render body sesuai template saat preview/print

### 10.2 TIDAK Termasuk MVP

| Fitur | Alasan | Kapan |
|-------|--------|-------|
| User buat template sendiri (custom template) | Butuh template editor — terlalu kompleks | Post-MVP |
| Template per lembaga (setiap lembaga punya template berbeda) | 6 template cukup untuk semua lembaga dulu | Post-MVP jika perlu |
| Versioning template (template berubah, surat lama tetap) | template_data di JSONB sudah handle ini | Tidak perlu |
| Import/export template | Overkill untuk 5 lembaga | Tidak perlu |
| Preview realtime saat isi form | Nice-to-have, butuh effort besar | Post-MVP |
| Multi-orang dalam surat tugas (tabel banyak orang) | Start dari 1 orang dulu | Post-MVP |
| Surat Keputusan (SK) | Format lebih kompleks (diktum, menimbang, mengingat) | Post-MVP |
| Rich text editor untuk isi surat | Cukup textarea + basic formatting dulu | Post-MVP |

---

## 11. PANDUAN NAMBAH TEMPLATE BARU

**Ini section terpenting.** Kalau DX nambah template tidak enak, arsitektur ini gagal.

### 11.1 Aturan Main

```
ATURAN #1:  Nambah template = HANYA edit 1 file
            → constants/template-registry.ts

ATURAN #2:  Tidak boleh sentuh form, renderer, atau dropdown
            → Semua sudah data-driven dari registry

ATURAN #3:  Tidak perlu migrasi database
            → template_data pakai JSONB, schema-less

ATURAN #4:  Copy-paste friendly
            → Copy template yang mirip, ubah isinya
```

### 11.2 Step-by-Step: Contoh Tambah "Surat Rekomendasi"

**Skenario:** Tim administrasi butuh template Surat Rekomendasi untuk peserta didik.

#### STEP 1 — Buka `constants/template-registry.ts`

File ini berisi array `TEMPLATE_REGISTRY`. Cari template yang paling mirip untuk di-copy.

Surat Rekomendasi mirip Surat Keterangan (ada judul tengah, data block, tidak pakai "Kepada Yth.").

#### STEP 2 — Copy-paste, edit

```typescript
// constants/template-registry.ts

// ... template lainnya ...

{
  id: "surat-rekomendasi",                          // ← ID unik
  nama: "Surat Rekomendasi",                        // ← muncul di dropdown
  deskripsi: "Rekomendasi peserta didik untuk beasiswa/institusi lain",
  kategori: "keterangan",

  struktur: {
    judulTengah: "SURAT REKOMENDASI",               // ← judul tengah bold
    pakaiKepada: false,                              // ← tidak pakai "Kepada Yth."
    pakaiTembusan: false,
    pembuka: "Yang bertanda tangan di bawah ini:",
    penutup:
      "Demikian surat rekomendasi ini dibuat dengan sebenarnya "
      + "untuk dapat dipergunakan sebagaimana mestinya.",
  },

  defaults: {
    perihal: "Surat Rekomendasi",
    sifat: "Biasa",
    lampiran: "-",
  },

  fields: [                                          // ← field yang muncul di form
    {
      name: "nama_peserta",
      label: "Nama Peserta Didik",
      type: "text",
      required: true,
      placeholder: "Contoh: Siti Nurhaliza",
    },
    {
      name: "ttl_peserta",
      label: "Tempat, Tanggal Lahir",
      type: "text",
      required: true,
      placeholder: "Contoh: Jakarta, 20 Mei 2003",
    },
    {
      name: "program_paket",
      label: "Program",
      type: "select",
      required: true,
      options: ["Paket A", "Paket B", "Paket C"],
    },
    {
      name: "rekomendasi_untuk",
      label: "Direkomendasikan Untuk",
      type: "text",
      required: true,
      placeholder: "Contoh: mendaftar beasiswa Bidikmisi",
    },
    {
      name: "alasan_rekomendasi",
      label: "Alasan Rekomendasi",
      type: "textarea",
      required: true,
      placeholder: "Contoh: Yang bersangkutan memiliki prestasi akademik yang baik...",
    },
  ],

  bodyComposer: "structured",

  dataBlocks: [
    {
      label: "Yang bertanda tangan di bawah ini:",
      source: "lembaga",
      fieldNames: [],                                // otomatis ambil ttd_nama, ttd_jabatan
    },
    {
      label: "Memberikan rekomendasi kepada:",
      source: "input",
      fieldNames: ["nama_peserta", "ttl_peserta", "program_paket"],
    },
  ],
},
```

#### STEP 3 — Selesai. Tidak ada step 3.

```
Yang terjadi otomatis setelah tambah object di atas:

✓ Dropdown "Pilih Template" → muncul "Surat Rekomendasi"
✓ Form → field Nama, TTL, Program, Direkomendasikan Untuk, Alasan muncul
✓ Default perihal → "Surat Rekomendasi" terisi otomatis
✓ Renderer → judul tengah "SURAT REKOMENDASI" + data block
✓ Penutup → teks standar otomatis
✓ Database → template_data JSONB menyimpan semua field
```

### 11.3 Kenapa Bisa Otomatis?

Karena semua komponen **membaca dari registry yang sama**:

```
constants/template-registry.ts
        │
        │  TEMPLATE_REGISTRY (array of TemplateConfig)
        │
        ├──→ template-selector.tsx
        │       TEMPLATE_REGISTRY.map(t => <option>{t.nama}</option>)
        │       Dropdown otomatis punya semua template
        │
        ├──→ template-fields.tsx
        │       const template = TEMPLATE_REGISTRY.find(t => t.id === selectedId)
        │       template.fields.map(f => <Input label={f.label} ... />)
        │       Field otomatis muncul sesuai template
        │
        ├──→ surat-form.tsx
        │       template.defaults → auto-fill perihal, sifat, lampiran
        │       template.struktur.pakaiKepada → show/hide field "Kepada"
        │       Tidak perlu if/else per template
        │
        ├──→ template-composer.ts
        │       template.bodyComposer === "structured"
        │         → compose body dari template.dataBlocks + template_data
        │       template.bodyComposer === "freeform"
        │         → pakai isi_surat langsung
        │
        └──→ surat-body.tsx / surat-renderer.tsx
                template.struktur.judulTengah → render <h2> centered
                template.struktur.pembuka → render pembuka
                template.dataBlocks → render tabel data
                template.struktur.penutup → render penutup
```

**Tidak ada `switch/case` atau `if (templateId === "xxx")` di komponen manapun.** Semua data-driven.

### 11.4 Checklist "Apakah Template Baru Saya Sudah Benar?"

Sebelum commit, cek:

```
□  id unik? (tidak duplikat dengan template lain)
□  nama jelas? (yang muncul di dropdown)
□  struktur.pembuka sesuai standar ANRI?
□  struktur.penutup sesuai standar ANRI?
□  fields — setiap field punya name unik dalam template ini?
□  fields — type benar? (text/textarea/select/date)
□  fields — kalau select, options diisi?
□  defaults.perihal masuk akal?
□  bodyComposer sesuai? (structured kalau body dirangkai, freeform kalau body bebas)
□  dataBlocks (jika ada) — fieldNames cocok dengan names di fields?
```

### 11.5 Template yang TIDAK Bisa Ditangani Sistem Ini

Beberapa jenis surat terlalu kompleks untuk config-driven:

| Jenis Surat | Kenapa Tidak Bisa | Solusi |
|-------------|-------------------|--------|
| Surat Keputusan (SK) | Punya bagian "Menimbang", "Mengingat", "Memutuskan" dengan format diktum khusus | Butuh komponen renderer tersendiri (post-MVP) |
| Berita Acara | Multi-section dengan format naratif + tabel kehadiran | Butuh layout khusus (post-MVP) |
| Perjanjian Kerjasama | Multi-halaman, pasal-pasal bernomor | Beda paradigma, bukan surat biasa |

Untuk MVP, 6 template + extensibility via registry sudah cukup.

### 11.6 Ilustrasi: Registry Lengkap (Gambaran Akhir)

```typescript
// constants/template-registry.ts
// Ilustrasi — BUKAN kode implementasi

export const TEMPLATE_REGISTRY: TemplateConfig[] = [
  // ──────────────────────────────────────
  // 1. Surat Keterangan Aktif
  // ──────────────────────────────────────
  {
    id: "surat-keterangan-aktif",
    nama: "Surat Keterangan Aktif",
    // ... (detail di section 5.3)
  },

  // ──────────────────────────────────────
  // 2. Surat Undangan
  // ──────────────────────────────────────
  {
    id: "surat-undangan",
    nama: "Surat Undangan",
    // ... (detail di section 5.4)
  },

  // ──────────────────────────────────────
  // 3. Surat Tugas
  // ──────────────────────────────────────
  {
    id: "surat-tugas",
    nama: "Surat Tugas",
    // ... (detail di section 4.3)
  },

  // ──────────────────────────────────────
  // 4. Surat Pemberitahuan
  // ──────────────────────────────────────
  {
    id: "surat-pemberitahuan",
    nama: "Surat Pemberitahuan",
    // ... (detail di section 4.4)
  },

  // ──────────────────────────────────────
  // 5. Surat Permohonan
  // ──────────────────────────────────────
  {
    id: "surat-permohonan",
    nama: "Surat Permohonan",
    // ... (detail di section 4.5)
  },

  // ──────────────────────────────────────
  // 6. Surat Umum (default — selalu terakhir)
  // ──────────────────────────────────────
  {
    id: "surat-umum",
    nama: "Surat Umum",
    deskripsi: "Template kosong, isi semua manual",
    kategori: "umum",
    struktur: {
      pakaiKepada: true,
      pakaiTembusan: true,
      pembuka: "Dengan hormat,",
      penutup: "Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.",
    },
    defaults: {},
    fields: [],              // ← kosong, tidak ada field tambahan
    bodyComposer: "freeform",
  },

  // ──────────────────────────────────────
  // NAMBAH TEMPLATE BARU? TARUH DI SINI ↓
  // Copy salah satu di atas, ubah isinya
  // ──────────────────────────────────────
];

// Helper functions — dipakai oleh form, renderer, composer
export function getTemplate(id: string): TemplateConfig {
  return TEMPLATE_REGISTRY.find(t => t.id === id) ?? TEMPLATE_REGISTRY.at(-1)!;
}

export function getTemplateOptions() {
  return TEMPLATE_REGISTRY.map(t => ({ value: t.id, label: t.nama }));
}
```

### 11.7 Ringkasan DX

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   MAU NAMBAH TEMPLATE?                                   │
│                                                          │
│   1. Buka constants/template-registry.ts                 │
│   2. Copy object template yang mirip                     │
│   3. Paste di akhir array (sebelum Surat Umum)           │
│   4. Edit: id, nama, fields, defaults, struktur          │
│   5. Save                                                │
│   6. Done — dropdown, form, renderer otomatis            │
│                                                          │
│   File yang disentuh: 1                                  │
│   Komponen yang diubah: 0                                │
│   Database migration: 0                                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 12. URUTAN IMPLEMENTASI

```
TAHAP 1: Fondasi (types + registry)
├── 1.1  Buat types/template.ts
├── 1.2  Buat constants/template-registry.ts (semua 6 template)
│        → INI file utama. Semua template hardcode di sini.
│        → Helper: getTemplate(), getTemplateOptions()
└── 1.3  Update types/index.ts (export + update SuratFormData)

TAHAP 2: Database
├── 2.1  ALTER TABLE surat_keluar (tambah template_id, template_data)
└── 2.2  Update types/database.ts (tambah kolom baru)

TAHAP 3: Form (data-driven, baca registry)
├── 3.1  Buat template-selector.tsx
│        → getTemplateOptions() → render dropdown
│        → Tidak perlu hardcode option per template
├── 3.2  Buat template-fields.tsx
│        → getTemplate(id).fields.map() → render input
│        → Tidak perlu if/else per template
├── 3.3  Update surat-form.tsx (integrasikan selector + fields)
│        → getTemplate(id).defaults → auto-fill
│        → getTemplate(id).struktur.pakaiKepada → show/hide
└── 3.4  Update validators.ts (validasi field template)
         → getTemplate(id).fields.filter(f => f.required) → dynamic validation

TAHAP 4: Composer (data-driven, baca registry)
├── 4.1  Buat lib/template-composer.ts
│        → getTemplate(id).bodyComposer → pilih strategi compose
│        → getTemplate(id).dataBlocks → generate data table
└── 4.2  Tidak perlu fungsi per-template, 1 fungsi generik cukup

TAHAP 5: Renderer (data-driven, baca registry)
├── 5.1  Update surat-renderer.tsx (baca template_id)
├── 5.2  Update surat-body.tsx
│        → getTemplate(id).struktur.judulTengah → render atau skip
│        → getTemplate(id).struktur.pembuka → render
│        → getTemplate(id).dataBlocks → render tabel data
│        → getTemplate(id).struktur.penutup → render
└── 5.3  Tidak perlu komponen renderer per template

TAHAP 6: Verifikasi
├── 6.1  Test buat surat per template
├── 6.2  Test edit surat (load template_data)
├── 6.3  Test preview/print sesuai standar ANRI
├── 6.4  Test ganti template di form
└── 6.5  Test tambah template baru (cek DX: cukup 1 file?)
```

---

## 13. REFERENSI

- **Peraturan ANRI No. 5 Tahun 2021** — Pedoman Umum Tata Naskah Dinas
- **Permendagri No. 1 Tahun 2023** — Tata Naskah Dinas Pemerintah Daerah
- **Arsitektur existing**: `doc/ARSITEKTUR_TEMPLATE_SURAT.md`
- **Schema existing**: `doc/SQL_SCHEMA_SISTEM_PERSURATAN.md`
- **Konstanta existing**: `client/src/constants/surat-config.ts`
- **Types existing**: `client/src/types/index.ts`
