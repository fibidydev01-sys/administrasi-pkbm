# 🏗️ ARSITEKTUR & INFRASTRUKTUR - SISTEM PERSURATAN

**Version:** 1.0.0  
**Stack:** Next.js 16 + React 19 + Supabase + TypeScript  
**Last Updated:** 2025-02-07

---

## 📋 TABLE OF CONTENTS

1. [Tech Stack](#tech-stack)
2. [Folder Structure](#folder-structure)
3. [Environment Setup](#environment-setup)
4. [Supabase Setup](#supabase-setup)
5. [Type Definitions](#type-definitions)
6. [Utilities & Helpers](#utilities--helpers)
7. [Supabase Client](#supabase-client)
8. [Components](#components)
9. [API Routes](#api-routes)
10. [Pages/Routes](#pagesroutes)
11. [Deployment](#deployment)

---

## 🎯 TECH STACK

### **Core Framework:**
```json
{
  "framework": "Next.js 16.1.1 (App Router)",
  "react": "19.2.3",
  "typescript": "5.x",
  "styling": "Tailwind CSS 4.x + Shadcn UI"
}
```

### **Database & Auth:**
```json
{
  "database": "PostgreSQL (Supabase)",
  "orm": "@supabase/supabase-js 2.89.0",
  "auth": "Supabase Auth + @supabase/ssr"
}
```

### **Form & Validation:**
```json
{
  "forms": "react-hook-form 7.69.0",
  "validation": "zod 4.3.4",
  "resolver": "@hookform/resolvers 5.2.2"
}
```

### **UI Components:**
```json
{
  "components": "Radix UI (via Shadcn)",
  "icons": "lucide-react 0.562.0",
  "notifications": "sonner 2.0.7",
  "dates": "date-fns 4.1.0 + react-day-picker 9.13.0"
}
```

### **State Management:**
```json
{
  "global": "zustand 5.0.9 (optional)",
  "theme": "next-themes 0.4.6"
}
```

---

## 📁 FOLDER STRUCTURE

```
sistem-persuratan/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/              # Protected routes
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │
│   │   ├── surat/
│   │   │   ├── page.tsx          # List surat
│   │   │   ├── buat/
│   │   │   │   └── page.tsx      # Form buat surat
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Detail surat
│   │   │       └── edit/
│   │   │           └── page.tsx  # Edit surat
│   │   │
│   │   ├── lembaga/
│   │   │   ├── page.tsx          # List lembaga
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Edit lembaga settings
│   │   │
│   │   ├── laporan/
│   │   │   └── page.tsx          # Reporting & statistik
│   │   │
│   │   └── layout.tsx            # Dashboard layout with sidebar
│   │
│   ├── api/                      # API Routes
│   │   ├── surat/
│   │   │   ├── create/
│   │   │   │   └── route.ts
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── generate-pdf/
│   │   │       └── route.ts
│   │   │
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts
│   │
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── page.tsx                  # Landing page
│
├── components/                   # React Components
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── calendar.tsx
│   │   └── ...
│   │
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── DashboardLayout.tsx
│   │
│   ├── surat/                    # Surat-specific components
│   │   ├── SuratRenderer.tsx     # Main renderer (router)
│   │   │
│   │   ├── layouts/              # Layout per lembaga (PATEN)
│   │   │   ├── YayasanLayout.tsx
│   │   │   ├── PKBMLayout.tsx
│   │   │   ├── RALayout.tsx
│   │   │   ├── KBLayout.tsx
│   │   │   └── TKLayout.tsx
│   │   │
│   │   ├── shared/               # Reusable components
│   │   │   ├── KopSurat.tsx
│   │   │   ├── SuratMeta.tsx
│   │   │   ├── SuratBody.tsx
│   │   │   ├── SignatureBlock.tsx
│   │   │   └── TembusanList.tsx
│   │   │
│   │   ├── forms/                # Form components
│   │   │   ├── SuratForm.tsx
│   │   │   ├── LembagaForm.tsx
│   │   │   └── TembusanInput.tsx
│   │   │
│   │   └── SuratPreview.tsx      # Preview component
│   │
│   ├── forms/                    # Generic form components
│   │   ├── FormField.tsx
│   │   ├── FormInput.tsx
│   │   ├── FormTextarea.tsx
│   │   ├── FormSelect.tsx
│   │   └── FormDatePicker.tsx
│   │
│   └── common/                   # Common components
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       └── ConfirmDialog.tsx
│
├── lib/                          # Libraries & utilities
│   ├── supabase/
│   │   ├── client.ts             # Supabase client
│   │   ├── server.ts             # Server-side client
│   │   └── middleware.ts         # Auth middleware
│   │
│   ├── utils/
│   │   ├── cn.ts                 # Tailwind merge utility
│   │   ├── date.ts               # Date formatting utils
│   │   ├── format.ts             # String formatters
│   │   └── validation.ts         # Common validators
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useSurat.ts
│   │   ├── useLembaga.ts
│   │   └── usePermissions.ts
│   │
│   └── stores/                   # Zustand stores (optional)
│       ├── authStore.ts
│       └── uiStore.ts
│
├── types/                        # TypeScript type definitions
│   ├── database.types.ts         # Auto-generated from Supabase
│   ├── surat.types.ts
│   ├── lembaga.types.ts
│   └── user.types.ts
│
├── constants/                    # Constants & config
│   ├── routes.ts
│   ├── permissions.ts
│   └── surat.config.ts
│
├── public/                       # Static files
│   ├── fonts/
│   ├── images/
│   └── favicon.ico
│
├── .env.local                    # Environment variables (JANGAN COMMIT!)
├── .env.example                  # Template env vars
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
└── README.md                     # Project documentation
```

---

## ⚙️ ENVIRONMENT SETUP

### **1. Clone & Install**

```bash
# Clone repository (atau buat project baru)
npx create-next-app@latest sistem-persuratan --typescript --tailwind --app

cd sistem-persuratan

# Install dependencies
npm install @supabase/ssr @supabase/supabase-js
npm install react-hook-form @hookform/resolvers zod
npm install date-fns react-day-picker
npm install sonner
npm install zustand
npm install next-themes

# Install Shadcn UI
npx shadcn@latest init

# Install required components
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add tabs
npx shadcn@latest add calendar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add separator
npx shadcn@latest add scroll-area
npx shadcn@latest add tooltip
npx shadcn@latest add avatar
npx shadcn@latest add label
```

### **2. Environment Variables**

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Sistem Persuratan"

# Optional: PDF Generation
# PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

Create `.env.example` (untuk template):

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=
```

---

## 🗄️ SUPABASE SETUP

### **1. Create Supabase Project**

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in details:
   - Name: `sistem-persuratan`
   - Database Password: (strong password)
   - Region: (pilih terdekat)
4. Wait for project to be ready (±2 menit)

### **2. Run SQL Migration**

1. Di Supabase Dashboard → SQL Editor
2. Copy-paste semua code dari file `SQL_SCHEMA_SISTEM_PERSURATAN.md`
3. Click RUN
4. Verify tables created di Table Editor

### **3. Setup Storage Buckets**

Di Supabase Dashboard → Storage:

**Bucket 1: lembaga-logos**
```
Name: lembaga-logos
Public: true
File size limit: 2MB
Allowed MIME types: image/png, image/jpeg
```

**Bucket 2: lembaga-ttd**
```
Name: lembaga-ttd
Public: true
File size limit: 1MB
Allowed MIME types: image/png
```

**Bucket 3: surat-pdf**
```
Name: surat-pdf
Public: false (private)
File size limit: 10MB
Allowed MIME types: application/pdf
```

Run SQL untuk bucket policies:

```sql
-- Policy: lembaga-logos (public read)
CREATE POLICY "Public can read logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lembaga-logos');

CREATE POLICY "Authenticated can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lembaga-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: lembaga-ttd (public read)
CREATE POLICY "Public can read ttd"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lembaga-ttd');

CREATE POLICY "Authenticated can upload ttd"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lembaga-ttd'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: surat-pdf (private, per lembaga)
CREATE POLICY "Users can read own lembaga PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'surat-pdf'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND (storage.foldername(name))[1] = user_profiles.lembaga_id::text
  )
);

CREATE POLICY "Users can upload PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'surat-pdf'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND (storage.foldername(name))[1] = user_profiles.lembaga_id::text
  )
);
```

### **4. Create First User**

Di Supabase Dashboard → Authentication → Users:

1. Click "Add User"
2. Email: `admin@yayasan.com`
3. Password: (set strong password)
4. Auto-confirm user: ✅

Kemudian run SQL untuk insert profile:

```sql
INSERT INTO user_profiles (id, full_name, role, lembaga_id, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@yayasan.com'),
  'Super Administrator',
  'super_admin',
  NULL, -- super admin tidak terikat lembaga
  true
);
```

---

## 📝 TYPE DEFINITIONS

### **types/database.types.ts**

```typescript
// Auto-generated by Supabase CLI
// Run: npx supabase gen types typescript --project-id your-project-id > types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      lembaga: {
        Row: {
          id: string
          kode: string
          nama: string
          alamat: string
          telepon: string | null
          email: string | null
          website: string | null
          logo_url: string | null
          ttd_jabatan: string | null
          ttd_nama: string | null
          ttd_nip: string | null
          ttd_image_url: string | null
          nomor_prefix: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kode: string
          nama: string
          alamat: string
          telepon?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          ttd_jabatan?: string | null
          ttd_nama?: string | null
          ttd_nip?: string | null
          ttd_image_url?: string | null
          nomor_prefix: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kode?: string
          nama?: string
          alamat?: string
          telepon?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          ttd_jabatan?: string | null
          ttd_nama?: string | null
          ttd_nip?: string | null
          ttd_image_url?: string | null
          nomor_prefix?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      surat_keluar: {
        Row: {
          id: string
          lembaga_id: string
          nomor_surat: string
          tanggal_surat: string
          perihal: string
          kepada: string
          alamat_tujuan: string | null
          isi_surat: string
          lampiran: string | null
          sifat: string
          snapshot_ttd: Json
          pdf_url: string | null
          pdf_generated_at: string | null
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
          approved_by: string | null
          approved_at: string | null
          deleted_at: string | null
          deleted_by: string | null
        }
        Insert: {
          id?: string
          lembaga_id: string
          nomor_surat: string
          tanggal_surat?: string
          perihal: string
          kepada: string
          alamat_tujuan?: string | null
          isi_surat: string
          lampiran?: string | null
          sifat?: string
          snapshot_ttd?: Json
          pdf_url?: string | null
          pdf_generated_at?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          approved_by?: string | null
          approved_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
        }
        Update: {
          id?: string
          lembaga_id?: string
          nomor_surat?: string
          tanggal_surat?: string
          perihal?: string
          kepada?: string
          alamat_tujuan?: string | null
          isi_surat?: string
          lampiran?: string | null
          sifat?: string
          snapshot_ttd?: Json
          pdf_url?: string | null
          pdf_generated_at?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          approved_by?: string | null
          approved_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
        }
      }
      surat_tembusan: {
        Row: {
          id: string
          surat_id: string
          nama_penerima: string
          urutan: number
          created_at: string
        }
        Insert: {
          id?: string
          surat_id: string
          nama_penerima: string
          urutan?: number
          created_at?: string
        }
        Update: {
          id?: string
          surat_id?: string
          nama_penerima?: string
          urutan?: number
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string
          role: string
          lembaga_id: string | null
          avatar_url: string | null
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role: string
          lembaga_id?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: string
          lembaga_id?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      v_surat_lengkap: {
        Row: {
          id: string
          nomor_surat: string
          tanggal_surat: string
          perihal: string
          kepada: string
          alamat_tujuan: string | null
          isi_surat: string
          lampiran: string | null
          sifat: string
          status: string
          pdf_url: string | null
          created_at: string
          lembaga_kode: string
          lembaga_nama: string
          lembaga_alamat: string
          lembaga_telepon: string | null
          lembaga_email: string | null
          ttd_jabatan: string | null
          ttd_nama: string | null
          ttd_nip: string | null
          created_by_name: string | null
          created_by_role: string | null
          tembusan_list: string[]
        }
      }
    }
    Functions: {
      generate_nomor_surat: {
        Args: {
          p_lembaga_id: string
          p_tanggal?: string
        }
        Returns: string
      }
      create_surat_with_snapshot: {
        Args: {
          p_lembaga_id: string
          p_perihal: string
          p_kepada: string
          p_isi_surat: string
          p_tanggal_surat?: string
          p_alamat_tujuan?: string
          p_lampiran?: string
          p_sifat?: string
          p_created_by?: string
        }
        Returns: string
      }
      search_surat: {
        Args: {
          p_search_query: string
          p_lembaga_id?: string
          p_limit?: number
        }
        Returns: {
          id: string
          nomor_surat: string
          tanggal_surat: string
          perihal: string
          kepada: string
          rank: number
        }[]
      }
    }
  }
}
```

### **types/surat.types.ts**

```typescript
import { Database } from './database.types'

export type Lembaga = Database['public']['Tables']['lembaga']['Row']
export type LembagaInsert = Database['public']['Tables']['lembaga']['Insert']
export type LembagaUpdate = Database['public']['Tables']['lembaga']['Update']

export type Surat = Database['public']['Tables']['surat_keluar']['Row']
export type SuratInsert = Database['public']['Tables']['surat_keluar']['Insert']
export type SuratUpdate = Database['public']['Tables']['surat_keluar']['Update']

export type Tembusan = Database['public']['Tables']['surat_tembusan']['Row']
export type TembusanInsert = Database['public']['Tables']['surat_tembusan']['Insert']

export type SuratLengkap = Database['public']['Views']['v_surat_lengkap']['Row']

// Extended types dengan relasi
export type SuratWithRelations = Surat & {
  lembaga: Lembaga
  tembusan: Tembusan[]
  created_by_profile?: {
    full_name: string
    role: string
  }
}

// Form types
export type SuratFormData = {
  lembaga_id: string
  perihal: string
  kepada: string
  alamat_tujuan?: string
  isi_surat: string
  lampiran?: string
  sifat: 'Biasa' | 'Penting' | 'Segera' | 'Rahasia'
  tembusan: string[]
}

export type LembagaFormData = Omit<LembagaInsert, 'id' | 'created_at' | 'updated_at'>

// Snapshot TTD type
export type SnapshotTTD = {
  jabatan: string | null
  nama: string | null
  nip: string | null
  image_url: string | null
  captured_at: string
}
```

### **types/user.types.ts**

```typescript
import { Database } from './database.types'

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserRole = 'super_admin' | 'admin_tu' | 'staff' | 'kepala'

export type Permissions = {
  surat: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
    approve: boolean
  }
  lembaga: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
  }
  user: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
  }
  settings: {
    access: boolean
  }
}

export type AuthUser = {
  id: string
  email: string
  profile: UserProfile
  permissions: Permissions
}
```

---

## 🛠️ UTILITIES & HELPERS

### **lib/utils/cn.ts**

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### **lib/utils/date.ts**

```typescript
import { format, parseISO } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

/**
 * Format date ke format Indonesia
 * @param date - Date string atau Date object
 * @returns String tanggal dalam format Indonesia
 * @example formatTanggal('2025-02-07') => 'Jakarta, 07 Februari 2025'
 */
export function formatTanggal(date: string | Date, withCity: boolean = true): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const formatted = format(dateObj, 'dd MMMM yyyy', { locale: localeId })
  
  return withCity ? `Jakarta, ${formatted}` : formatted
}

/**
 * Format date untuk input date field
 * @param date - Date object
 * @returns String dalam format YYYY-MM-DD
 */
export function formatDateInput(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Convert bulan ke romawi
 * @param month - Bulan (1-12)
 * @returns String romawi
 */
export function monthToRoman(month: number): string {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  return romans[month - 1] || ''
}

/**
 * Format nomor surat
 * @param counter - Nomor urut
 * @param prefix - Kode lembaga
 * @param date - Tanggal surat
 * @returns String nomor surat (contoh: 001/YYS/II/2025)
 */
export function formatNomorSurat(counter: number, prefix: string, date: Date): string {
  const paddedCounter = String(counter).padStart(3, '0')
  const month = monthToRoman(date.getMonth() + 1)
  const year = date.getFullYear()
  
  return `${paddedCounter}/${prefix}/${month}/${year}`
}
```

### **lib/utils/format.ts**

```typescript
/**
 * Truncate text dengan ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format: (021) 1234567
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
  }
  
  return phone
}
```

### **lib/utils/validation.ts**

```typescript
import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Email tidak valid')

export const phoneSchema = z.string()
  .min(10, 'Nomor telepon minimal 10 digit')
  .regex(/^[0-9\(\)\-\s]+$/, 'Nomor telepon hanya boleh berisi angka dan karakter ( ) -')

export const urlSchema = z.string().url('URL tidak valid').or(z.literal(''))

// Validation helpers
export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success
}

export function isValidPhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success
}

export function isValidUrl(url: string): boolean {
  return urlSchema.safeParse(url).success
}
```

---

## 🔐 SUPABASE CLIENT

### **lib/supabase/client.ts**

```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### **lib/supabase/server.ts**

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

### **lib/supabase/middleware.ts**

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return response
}
```

### **middleware.ts** (di root folder)

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 🎣 CUSTOM HOOKS

### **lib/hooks/useAuth.ts**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AuthUser, UserProfile, Permissions } from '@/types/user.types'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserData(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserData(authUser: User) {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) throw profileError

      // Get permissions
      const { data: roleData, error: roleError } = await supabase
        .from('role_permissions')
        .select('permissions')
        .eq('role', profile.role)
        .single()

      if (roleError) throw roleError

      setUser({
        id: authUser.id,
        email: authUser.email!,
        profile: profile as UserProfile,
        permissions: roleData.permissions as Permissions,
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return {
    user,
    loading,
    signIn,
    signOut,
  }
}
```

### **lib/hooks/useSurat.ts**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SuratWithRelations } from '@/types/surat.types'
import { useAuth } from './useAuth'

export function useSurat(suratId?: string) {
  const [surat, setSurat] = useState<SuratWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const { user } = useAuth()

  useEffect(() => {
    if (suratId) {
      loadSurat()
    }
  }, [suratId])

  async function loadSurat() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('surat_keluar')
        .select(`
          *,
          lembaga(*),
          tembusan:surat_tembusan(*),
          created_by_profile:user_profiles!created_by(full_name, role)
        `)
        .eq('id', suratId!)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      setSurat(data as any)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function createSurat(data: any) {
    try {
      const response = await fetch('/api/surat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      return await response.json()
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  async function updateSurat(id: string, data: any) {
    try {
      const { error } = await supabase
        .from('surat_keluar')
        .update(data)
        .eq('id', id)

      if (error) throw error
      await loadSurat()
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  async function deleteSurat(id: string) {
    try {
      const { error } = await supabase
        .from('surat_keluar')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id,
        })
        .eq('id', id)

      if (error) throw error
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  return {
    surat,
    loading,
    error,
    createSurat,
    updateSurat,
    deleteSurat,
    refresh: loadSurat,
  }
}

export function useSuratList(lembagaId?: string) {
  const [surats, setSurats] = useState<SuratWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadSurats()
  }, [lembagaId])

  async function loadSurats() {
    try {
      setLoading(true)
      let query = supabase
        .from('surat_keluar')
        .select(`
          *,
          lembaga(*),
          tembusan:surat_tembusan(*)
        `)
        .is('deleted_at', null)
        .order('tanggal_surat', { ascending: false })
        .limit(50)

      if (lembagaId) {
        query = query.eq('lembaga_id', lembagaId)
      }

      const { data, error } = await query

      if (error) throw error
      setSurats(data as any)
    } catch (err) {
      console.error('Error loading surats:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    surats,
    loading,
    refresh: loadSurats,
  }
}
```

### **lib/hooks/useLembaga.ts**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lembaga } from '@/types/surat.types'

export function useLembaga(lembagaId?: string) {
  const [lembaga, setLembaga] = useState<Lembaga | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (lembagaId) {
      loadLembaga()
    }
  }, [lembagaId])

  async function loadLembaga() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('lembaga')
        .select('*')
        .eq('id', lembagaId!)
        .single()

      if (error) throw error
      setLembaga(data)
    } catch (err) {
      console.error('Error loading lembaga:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateLembaga(data: Partial<Lembaga>) {
    try {
      const { error } = await supabase
        .from('lembaga')
        .update(data)
        .eq('id', lembagaId!)

      if (error) throw error
      await loadLembaga()
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  return {
    lembaga,
    loading,
    updateLembaga,
    refresh: loadLembaga,
  }
}

export function useLembagaList() {
  const [lembagas, setLembagas] = useState<Lembaga[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadLembagas()
  }, [])

  async function loadLembagas() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('lembaga')
        .select('*')
        .eq('is_active', true)
        .order('nama')

      if (error) throw error
      setLembagas(data)
    } catch (err) {
      console.error('Error loading lembagas:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    lembagas,
    loading,
    refresh: loadLembagas,
  }
}
```

---

## 📦 COMPONENTS

### **components/surat/SuratRenderer.tsx**

```typescript
import { SuratWithRelations } from '@/types/surat.types'
import YayasanLayout from './layouts/YayasanLayout'
import PKBMLayout from './layouts/PKBMLayout'
import RALayout from './layouts/RALayout'
import KBLayout from './layouts/KBLayout'
import TKLayout from './layouts/TKLayout'

interface SuratRendererProps {
  surat: SuratWithRelations
}

export default function SuratRenderer({ surat }: SuratRendererProps) {
  const LayoutComponent = {
    'YYS': YayasanLayout,
    'PKBM': PKBMLayout,
    'RA': RALayout,
    'KB': KBLayout,
    'TK': TKLayout,
  }[surat.lembaga.kode]

  if (!LayoutComponent) {
    return (
      <div className="p-8 text-center text-red-500">
        Layout tidak ditemukan untuk {surat.lembaga.kode}
      </div>
    )
  }

  return <LayoutComponent surat={surat} />
}
```

### **components/surat/layouts/YayasanLayout.tsx**

```typescript
import { SuratWithRelations } from '@/types/surat.types'
import KopSurat from '../shared/KopSurat'
import SuratMeta from '../shared/SuratMeta'
import SuratBody from '../shared/SuratBody'
import SignatureBlock from '../shared/SignatureBlock'
import TembusanList from '../shared/TembusanList'

interface YayasanLayoutProps {
  surat: SuratWithRelations
}

export default function YayasanLayout({ surat }: YayasanLayoutProps) {
  return (
    <div className="surat-container a4-page">
      {/* KOP SURAT - Layout Fixed, Data Dinamis */}
      <KopSurat
        lembaga={surat.lembaga}
        variant="yayasan" // Style khusus Yayasan
      />
      
      {/* NOMOR & PERIHAL */}
      <SuratMeta
        nomorSurat={surat.nomor_surat}
        perihal={surat.perihal}
        lampiran={surat.lampiran}
      />
      
      {/* TUJUAN */}
      <div className="surat-tujuan mt-5">
        <p>
          Kepada Yth,<br/>
          {surat.kepada}<br/>
          {surat.alamat_tujuan && <>di {surat.alamat_tujuan}</>}
        </p>
      </div>
      
      {/* ISI SURAT */}
      <SuratBody isiSurat={surat.isi_surat} />
      
      {/* TANDA TANGAN */}
      <SignatureBlock
        tanggal={surat.tanggal_surat}
        snapshot={surat.snapshot_ttd as any}
        lembaga={surat.lembaga}
        position="right" // Position khusus Yayasan (PATEN!)
      />
      
      {/* TEMBUSAN */}
      {surat.tembusan && surat.tembusan.length > 0 && (
        <TembusanList tembusan={surat.tembusan} />
      )}
    </div>
  )
}
```

### **components/surat/shared/KopSurat.tsx**

```typescript
import { Lembaga } from '@/types/surat.types'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

interface KopSuratProps {
  lembaga: Lembaga
  variant?: 'yayasan' | 'pkbm' | 'ra' | 'kb' | 'tk'
}

export default function KopSurat({ lembaga, variant = 'yayasan' }: KopSuratProps) {
  // Variant-specific styles (PATEN!)
  const styles = {
    yayasan: {
      logoPosition: 'center',
      titleSize: '18pt',
      dividerStyle: 'double',
    },
    pkbm: {
      logoPosition: 'left',
      titleSize: '16pt',
      dividerStyle: 'single',
    },
    ra: {
      logoPosition: 'center',
      titleSize: '16pt',
      dividerStyle: 'double',
    },
    kb: {
      logoPosition: 'center',
      titleSize: '16pt',
      dividerStyle: 'single',
    },
    tk: {
      logoPosition: 'center',
      titleSize: '16pt',
      dividerStyle: 'double',
    },
  }[variant]

  return (
    <header className="kop-surat">
      <div className={cn(
        "flex items-center gap-4",
        styles.logoPosition === 'center' && "justify-center",
        styles.logoPosition === 'left' && "justify-start"
      )}>
        {/* Logo */}
        {lembaga.logo_url && (
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src={lembaga.logo_url}
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
        )}
        
        {/* Title & Contact */}
        <div className={cn(
          "flex-1",
          styles.logoPosition === 'center' && "text-center"
        )}>
          {/* Nama Lembaga */}
          <h1 
            className="font-bold uppercase"
            style={{ fontSize: styles.titleSize }}
          >
            {lembaga.nama}
          </h1>
          
          {/* Kontak */}
          <div className="text-[10pt] mt-1">
            <p>{lembaga.alamat}</p>
            <p className="flex gap-2 items-center justify-center">
              {lembaga.telepon && <span>Telp: {lembaga.telepon}</span>}
              {lembaga.email && <span>| Email: {lembaga.email}</span>}
              {lembaga.website && <span>| {lembaga.website}</span>}
            </p>
          </div>
        </div>
      </div>
      
      {/* Garis Pembatas (PATEN berdasarkan variant!) */}
      <div 
        className={cn(
          "mt-3 mb-5",
          styles.dividerStyle === 'double' && "border-t-[3px] border-double border-black",
          styles.dividerStyle === 'single' && "border-t-2 border-black"
        )}
      />
    </header>
  )
}
```

### **components/surat/shared/SuratMeta.tsx**

```typescript
interface SuratMetaProps {
  nomorSurat: string
  perihal: string
  lampiran?: string | null
}

export default function SuratMeta({ nomorSurat, perihal, lampiran }: SuratMetaProps) {
  return (
    <div className="surat-meta mt-5">
      <table className="w-full">
        <tbody>
          <tr>
            <td className="w-24 py-0.5 align-top">Nomor</td>
            <td className="py-0.5">: {nomorSurat}</td>
          </tr>
          <tr>
            <td className="py-0.5 align-top">Hal</td>
            <td className="py-0.5">: {perihal}</td>
          </tr>
          {lampiran && (
            <tr>
              <td className="py-0.5 align-top">Lampiran</td>
              <td className="py-0.5">: {lampiran}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
```

### **components/surat/shared/SuratBody.tsx**

```typescript
interface SuratBodyProps {
  isiSurat: string
}

export default function SuratBody({ isiSurat }: SuratBodyProps) {
  return (
    <div className="surat-body mt-5">
      {/* Pembuka (PATEN!) */}
      <p>Dengan hormat,</p>
      
      {/* Isi surat */}
      <div 
        className="text-justify leading-relaxed my-4"
        dangerouslySetInnerHTML={{ __html: isiSurat }}
      />
      
      {/* Penutup (PATEN!) */}
      <p className="mt-4">
        Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya 
        kami ucapkan terima kasih.
      </p>
    </div>
  )
}
```

### **components/surat/shared/SignatureBlock.tsx**

```typescript
import { Lembaga, SnapshotTTD } from '@/types/surat.types'
import { formatTanggal } from '@/lib/utils/date'
import Image from 'next/image'

interface SignatureBlockProps {
  tanggal: string
  snapshot: SnapshotTTD
  lembaga: Lembaga
  position?: 'left' | 'center' | 'right'
}

export default function SignatureBlock({ 
  tanggal, 
  snapshot, 
  lembaga, 
  position = 'right' 
}: SignatureBlockProps) {
  // Gunakan snapshot jika ada, fallback ke data lembaga current
  const ttdData = {
    jabatan: snapshot?.jabatan || lembaga.ttd_jabatan,
    nama: snapshot?.nama || lembaga.ttd_nama,
    nip: snapshot?.nip || lembaga.ttd_nip,
    image_url: snapshot?.image_url || lembaga.ttd_image_url,
  }

  return (
    <div 
      className="signature-block mt-10 w-1/2"
      style={{
        marginLeft: position === 'right' ? 'auto' : 
                   position === 'center' ? 'auto' : 0,
        marginRight: position === 'center' ? 'auto' : 0,
      }}
    >
      <p className="text-center">{formatTanggal(tanggal)}</p>
      <p className="text-center mt-1">{ttdData.jabatan},</p>
      
      {/* TTD Image */}
      {ttdData.image_url && (
        <div className="relative w-full h-16 my-3">
          <Image
            src={ttdData.image_url}
            alt="TTD"
            fill
            className="object-contain"
          />
        </div>
      )}
      
      {/* Nama */}
      <p 
        className="text-center font-bold underline"
        style={{ marginTop: ttdData.image_url ? '8px' : '60px' }}
      >
        {ttdData.nama}
      </p>
      
      {/* NIP */}
      {ttdData.nip && (
        <p className="text-center text-[10pt] mt-1">
          NIP. {ttdData.nip}
        </p>
      )}
    </div>
  )
}
```

### **components/surat/shared/TembusanList.tsx**

```typescript
import { Tembusan } from '@/types/surat.types'

interface TembusanListProps {
  tembusan: Tembusan[]
}

export default function TembusanList({ tembusan }: TembusanListProps) {
  if (!tembusan || tembusan.length === 0) return null

  // Sort by urutan
  const sortedTembusan = [...tembusan].sort((a, b) => a.urutan - b.urutan)

  return (
    <div className="tembusan-list mt-10">
      <p className="font-bold">Tembusan:</p>
      <ol className="list-decimal list-inside mt-2">
        {sortedTembusan.map((item) => (
          <li key={item.id}>{item.nama_penerima}</li>
        ))}
      </ol>
    </div>
  )
}
```

---

## 🔌 API ROUTES

### **app/api/surat/create/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      lembaga_id,
      perihal,
      kepada,
      alamat_tujuan,
      isi_surat,
      lampiran,
      sifat,
      tanggal_surat,
      tembusan,
    } = body

    // Validate required fields
    if (!lembaga_id || !perihal || !kepada || !isi_surat) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create surat dengan helper function (includes snapshot)
    const { data: suratId, error: createError } = await supabase
      .rpc('create_surat_with_snapshot', {
        p_lembaga_id: lembaga_id,
        p_perihal: perihal,
        p_kepada: kepada,
        p_isi_surat: isi_surat,
        p_tanggal_surat: tanggal_surat || new Date().toISOString().split('T')[0],
        p_alamat_tujuan: alamat_tujuan || null,
        p_lampiran: lampiran || null,
        p_sifat: sifat || 'Biasa',
        p_created_by: user.id,
      })

    if (createError) {
      console.error('Error creating surat:', createError)
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      )
    }

    // Insert tembusan (if any)
    if (tembusan && tembusan.length > 0) {
      const tembusanData = tembusan.map((nama: string, index: number) => ({
        surat_id: suratId,
        nama_penerima: nama,
        urutan: index + 1,
      }))

      const { error: tembusanError } = await supabase
        .from('surat_tembusan')
        .insert(tembusanData)

      if (tembusanError) {
        console.error('Error creating tembusan:', tembusanError)
        // Don't fail the whole request, just log
      }
    }

    // Get full surat data
    const { data: surat, error: fetchError } = await supabase
      .from('surat_keluar')
      .select(`
        *,
        lembaga(*),
        tembusan:surat_tembusan(*)
      `)
      .eq('id', suratId)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    // TODO: Trigger PDF generation in background
    // You can use a queue service or Next.js background jobs

    return NextResponse.json({
      success: true,
      data: surat,
    })

  } catch (error: any) {
    console.error('Error in create surat API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### **app/api/surat/[id]/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: surat, error } = await supabase
      .from('surat_keluar')
      .select(`
        *,
        lembaga(*),
        tembusan:surat_tembusan(*),
        created_by_profile:user_profiles!created_by(full_name, role)
      `)
      .eq('id', params.id)
      .is('deleted_at', null)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: surat })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Update surat
    const { error: updateError } = await supabase
      .from('surat_keluar')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Get updated data
    const { data: surat, error: fetchError } = await supabase
      .from('surat_keluar')
      .select(`
        *,
        lembaga(*),
        tembusan:surat_tembusan(*)
      `)
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: surat,
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Soft delete
    const { error } = await supabase
      .from('surat_keluar')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      })
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

---

## 🚀 DEPLOYMENT

### **Vercel Deployment**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Set environment variables di Vercel Dashboard
# Settings → Environment Variables → Add:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY

# 5. Redeploy untuk apply env vars
vercel --prod
```

### **Post-Deployment Checklist**

- [ ] Database migration di-run di Supabase
- [ ] Storage buckets sudah dibuat
- [ ] Environment variables sudah di-set
- [ ] First user sudah dibuat dengan role super_admin
- [ ] Test login berhasil
- [ ] Test buat surat berhasil
- [ ] Upload logo & TTD berhasil
- [ ] PDF generation working (jika sudah diimplement)

---

## 📚 ADDITIONAL NOTES

### **Package Tambahan untuk PDF Generation**

Pilih salah satu:

**Option 1: @react-pdf/renderer** (Recommended untuk MVP)
```bash
npm install @react-pdf/renderer
```

**Option 2: Puppeteer** (Lebih powerful, butuh setup lebih)
```bash
npm install puppeteer
```

### **Rich Text Editor (Optional)**

Untuk isi surat dengan formatting:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
```

---

## ✅ NEXT STEPS

1. ✅ Setup environment variables
2. ✅ Run SQL migration di Supabase
3. ✅ Setup Storage buckets
4. ✅ Create first super admin user
5. ⏳ Implement PDF generation
6. ⏳ Implement file upload (logo & TTD)
7. ⏳ Add rich text editor untuk isi surat
8. ⏳ Build reporting & statistik pages
9. ⏳ Testing & bug fixes
10. ⏳ Deploy to production

---

**Arsitektur ini siap untuk development! 🚀**

Semua folder, types, dan boilerplate code sudah disusun.
Tinggal implement detail logic per page dan component.

**Estimasi development time:** 2-3 minggu untuk MVP lengkap.
