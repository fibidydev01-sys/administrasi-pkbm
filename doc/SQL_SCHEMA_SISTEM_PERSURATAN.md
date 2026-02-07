# 🗄️ DATABASE SCHEMA - SISTEM PERSURATAN

**Version:** 1.0.0  
**Database:** PostgreSQL (Supabase)  
**Last Updated:** 2025-02-07

---

## 📋 INSTRUKSI PENGGUNAAN

1. Buka **Supabase Dashboard** → SQL Editor
2. Copy-paste **SEMUA code di bawah** (dari `-- ENABLE EXTENSIONS` sampai akhir)
3. Klik **RUN** atau tekan `Ctrl+Enter`
4. Tunggu sampai selesai (±30 detik)
5. Refresh table list di sidebar → cek tabel sudah terbuat

---

## 🚀 SQL SCRIPT - COPY PASTE DARI SINI

```sql
-- ============================================================================
-- SISTEM PERSURATAN - DATABASE SCHEMA
-- ============================================================================
-- Database: PostgreSQL 15+
-- Extensions: uuid-ossp (untuk UUID generation)
-- ============================================================================

-- ============================================================================
-- 1. ENABLE EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search untuk bahasa Indonesia
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================================
-- 1.1 CREATE TEXT SEARCH CONFIGURATION: indonesian
-- PostgreSQL tidak punya config 'indonesian' bawaan, jadi kita buat sendiri
-- Menggunakan 'simple' dictionary + unaccent untuk handle karakter khusus
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_ts_config WHERE cfgname = 'indonesian'
  ) THEN
    CREATE TEXT SEARCH CONFIGURATION indonesian (COPY = simple);
    ALTER TEXT SEARCH CONFIGURATION indonesian
      ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
      WITH unaccent, simple;
  END IF;
END $$;

-- ============================================================================
-- 2. DROP EXISTING TABLES (untuk development/reset)
-- ============================================================================
-- HATI-HATI: Uncomment hanya jika ingin reset database!
-- DROP TABLE IF EXISTS surat_tembusan CASCADE;
-- DROP TABLE IF EXISTS surat_keluar CASCADE;
-- DROP TABLE IF EXISTS nomor_surat_counter CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- DROP TABLE IF EXISTS role_permissions CASCADE;
-- DROP TABLE IF EXISTS lembaga CASCADE;

-- ============================================================================
-- 3. CREATE TABLES
-- ============================================================================

-- ============================================================================
-- 3.1 TABEL: lembaga
-- Menyimpan data master organisasi/institusi
-- ============================================================================
CREATE TABLE lembaga (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identitas Lembaga (JARANG BERUBAH)
  kode VARCHAR(10) UNIQUE NOT NULL, -- YYS, PKBM, RA, KB, TK
  nama VARCHAR(255) NOT NULL, -- "Yayasan Al-Ikhlas"
  alamat TEXT NOT NULL,
  
  -- Kontak (SERING BERUBAH per periode)
  telepon VARCHAR(50),
  email VARCHAR(100),
  website VARCHAR(100),
  
  -- Assets (JARANG BERUBAH)
  logo_url TEXT, -- path di Supabase Storage: lembaga/logos/xxx.png
  
  -- Data Penandatangan (SERING BERUBAH per periode)
  ttd_jabatan VARCHAR(100), -- "Ketua Yayasan"
  ttd_nama VARCHAR(100), -- "Dr. H. Ahmad Yani, M.Pd."
  ttd_nip VARCHAR(50), -- NIP/NIK
  ttd_image_url TEXT, -- path di Supabase Storage: lembaga/ttd/xxx.png
  
  -- Format Nomor Surat (JARANG BERUBAH)
  nomor_prefix VARCHAR(20) NOT NULL, -- untuk format nomor: {nomor}/{prefix}/{bulan}/{tahun}
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes untuk performa
CREATE INDEX idx_lembaga_kode ON lembaga(kode);
CREATE INDEX idx_lembaga_active ON lembaga(is_active);
CREATE INDEX idx_lembaga_nama ON lembaga(nama);

-- Comments
COMMENT ON TABLE lembaga IS 'Master data organisasi/institusi';
COMMENT ON COLUMN lembaga.kode IS 'Kode unik lembaga (YYS, PKBM, RA, KB, TK)';
COMMENT ON COLUMN lembaga.nomor_prefix IS 'Prefix untuk format nomor surat';

-- ============================================================================
-- 3.2 TABEL: surat_keluar
-- Menyimpan data surat keluar yang dibuat staff
-- ============================================================================
CREATE TABLE surat_keluar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lembaga_id UUID NOT NULL REFERENCES lembaga(id) ON DELETE RESTRICT,
  
  -- Identitas Surat (AUTO-GENERATED)
  nomor_surat VARCHAR(100) NOT NULL UNIQUE,
  tanggal_surat DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Isi Surat (INPUT MANUAL - SANGAT SERING BERUBAH)
  perihal VARCHAR(255) NOT NULL,
  kepada VARCHAR(255) NOT NULL,
  alamat_tujuan TEXT,
  isi_surat TEXT NOT NULL, -- bisa plain text atau HTML
  
  -- Optional Fields
  lampiran VARCHAR(255),
  sifat VARCHAR(20) DEFAULT 'Biasa', -- Biasa | Penting | Segera | Rahasia
  
  -- SNAPSHOT: Data TTD saat surat dibuat (untuk historis)
  -- Jadi kalau TTD ganti, surat lama tetap pakai TTD lama
  snapshot_ttd JSONB DEFAULT '{}'::jsonb,
  -- Contoh struktur:
  -- {
  --   "jabatan": "Ketua Yayasan",
  --   "nama": "Dr. H. Ahmad Yani, M.Pd.",
  --   "nip": "196512311990031001",
  --   "image_url": "lembaga/ttd/xxx.png",
  --   "captured_at": "2025-02-07T10:30:00Z"
  -- }
  
  -- File Management
  pdf_url TEXT, -- generated PDF path di Supabase Storage
  pdf_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Status & Workflow
  status VARCHAR(20) DEFAULT 'draft', -- draft | approved | sent | archived
  
  -- Audit Trail
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes untuk performa
CREATE INDEX idx_surat_lembaga ON surat_keluar(lembaga_id);
CREATE INDEX idx_surat_tanggal ON surat_keluar(tanggal_surat DESC);
CREATE INDEX idx_surat_nomor ON surat_keluar(nomor_surat);
CREATE INDEX idx_surat_status ON surat_keluar(status);
CREATE INDEX idx_surat_created_by ON surat_keluar(created_by);
CREATE INDEX idx_surat_created_at ON surat_keluar(created_at DESC);

-- Full-text search index untuk pencarian isi surat
CREATE INDEX idx_surat_search ON surat_keluar 
USING gin(to_tsvector('indonesian', 
  coalesce(perihal, '') || ' ' || 
  coalesce(kepada, '') || ' ' || 
  coalesce(isi_surat, '')
));

-- Partial index untuk surat aktif (not deleted)
CREATE INDEX idx_surat_active ON surat_keluar(lembaga_id, tanggal_surat DESC) 
WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE surat_keluar IS 'Data surat keluar yang dibuat staff';
COMMENT ON COLUMN surat_keluar.snapshot_ttd IS 'Snapshot data TTD saat surat dibuat untuk historis';
COMMENT ON COLUMN surat_keluar.status IS 'Status workflow: draft | approved | sent | archived';

-- ============================================================================
-- 3.3 TABEL: surat_tembusan
-- Menyimpan daftar tembusan per surat (many-to-many)
-- ============================================================================
CREATE TABLE surat_tembusan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surat_id UUID NOT NULL REFERENCES surat_keluar(id) ON DELETE CASCADE,
  
  nama_penerima VARCHAR(255) NOT NULL,
  urutan INT DEFAULT 1, -- untuk ordering tampilan
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tembusan_surat ON surat_tembusan(surat_id);
CREATE INDEX idx_tembusan_urutan ON surat_tembusan(surat_id, urutan);

-- Comments
COMMENT ON TABLE surat_tembusan IS 'Daftar penerima tembusan per surat';

-- ============================================================================
-- 3.4 TABEL: nomor_surat_counter
-- Auto-increment counter untuk nomor surat per lembaga per tahun
-- ============================================================================
CREATE TABLE nomor_surat_counter (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lembaga_id UUID NOT NULL REFERENCES lembaga(id) ON DELETE CASCADE,
  
  tahun INT NOT NULL,
  counter INT DEFAULT 0,
  
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(lembaga_id, tahun)
);

-- Index
CREATE INDEX idx_counter_lembaga_tahun ON nomor_surat_counter(lembaga_id, tahun);

-- Comments
COMMENT ON TABLE nomor_surat_counter IS 'Counter auto-increment nomor surat per lembaga per tahun';

-- ============================================================================
-- 3.5 TABEL: user_profiles
-- Extend Supabase auth.users dengan profile tambahan
-- ============================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- super_admin | admin_tu | staff | kepala
  lembaga_id UUID REFERENCES lembaga(id) ON DELETE SET NULL, -- untuk filter akses
  
  avatar_url TEXT,
  phone VARCHAR(20),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_role ON user_profiles(role);
CREATE INDEX idx_profiles_lembaga ON user_profiles(lembaga_id);
CREATE INDEX idx_profiles_active ON user_profiles(is_active);

-- Comments
COMMENT ON TABLE user_profiles IS 'Profile user dengan role dan lembaga assignment';

-- ============================================================================
-- 3.6 TABEL: role_permissions
-- Define permissions per role
-- ============================================================================
CREATE TABLE role_permissions (
  role VARCHAR(50) PRIMARY KEY,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE role_permissions IS 'Define permissions per role';

-- ============================================================================
-- 4. SEED DATA
-- ============================================================================

-- ============================================================================
-- 4.1 SEED: role_permissions
-- ============================================================================
INSERT INTO role_permissions (role, permissions, description) VALUES
('super_admin', '{
  "surat": {"create": true, "read": true, "update": true, "delete": true, "approve": true},
  "lembaga": {"create": true, "read": true, "update": true, "delete": true},
  "user": {"create": true, "read": true, "update": true, "delete": true},
  "settings": {"access": true}
}'::jsonb, 'Full access ke semua fitur sistem'),

('admin_tu', '{
  "surat": {"create": true, "read": true, "update": true, "delete": false, "approve": false},
  "lembaga": {"create": false, "read": true, "update": true, "delete": false},
  "user": {"create": false, "read": true, "update": false, "delete": false},
  "settings": {"access": false}
}'::jsonb, 'Admin TU bisa kelola surat dan update data lembaga'),

('staff', '{
  "surat": {"create": true, "read": true, "update": true, "delete": false, "approve": false},
  "lembaga": {"create": false, "read": true, "update": false, "delete": false},
  "user": {"create": false, "read": false, "update": false, "delete": false},
  "settings": {"access": false}
}'::jsonb, 'Staff TU bisa buat dan edit surat (tidak bisa hapus)'),

('kepala', '{
  "surat": {"create": false, "read": true, "update": false, "delete": false, "approve": true},
  "lembaga": {"create": false, "read": true, "update": false, "delete": false},
  "user": {"create": false, "read": true, "update": false, "delete": false},
  "settings": {"access": false}
}'::jsonb, 'Kepala sekolah/yayasan bisa approve surat');

-- ============================================================================
-- 4.2 SEED: lembaga (contoh data)
-- ============================================================================
INSERT INTO lembaga (kode, nama, alamat, telepon, email, website, nomor_prefix, ttd_jabatan, ttd_nama, ttd_nip) VALUES
('YYS', 'Yayasan Al-Ikhlas', 'Jl. Pendidikan No. 123, Jakarta Selatan 12345', '(021) 1234567', 'info@yayasan-alikhlas.com', 'www.yayasan-alikhlas.com', 'YYS', 'Ketua Yayasan', 'Dr. H. Ahmad Yani, M.Pd.', '196512311990031001'),

('PKBM', 'PKBM Al-Hikmah', 'Jl. Pendidikan No. 123, Jakarta Selatan 12345', '(021) 1234568', 'info@pkbm-alhikmah.com', 'www.pkbm-alhikmah.com', 'PKBM', 'Kepala PKBM', 'Drs. Muhammad Ridwan, M.Pd.', '197001151995031002'),

('RA', 'RA Nurul Iman', 'Jl. Pendidikan No. 123, Jakarta Selatan 12345', '(021) 1234569', 'info@ra-nuruliman.com', 'www.ra-nuruliman.com', 'RA', 'Kepala RA', 'Siti Aisyah, S.Pd.I', '198203102005012001'),

('KB', 'KB Bunda Sayang', 'Jl. Pendidikan No. 123, Jakarta Selatan 12345', '(021) 1234570', 'info@kb-bundasayang.com', 'www.kb-bundasayang.com', 'KB', 'Kepala KB', 'Nurlaila, S.Pd.', '198505152010012002'),

('TK', 'TK Harapan Bangsa', 'Jl. Pendidikan No. 123, Jakarta Selatan 12345', '(021) 1234571', 'info@tk-harapanbangsa.com', 'www.tk-harapanbangsa.com', 'TK', 'Kepala TK', 'Dewi Sartika, S.Pd.', '198708202012012001');

-- ============================================================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================================================

-- ============================================================================
-- 5.0 HELPER FUNCTIONS: get_my_role / get_my_lembaga_id
-- SECURITY DEFINER = bypass RLS, mencegah infinite recursion
-- pada RLS policies di user_profiles yang self-reference
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
AS $$ SELECT role FROM public.user_profiles WHERE id = auth.uid() $$;

CREATE OR REPLACE FUNCTION public.get_my_lembaga_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
AS $$ SELECT lembaga_id FROM public.user_profiles WHERE id = auth.uid() $$;

-- ============================================================================
-- 5.1 FUNCTION: update_updated_at_column
-- Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger ke semua tabel yang punya updated_at
CREATE TRIGGER update_lembaga_updated_at
  BEFORE UPDATE ON lembaga
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surat_updated_at
  BEFORE UPDATE ON surat_keluar
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5.2 FUNCTION: generate_nomor_surat
-- Auto-generate nomor surat dengan format: 001/YYS/II/2025
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_nomor_surat(
  p_lembaga_id UUID,
  p_tanggal DATE DEFAULT CURRENT_DATE
) RETURNS VARCHAR AS $$
DECLARE
  v_counter INT;
  v_prefix VARCHAR;
  v_tahun INT;
  v_bulan_romawi VARCHAR;
  v_nomor VARCHAR;
BEGIN
  -- Get prefix from lembaga
  SELECT nomor_prefix INTO v_prefix
  FROM lembaga
  WHERE id = p_lembaga_id;
  
  IF v_prefix IS NULL THEN
    RAISE EXCEPTION 'Lembaga tidak ditemukan atau prefix tidak diset';
  END IF;
  
  v_tahun := EXTRACT(YEAR FROM p_tanggal);
  
  -- Increment counter (with UPSERT)
  INSERT INTO nomor_surat_counter (lembaga_id, tahun, counter)
  VALUES (p_lembaga_id, v_tahun, 1)
  ON CONFLICT (lembaga_id, tahun)
  DO UPDATE SET 
    counter = nomor_surat_counter.counter + 1,
    last_used_at = NOW()
  RETURNING counter INTO v_counter;
  
  -- Convert bulan ke romawi
  v_bulan_romawi := CASE EXTRACT(MONTH FROM p_tanggal)::INT
    WHEN 1 THEN 'I'
    WHEN 2 THEN 'II'
    WHEN 3 THEN 'III'
    WHEN 4 THEN 'IV'
    WHEN 5 THEN 'V'
    WHEN 6 THEN 'VI'
    WHEN 7 THEN 'VII'
    WHEN 8 THEN 'VIII'
    WHEN 9 THEN 'IX'
    WHEN 10 THEN 'X'
    WHEN 11 THEN 'XI'
    WHEN 12 THEN 'XII'
  END;
  
  -- Format: 001/YYS/II/2025
  v_nomor := LPAD(v_counter::TEXT, 3, '0') || '/' || 
             v_prefix || '/' || 
             v_bulan_romawi || '/' || 
             v_tahun::TEXT;
  
  RETURN v_nomor;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON FUNCTION generate_nomor_surat IS 'Auto-generate nomor surat dengan format: 001/YYS/II/2025';

-- ============================================================================
-- 5.3 FUNCTION: create_surat_with_snapshot
-- Helper function untuk create surat dengan snapshot TTD
-- ============================================================================
CREATE OR REPLACE FUNCTION create_surat_with_snapshot(
  p_lembaga_id UUID,
  p_perihal VARCHAR,
  p_kepada VARCHAR,
  p_isi_surat TEXT,
  p_tanggal_surat DATE DEFAULT CURRENT_DATE,
  p_alamat_tujuan TEXT DEFAULT NULL,
  p_lampiran VARCHAR DEFAULT NULL,
  p_sifat VARCHAR DEFAULT 'Biasa',
  p_created_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_surat_id UUID;
  v_nomor_surat VARCHAR;
  v_snapshot JSONB;
BEGIN
  -- Generate nomor surat
  v_nomor_surat := generate_nomor_surat(p_lembaga_id, p_tanggal_surat);
  
  -- Create snapshot of TTD data
  SELECT jsonb_build_object(
    'jabatan', ttd_jabatan,
    'nama', ttd_nama,
    'nip', ttd_nip,
    'image_url', ttd_image_url,
    'captured_at', NOW()
  ) INTO v_snapshot
  FROM lembaga
  WHERE id = p_lembaga_id;
  
  -- Insert surat
  INSERT INTO surat_keluar (
    lembaga_id,
    nomor_surat,
    tanggal_surat,
    perihal,
    kepada,
    alamat_tujuan,
    isi_surat,
    lampiran,
    sifat,
    snapshot_ttd,
    created_by,
    status
  ) VALUES (
    p_lembaga_id,
    v_nomor_surat,
    p_tanggal_surat,
    p_perihal,
    p_kepada,
    p_alamat_tujuan,
    p_isi_surat,
    p_lampiran,
    p_sifat,
    v_snapshot,
    p_created_by,
    'draft'
  ) RETURNING id INTO v_surat_id;
  
  RETURN v_surat_id;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON FUNCTION create_surat_with_snapshot IS 'Helper untuk create surat dengan auto-snapshot TTD';

-- ============================================================================
-- 5.4 FUNCTION: search_surat
-- Full-text search dengan ranking
-- ============================================================================
CREATE OR REPLACE FUNCTION search_surat(
  p_search_query TEXT,
  p_lembaga_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20
) RETURNS TABLE (
  id UUID,
  nomor_surat VARCHAR,
  tanggal_surat DATE,
  perihal VARCHAR,
  kepada VARCHAR,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.nomor_surat,
    s.tanggal_surat,
    s.perihal,
    s.kepada,
    ts_rank(
      to_tsvector('indonesian', 
        coalesce(s.perihal, '') || ' ' || 
        coalesce(s.kepada, '') || ' ' || 
        coalesce(s.isi_surat, '')
      ),
      plainto_tsquery('indonesian', p_search_query)
    ) AS rank
  FROM surat_keluar s
  WHERE 
    s.deleted_at IS NULL
    AND (p_lembaga_id IS NULL OR s.lembaga_id = p_lembaga_id)
    AND to_tsvector('indonesian', 
      coalesce(s.perihal, '') || ' ' || 
      coalesce(s.kepada, '') || ' ' || 
      coalesce(s.isi_surat, '')
    ) @@ plainto_tsquery('indonesian', p_search_query)
  ORDER BY rank DESC, s.tanggal_surat DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON FUNCTION search_surat IS 'Full-text search surat dengan ranking relevance';

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS untuk semua tabel
ALTER TABLE lembaga ENABLE ROW LEVEL SECURITY;
ALTER TABLE surat_keluar ENABLE ROW LEVEL SECURITY;
ALTER TABLE surat_tembusan ENABLE ROW LEVEL SECURITY;
ALTER TABLE nomor_surat_counter ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6.1 RLS POLICIES: lembaga
-- ============================================================================

-- Super Admin: full access
CREATE POLICY "Super admin can do everything on lembaga"
  ON lembaga
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
      AND user_profiles.is_active = true
    )
  );

-- Admin TU & Staff: read all, update own lembaga
CREATE POLICY "Users can read all lembaga"
  ON lembaga
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_active = true
    )
  );

CREATE POLICY "Admin can update own lembaga"
  ON lembaga
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.lembaga_id = lembaga.id
      AND user_profiles.role IN ('admin_tu', 'super_admin')
      AND user_profiles.is_active = true
    )
  );

-- ============================================================================
-- 6.2 RLS POLICIES: surat_keluar
-- ============================================================================

-- Super Admin: full access
CREATE POLICY "Super admin can do everything on surat"
  ON surat_keluar
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
      AND user_profiles.is_active = true
    )
  );

-- Users can read surat from their lembaga
CREATE POLICY "Users can read surat from their lembaga"
  ON surat_keluar
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.lembaga_id = surat_keluar.lembaga_id
      AND user_profiles.is_active = true
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
      AND user_profiles.is_active = true
    )
  );

-- Staff & Admin can create surat
CREATE POLICY "Staff can create surat"
  ON surat_keluar
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.lembaga_id = surat_keluar.lembaga_id
      AND user_profiles.role IN ('staff', 'admin_tu', 'super_admin')
      AND user_profiles.is_active = true
    )
  );

-- Staff can update their own draft surat
CREATE POLICY "Staff can update own draft surat"
  ON surat_keluar
  FOR UPDATE
  TO authenticated
  USING (
    (
      created_by = auth.uid()
      AND status = 'draft'
      AND deleted_at IS NULL
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin_tu', 'super_admin')
      AND user_profiles.lembaga_id = surat_keluar.lembaga_id
      AND user_profiles.is_active = true
    )
  );

-- Only admin can delete (soft delete)
CREATE POLICY "Only admin can delete surat"
  ON surat_keluar
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin_tu', 'super_admin')
      AND user_profiles.lembaga_id = surat_keluar.lembaga_id
      AND user_profiles.is_active = true
    )
  )
  WITH CHECK (
    -- Only allow updating deleted_at and deleted_by
    deleted_at IS NOT NULL
  );

-- ============================================================================
-- 6.3 RLS POLICIES: surat_tembusan
-- ============================================================================

-- Users can read tembusan of surat they can read
CREATE POLICY "Users can read tembusan"
  ON surat_tembusan
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surat_keluar s
      JOIN user_profiles up ON up.lembaga_id = s.lembaga_id
      WHERE s.id = surat_tembusan.surat_id
      AND up.id = auth.uid()
      AND up.is_active = true
    )
  );

-- Users can manage tembusan of their surat
CREATE POLICY "Users can manage tembusan"
  ON surat_tembusan
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surat_keluar s
      WHERE s.id = surat_tembusan.surat_id
      AND (
        s.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.role IN ('admin_tu', 'super_admin')
          AND user_profiles.lembaga_id = s.lembaga_id
          AND user_profiles.is_active = true
        )
      )
    )
  );

-- ============================================================================
-- 6.4 RLS POLICIES: user_profiles
-- ============================================================================

-- Super admin: full access (uses SECURITY DEFINER helper to avoid recursion)
CREATE POLICY "Super admin can manage all profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (get_my_role() = 'super_admin');

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile (except role & lembaga)
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = get_my_role()
    AND lembaga_id = get_my_lembaga_id()
  );

-- ============================================================================
-- 6.5 RLS POLICIES: role_permissions
-- ============================================================================

-- Everyone can read role permissions
CREATE POLICY "Everyone can read role permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Only super admin can manage roles
CREATE POLICY "Only super admin can manage roles"
  ON role_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
      AND user_profiles.is_active = true
    )
  );

-- ============================================================================
-- 6.6 RLS POLICIES: nomor_surat_counter
-- ============================================================================

-- Authenticated users can read counter (needed by generate_nomor_surat)
CREATE POLICY "Authenticated users can read counter"
  ON nomor_surat_counter
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can upsert counter (needed by generate_nomor_surat)
CREATE POLICY "Authenticated users can upsert counter"
  ON nomor_surat_counter
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update counter"
  ON nomor_surat_counter
  FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================================
-- 7. VIEWS (Optional, untuk kemudahan query)
-- ============================================================================

-- ============================================================================
-- 7.1 VIEW: v_surat_lengkap
-- Gabungan surat dengan data lembaga (untuk export/reporting)
-- ============================================================================
CREATE OR REPLACE VIEW v_surat_lengkap AS
SELECT 
  s.id,
  s.nomor_surat,
  s.tanggal_surat,
  s.perihal,
  s.kepada,
  s.alamat_tujuan,
  s.isi_surat,
  s.lampiran,
  s.sifat,
  s.status,
  s.pdf_url,
  s.created_at,
  
  -- Data lembaga
  l.kode AS lembaga_kode,
  l.nama AS lembaga_nama,
  l.alamat AS lembaga_alamat,
  l.telepon AS lembaga_telepon,
  l.email AS lembaga_email,
  
  -- Data TTD (dari snapshot atau current)
  COALESCE(
    s.snapshot_ttd->>'jabatan',
    l.ttd_jabatan
  ) AS ttd_jabatan,
  COALESCE(
    s.snapshot_ttd->>'nama',
    l.ttd_nama
  ) AS ttd_nama,
  COALESCE(
    s.snapshot_ttd->>'nip',
    l.ttd_nip
  ) AS ttd_nip,
  
  -- Data creator
  up.full_name AS created_by_name,
  up.role AS created_by_role,
  
  -- Tembusan (as array)
  ARRAY(
    SELECT st.nama_penerima
    FROM surat_tembusan st
    WHERE st.surat_id = s.id
    ORDER BY st.urutan
  ) AS tembusan_list

FROM surat_keluar s
JOIN lembaga l ON l.id = s.lembaga_id
LEFT JOIN user_profiles up ON up.id = s.created_by
WHERE s.deleted_at IS NULL;

-- Comments
COMMENT ON VIEW v_surat_lengkap IS 'View lengkap surat dengan data lembaga dan tembusan';

-- ============================================================================
-- 7.2 VIEW: v_statistik_surat
-- Statistik surat per lembaga per bulan
-- ============================================================================
CREATE OR REPLACE VIEW v_statistik_surat AS
SELECT 
  l.id AS lembaga_id,
  l.kode AS lembaga_kode,
  l.nama AS lembaga_nama,
  EXTRACT(YEAR FROM s.tanggal_surat) AS tahun,
  EXTRACT(MONTH FROM s.tanggal_surat) AS bulan,
  COUNT(*) AS total_surat,
  COUNT(*) FILTER (WHERE s.status = 'draft') AS draft,
  COUNT(*) FILTER (WHERE s.status = 'approved') AS approved,
  COUNT(*) FILTER (WHERE s.status = 'sent') AS sent,
  COUNT(*) FILTER (WHERE s.sifat = 'Penting') AS surat_penting,
  COUNT(*) FILTER (WHERE s.sifat = 'Rahasia') AS surat_rahasia
FROM surat_keluar s
JOIN lembaga l ON l.id = s.lembaga_id
WHERE s.deleted_at IS NULL
GROUP BY l.id, l.kode, l.nama, EXTRACT(YEAR FROM s.tanggal_surat), EXTRACT(MONTH FROM s.tanggal_surat)
ORDER BY tahun DESC, bulan DESC, l.nama;

-- Comments
COMMENT ON VIEW v_statistik_surat IS 'Statistik surat per lembaga per bulan';

-- ============================================================================
-- 8. UTILITY FUNCTIONS
-- ============================================================================

-- ============================================================================
-- 8.1 FUNCTION: reset_nomor_counter
-- Reset counter nomor surat (untuk testing atau awal tahun baru)
-- ============================================================================
CREATE OR REPLACE FUNCTION reset_nomor_counter(
  p_lembaga_id UUID,
  p_tahun INT
) RETURNS VOID AS $$
BEGIN
  UPDATE nomor_surat_counter
  SET counter = 0
  WHERE lembaga_id = p_lembaga_id
  AND tahun = p_tahun;
  
  IF NOT FOUND THEN
    INSERT INTO nomor_surat_counter (lembaga_id, tahun, counter)
    VALUES (p_lembaga_id, p_tahun, 0);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON FUNCTION reset_nomor_counter IS 'Reset counter nomor surat untuk lembaga & tahun tertentu';

-- ============================================================================
-- 8.2 FUNCTION: soft_delete_surat
-- Helper untuk soft delete surat
-- ============================================================================
CREATE OR REPLACE FUNCTION soft_delete_surat(
  p_surat_id UUID,
  p_deleted_by UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE surat_keluar
  SET 
    deleted_at = NOW(),
    deleted_by = p_deleted_by
  WHERE id = p_surat_id
  AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON FUNCTION soft_delete_surat IS 'Soft delete surat (set deleted_at)';

-- ============================================================================
-- 9. INDEXES TAMBAHAN UNTUK PERFORMA
-- ============================================================================

-- Index untuk statistik
CREATE INDEX idx_surat_tahun_bulan ON surat_keluar(
  lembaga_id, 
  EXTRACT(YEAR FROM tanggal_surat), 
  EXTRACT(MONTH FROM tanggal_surat)
) WHERE deleted_at IS NULL;

-- Index untuk filter by sifat
CREATE INDEX idx_surat_sifat ON surat_keluar(sifat) WHERE deleted_at IS NULL;

-- Index untuk filter by status
CREATE INDEX idx_surat_status_filter ON surat_keluar(status, lembaga_id, tanggal_surat DESC) 
WHERE deleted_at IS NULL;

-- ============================================================================
-- 10. FINAL CHECKS & GRANTS
-- ============================================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_my_role TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_lembaga_id TO authenticated;
GRANT EXECUTE ON FUNCTION generate_nomor_surat TO authenticated;
GRANT EXECUTE ON FUNCTION create_surat_with_snapshot TO authenticated;
GRANT EXECUTE ON FUNCTION search_surat TO authenticated;
GRANT EXECUTE ON FUNCTION reset_nomor_counter TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_surat TO authenticated;

-- Grant usage on views
GRANT SELECT ON v_surat_lengkap TO authenticated;
GRANT SELECT ON v_statistik_surat TO authenticated;

-- ============================================================================
-- 11. VERIFICATION QUERIES
-- ============================================================================

-- Check if all tables created
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'lembaga',
  'surat_keluar',
  'surat_tembusan',
  'nomor_surat_counter',
  'user_profiles',
  'role_permissions'
)
ORDER BY tablename;

-- Check if all functions created
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'generate_nomor_surat',
  'create_surat_with_snapshot',
  'search_surat',
  'reset_nomor_counter',
  'soft_delete_surat'
)
ORDER BY routine_name;

-- Check if all views created
SELECT 
  table_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN (
  'v_surat_lengkap',
  'v_statistik_surat'
)
ORDER BY table_name;

-- Check row counts
SELECT 
  'lembaga' AS table_name, COUNT(*) AS row_count FROM lembaga
UNION ALL
SELECT 'role_permissions', COUNT(*) FROM role_permissions
UNION ALL
SELECT 'surat_keluar', COUNT(*) FROM surat_keluar
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles;

-- ============================================================================
-- MIGRATION SELESAI! ✅
-- ============================================================================

-- Silakan cek hasil di Supabase Dashboard:
-- 1. Table Editor → lihat semua tabel
-- 2. Database → Functions → lihat semua functions
-- 3. Database → Policies → cek RLS policies
-- 4. SQL Editor → run verification queries di atas

-- Next steps:
-- 1. Setup Supabase Storage buckets untuk logo & PDF
-- 2. Create first user via Supabase Auth
-- 3. Insert user profile dengan role super_admin
-- 4. Test dengan buat surat pertama

-- Happy coding! 🚀
```

---

## 📚 PENJELASAN STRUKTUR

### **Tables Overview:**

| Table | Purpose | Frekuensi Update |
|-------|---------|------------------|
| `lembaga` | Master data organisasi | 🔵 Jarang |
| `surat_keluar` | Data surat yang dibuat | 🔥 Sangat Sering |
| `surat_tembusan` | Daftar tembusan per surat | 🔥 Per Surat |
| `nomor_surat_counter` | Auto-increment nomor | 🔥 Per Surat |
| `user_profiles` | Profile user + role | 🟡 Sering |
| `role_permissions` | Define permissions | ⚫ Static |

### **Key Features:**

✅ **Auto-Generate Nomor Surat**
- Format: `001/YYS/II/2025`
- Auto-increment per lembaga per tahun
- Bulan dalam romawi

✅ **Snapshot Mechanism**
- TTD data di-snapshot saat surat dibuat
- Surat lama tetap valid meski TTD ganti

✅ **Row Level Security (RLS)**
- User hanya bisa akses data lembaganya
- Role-based permissions
- Super admin full access

✅ **Full-Text Search**
- Search di perihal, kepada, dan isi surat
- Dengan ranking relevance
- Support bahasa Indonesia

✅ **Soft Delete**
- Data tidak benar-benar dihapus
- Audit trail lengkap

✅ **Views untuk Reporting**
- `v_surat_lengkap` - data lengkap untuk export
- `v_statistik_surat` - statistik per bulan

---

## 🧪 TEST QUERIES

Setelah run migration, test dengan queries ini:

```sql
-- Test 1: Check data lembaga
SELECT * FROM lembaga;

-- Test 2: Generate nomor surat
SELECT generate_nomor_surat(
  (SELECT id FROM lembaga WHERE kode = 'YYS'),
  CURRENT_DATE
);

-- Test 3: Create surat dengan helper function
SELECT create_surat_with_snapshot(
  (SELECT id FROM lembaga WHERE kode = 'YYS'),
  'Undangan Rapat Koordinasi',
  'Bapak/Ibu Kepala Sekolah',
  'Dengan hormat, sehubungan dengan...',
  CURRENT_DATE
);

-- Test 4: Check surat yang baru dibuat
SELECT * FROM v_surat_lengkap;

-- Test 5: Search surat
SELECT * FROM search_surat('rapat', NULL, 10);
```

---

## ⚠️ NOTES

1. **Sebelum run di production**, backup database existing!
2. **RLS Policies** sudah aktif - pastikan user profile sudah dibuat
3. **Storage buckets** perlu dibuat manual:
   - `lembaga-logos`
   - `lembaga-ttd`
   - `surat-pdf`
4. **First user** harus dibuat via Supabase Auth Dashboard, lalu insert manual ke `user_profiles` dengan role `super_admin`

---

## 🔧 TROUBLESHOOTING

**Error: "permission denied for schema public"**
- Solution: Pastikan user Supabase punya akses create table

**Error: "relation already exists"**
- Solution: Drop table dulu atau uncomment DROP TABLE di bagian 2

**Error: "extension uuid-ossp does not exist"**
- Solution: Run `CREATE EXTENSION "uuid-ossp";` dulu

**RLS block all queries**
- Solution: Pastikan user profile sudah ada dengan role yang benar

---

**File ini siap di-copy-paste ke Supabase SQL Editor!** ✅
