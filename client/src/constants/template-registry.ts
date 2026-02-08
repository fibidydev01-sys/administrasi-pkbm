/**
 * Template Registry — Sistem Template Surat MVP
 *
 * ATURAN:
 *   - Nambah template = HANYA tambah 1 object di array TEMPLATE_REGISTRY
 *   - Tidak perlu sentuh form, renderer, atau dropdown
 *   - Tidak perlu migrasi database (template_data pakai JSONB)
 *   - Copy-paste friendly: copy template yang mirip, ubah isinya
 *
 * Referensi: doc/INFRA_TEMPLATE_SURAT.md
 * Standar: Peraturan ANRI No. 5 Tahun 2021
 */

import type { TemplateConfig } from "@/types/template";

// ──────────────────────────────────────
// TEMPLATE REGISTRY
// ──────────────────────────────────────

export const TEMPLATE_REGISTRY: TemplateConfig[] = [
  // ──────────────────────────────────────
  // 1. Surat Keterangan Aktif
  // ──────────────────────────────────────
  {
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

    dataBlocks: [
      {
        label: "Yang bertanda tangan di bawah ini:",
        source: "lembaga",
        fieldNames: [],
      },
      {
        label: "Dengan ini menerangkan bahwa:",
        source: "input",
        fieldNames: [
          "nama_peserta",
          "ttl_peserta",
          "nisn",
          "program_paket",
          "semester",
          "tahun_ajaran",
        ],
      },
    ],
  },

  // ──────────────────────────────────────
  // 2. Surat Undangan
  // ──────────────────────────────────────
  {
    id: "surat-undangan",
    nama: "Surat Undangan",
    deskripsi: "Mengundang pihak untuk hadir di acara/kegiatan",
    kategori: "korespondensi",

    struktur: {
      judulTengah: undefined,
      pakaiKepada: true,
      pakaiTembusan: true,
      pembuka: "Dengan hormat,",
      penutup:
        "Demikian undangan ini kami sampaikan. Atas perhatian dan kehadiran Bapak/Ibu, kami ucapkan terima kasih.",
    },

    defaults: {
      perihal: "Undangan ",
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

    dataBlocks: [
      {
        label: "Sehubungan dengan hal tersebut, kami mengundang Bapak/Ibu untuk hadir pada:",
        source: "input",
        fieldNames: ["hari_tanggal", "waktu", "tempat", "nama_acara"],
      },
    ],
  },

  // ──────────────────────────────────────
  // 3. Surat Tugas
  // ──────────────────────────────────────
  {
    id: "surat-tugas",
    nama: "Surat Tugas",
    deskripsi: "Menugaskan seseorang untuk melaksanakan kegiatan tertentu",
    kategori: "arahan",

    struktur: {
      judulTengah: "SURAT TUGAS",
      pakaiKepada: false,
      pakaiTembusan: false,
      pembuka: "Yang bertanda tangan di bawah ini:",
      penutup:
        "Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab.",
    },

    defaults: {
      perihal: "Surat Tugas",
      sifat: "Biasa",
      lampiran: "-",
    },

    fields: [
      {
        name: "nama_ditugaskan",
        label: "Nama Yang Ditugaskan",
        type: "text",
        required: true,
        placeholder: "Contoh: Ahmad Fauzi, S.Pd.",
      },
      {
        name: "nip_ditugaskan",
        label: "NIP/NIK",
        type: "text",
        required: false,
        placeholder: "Contoh: 198501012010011001",
      },
      {
        name: "jabatan_ditugaskan",
        label: "Jabatan",
        type: "text",
        required: true,
        placeholder: "Contoh: Tutor Paket C",
      },
      {
        name: "uraian_tugas",
        label: "Uraian Tugas",
        type: "textarea",
        required: true,
        placeholder: "Contoh: Mengikuti Bimbingan Teknis...",
      },
      {
        name: "hari_tanggal",
        label: "Hari/Tanggal",
        type: "text",
        required: true,
        placeholder: "Contoh: Senin - Rabu, 10-12 Februari 2026",
      },
      {
        name: "waktu",
        label: "Waktu",
        type: "text",
        required: true,
        placeholder: "Contoh: 08.00 - 16.00 WIB",
      },
      {
        name: "tempat",
        label: "Tempat",
        type: "text",
        required: true,
        placeholder: "Contoh: Hotel Mulia, Jakarta",
      },
    ],

    bodyComposer: "structured",

    dataBlocks: [
      {
        label: "Yang bertanda tangan di bawah ini:",
        source: "lembaga",
        fieldNames: [],
      },
      {
        label: "Dengan ini menugaskan kepada:",
        source: "input",
        fieldNames: ["nama_ditugaskan", "nip_ditugaskan", "jabatan_ditugaskan"],
      },
      {
        label: "yang dilaksanakan pada:",
        source: "input",
        fieldNames: ["hari_tanggal", "waktu", "tempat"],
      },
    ],
  },

  // ──────────────────────────────────────
  // 4. Surat Pemberitahuan
  // ──────────────────────────────────────
  {
    id: "surat-pemberitahuan",
    nama: "Surat Pemberitahuan",
    deskripsi: "Memberitahukan informasi kepada pihak tertentu",
    kategori: "korespondensi",

    struktur: {
      judulTengah: undefined,
      pakaiKepada: true,
      pakaiTembusan: true,
      pembuka: "Dengan hormat,",
      penutup:
        "Demikian pemberitahuan ini kami sampaikan. Atas perhatian Bapak/Ibu, kami ucapkan terima kasih.",
    },

    defaults: {
      perihal: "Pemberitahuan ",
      sifat: "Biasa",
      lampiran: "-",
    },

    fields: [],

    bodyComposer: "freeform",
  },

  // ──────────────────────────────────────
  // 5. Surat Permohonan
  // ──────────────────────────────────────
  {
    id: "surat-permohonan",
    nama: "Surat Permohonan",
    deskripsi: "Meminta/memohon sesuatu kepada pihak lain",
    kategori: "korespondensi",

    struktur: {
      judulTengah: undefined,
      pakaiKepada: true,
      pakaiTembusan: true,
      pembuka: "Dengan hormat,",
      penutup:
        "Demikian permohonan ini kami sampaikan. Atas perhatian dan kerjasama Bapak/Ibu, kami ucapkan terima kasih.",
    },

    defaults: {
      perihal: "Permohonan ",
      sifat: "Biasa",
      lampiran: "-",
    },

    fields: [
      {
        name: "perihal_detail",
        label: "Detail Perihal",
        type: "text",
        required: true,
        placeholder: "Contoh: Izin Penggunaan Gedung",
      },
    ],

    bodyComposer: "freeform",
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
      penutup:
        "Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.",
    },

    defaults: {},

    fields: [],

    bodyComposer: "freeform",
  },

  // ──────────────────────────────────────
  // NAMBAH TEMPLATE BARU? TARUH DI SINI
  // Copy salah satu di atas, ubah isinya
  // ──────────────────────────────────────
];

// ──────────────────────────────────────
// HELPER FUNCTIONS
// ──────────────────────────────────────

/**
 * Get template config by ID. Falls back to Surat Umum if not found.
 */
export function getTemplate(id: string): TemplateConfig {
  return (
    TEMPLATE_REGISTRY.find((t) => t.id === id) ??
    TEMPLATE_REGISTRY[TEMPLATE_REGISTRY.length - 1]
  );
}

/**
 * Get template options for dropdown selector.
 */
export function getTemplateOptions(): { value: string; label: string; deskripsi: string }[] {
  return TEMPLATE_REGISTRY.map((t) => ({
    value: t.id,
    label: t.nama,
    deskripsi: t.deskripsi,
  }));
}
