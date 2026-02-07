# Panduan Setup - Administrasi PKBM

Sistem Persuratan & Administrasi PKBM Yayasan Al Barakah.

---

## 1. Prasyarat

| Tool | Versi |
|------|-------|
| Node.js | 20+ |
| npm | 10+ |
| Git | 2+ |
| Supabase Project | Free tier cukup |

---

## 2. Clone & Install

```bash
git clone <repo-url>
cd administrasi-pkbm/client
npm install
```

---

## 3. Environment Variables

Buat file `client/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

Dapatkan dari: **Supabase Dashboard > Project Settings > API**

---

## 4. Setup Database (Supabase)

### 4a. Run SQL Schema

1. Buka **Supabase Dashboard > SQL Editor**
2. Copy-paste **seluruh isi** `doc/SQL_SCHEMA_SISTEM_PERSURATAN.md` (bagian dalam blok ```sql)
3. Klik **RUN**
4. Verifikasi: harus muncul 6 tabel, 5 lembaga, 4 role_permissions

### 4b. Buat User Pertama (super_admin)

**Step 1** - Supabase Dashboard > **Authentication** > **Users** > **Add User**:
- Email: `admin@albarakah.id` (atau email lain)
- Password: `admin123456` (ganti sesuai keinginan)
- Centang **Auto Confirm**

**Step 2** - Copy UUID user yang baru dibuat, lalu run di SQL Editor:

```sql
INSERT INTO user_profiles (id, full_name, role, lembaga_id, is_active)
VALUES (
  'UUID_DARI_STEP_1',
  'Administrator',
  'super_admin',
  (SELECT id FROM lembaga WHERE kode = 'YYS'),
  true
);
```

---

## 5. Setup Storage Buckets

Supabase Dashboard > **Storage** > **New Bucket**, buat 3 bucket:

| Bucket | Public | Kegunaan |
|--------|--------|----------|
| `lembaga-logos` | ON | Logo lembaga di kop surat |
| `lembaga-ttd` | ON | Gambar tanda tangan pejabat |
| `surat-pdf` | OFF | File PDF surat yang di-generate |

Lalu run SQL ini untuk policy storage:

```sql
-- Logo: public read, authenticated upload
CREATE POLICY "Public read logos" ON storage.objects FOR SELECT USING (bucket_id = 'lembaga-logos');
CREATE POLICY "Admin upload logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lembaga-logos');
CREATE POLICY "Admin update logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'lembaga-logos');

-- TTD: public read, authenticated upload
CREATE POLICY "Public read ttd" ON storage.objects FOR SELECT USING (bucket_id = 'lembaga-ttd');
CREATE POLICY "Admin upload ttd" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lembaga-ttd');
CREATE POLICY "Admin update ttd" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'lembaga-ttd');

-- PDF: hanya authenticated user
CREATE POLICY "Auth read pdf" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'surat-pdf');
CREATE POLICY "Auth upload pdf" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'surat-pdf');
```

---

## 6. Jalankan Aplikasi

```bash
cd client
npm run dev
```

Buka `http://localhost:3000` > Login dengan akun super_admin.

---

## 7. Struktur Role & Akses

| Role | Buat Surat | Edit | Hapus | Approve | Kelola User | Kelola Lembaga |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| `super_admin` | V | V | V | V | V | V |
| `admin_tu` | V | V | - | - | Lihat | Edit lembaga sendiri |
| `staff` | V | V (draft sendiri) | - | - | - | Lihat |
| `kepala` | - | - | - | V | Lihat | Lihat |

---

## 8. Menambah User Baru

Sebagai super_admin, ada 2 cara:

**Cara A - Via Aplikasi** (halaman `/admin/pengguna`):
- Fitur ini belum support create user baru via UI (hanya edit role/status)

**Cara B - Via Supabase** (recommended untuk saat ini):
1. Supabase > Authentication > Add User (email + password, auto confirm)
2. Copy UUID, run SQL:
```sql
INSERT INTO user_profiles (id, full_name, role, lembaga_id, is_active)
VALUES (
  'UUID_USER_BARU',
  'Nama Lengkap',
  'staff',  -- atau: admin_tu, kepala, super_admin
  (SELECT id FROM lembaga WHERE kode = 'PKBM'),  -- sesuaikan kode lembaga
  true
);
```

---

## 9. Kode Lembaga

| Kode | Nama | Prefix Nomor Surat |
|------|------|---------------------|
| `YYS` | Yayasan Al-Ikhlas | YYS |
| `PKBM` | PKBM Al-Hikmah | PKBM |
| `RA` | RA Nurul Iman | RA |
| `KB` | KB Bunda Sayang | KB |
| `TK` | TK Harapan Bangsa | TK |

Format nomor surat: `001/YYS/II/2026` (auto-increment per lembaga per tahun)

---

## 10. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16.1.1 (App Router, Turbopack) |
| UI | React 19 + Shadcn UI + Tailwind CSS 4 |
| State | Zustand 5 |
| Forms | React Hook Form 7 + Zod 4 |
| Database | Supabase (PostgreSQL 15+) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| PWA | Service Worker + manifest.json |

---

## 11. Struktur Folder

```
client/src/
├── app/
│   ├── (dashboard)/          # Halaman setelah login
│   │   ├── dashboard/        # Dashboard utama
│   │   ├── surat/            # CRUD surat keluar
│   │   ├── lembaga/          # Data lembaga
│   │   ├── admin/            # Admin: lembaga, pengguna, pengaturan
│   │   ├── laporan/          # Statistik & laporan
│   │   └── profil/           # Edit profil user
│   ├── api/surat/            # API routes (create, [id])
│   ├── login/                # Halaman login
│   ├── globals.css           # Global styles + print styles
│   └── layout.tsx            # Root layout
├── components/
│   ├── features/
│   │   ├── auth/             # LoginForm
│   │   └── surat/            # Komponen surat
│   │       ├── shared/       # KopSurat, SuratMeta, SuratBody, SignatureBlock
│   │       ├── layouts/      # Layout per lembaga (YYS, PKBM, RA, KB, TK)
│   │       └── forms/        # SuratForm, TembusanInput
│   ├── layout/               # Sidebar, MobileNav, NavConfig
│   ├── shared/               # PageHeader, ConfirmDialog, dll
│   └── ui/                   # Shadcn UI components (30+)
├── constants/                # Routes, permissions, surat config
├── hooks/                    # useSurat, useLembaga, usePermissions
├── lib/
│   ├── supabase/             # Client, server, proxy
│   ├── date/                 # Format tanggal Indonesia
│   ├── format/               # Format nomor surat
│   └── validators.ts         # Zod schemas
├── stores/                   # Zustand auth store
└── types/                    # TypeScript types + database types
```

---

## 12. Build & Deploy

```bash
# Build production
cd client
npm run build

# Output di .next/
npm start
```

### Deploy ke Vercel:
1. Push ke GitHub
2. Import di Vercel
3. Set environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy

---

## 13. Troubleshooting

**Login gagal: "Akun tidak terdaftar dalam sistem"**
- User sudah ada di Supabase Auth tapi belum ada di `user_profiles`
- Solusi: INSERT ke `user_profiles` (lihat section 8)

**500 error saat query**
- Kemungkinan RLS policy bermasalah
- Cek: Supabase > Database > Policies

**Surat tidak muncul**
- User hanya bisa lihat surat dari lembaga sendiri (kecuali super_admin)
- Cek `lembaga_id` di `user_profiles` sudah sesuai

**Build error: proxy.ts + middleware.ts conflict**
- Next.js 16 hanya pakai `proxy.ts`, hapus `middleware.ts` jika ada

**Print surat tidak rapi**
- Gunakan browser Chrome/Edge untuk print
- Pastikan "Background graphics" dicentang di print dialog
