# Sistem Absensi PKBM Al Barakah

Sistem absensi guru berbasis lokasi GPS dengan fitur kamera selfie dan anti-fraud detection.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Maps**: Leaflet + react-leaflet

## 📋 Fitur

### Guru
- ✅ Login dengan email/password
- ✅ Absen masuk & pulang dengan selfie
- ✅ GPS tracking dengan reverse geocoding
- ✅ Deteksi fake GPS (mock location)
- ✅ Riwayat absensi dengan filter

### Admin
- ✅ Dashboard statistik
- ✅ Kelola data guru (CRUD)
- ✅ Peta lokasi absensi real-time
- ✅ Pengaturan jam absen & geofencing

## 🛠️ Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd absensi-pkbm
pnpm install
```

### 2. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Jalankan SQL schema di SQL Editor (file: `step-01-supabase-schema.sql`)
3. Buat Storage bucket `absensi-foto` (public)
4. Copy URL dan Anon Key ke `.env.local`

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Create Admin User

1. Supabase Dashboard → Authentication → Users → Add User
2. Create user dengan email/password
3. Copy User UID
4. Jalankan SQL:

```sql
INSERT INTO guru (auth_user_id, nama, email, is_admin, is_active, is_verified)
VALUES (
  'YOUR-USER-UUID',
  'Admin PKBM',
  'admin@example.com',
  true,
  true,
  true
);
```

### 5. Run Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login)
│   ├── (dashboard)/       # Protected routes
│   │   ├── absen/
│   │   ├── riwayat/
│   │   └── admin/
│   └── api/
├── components/
│   ├── ui/                # shadcn components
│   ├── layout/            # Sidebar, Header, Nav
│   ├── features/          # Feature components
│   └── shared/            # Reusable components
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── utils.ts
│   ├── geolocation.ts
│   └── validators.ts
├── stores/                # Zustand stores
├── hooks/                 # Custom hooks
├── types/                 # TypeScript types
└── middleware.ts          # Auth middleware
```

## 🔒 Security Features

- Row Level Security (RLS) di Supabase
- SECURITY DEFINER functions untuk bypass RLS (no recursion)
- Auth middleware protection
- Mock location detection
- Timestamp overlay on photos

## 📱 PWA Support

Aplikasi mendukung Progressive Web App (PWA):
- Install ke home screen
- Offline-capable (coming soon)
- Push notifications (coming soon)

## 🚀 Deployment

### Vercel

1. Push ke GitHub
2. Import di Vercel
3. Add environment variables
4. Deploy

## 📄 License

MIT License - PKBM Al Barakah
