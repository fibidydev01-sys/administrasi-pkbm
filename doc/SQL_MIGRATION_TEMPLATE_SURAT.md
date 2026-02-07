# SQL Migration - Template Surat

**Version:** 1.0.0
**Depends on:** SQL_SCHEMA_SISTEM_PERSURATAN.md (existing tables)

---

## INSTRUKSI

1. Buka **Supabase Dashboard** → SQL Editor
2. Copy-paste semua SQL di bawah
3. Klik **RUN**
4. Refresh table list → cek tabel baru

---

## SQL SCRIPT

```sql
-- ============================================================================
-- MIGRATION: TEMPLATE SURAT SYSTEM
-- Adds surat_templates + surat_template_fields tables
-- Alters surat_keluar with template_id + template_data
-- ============================================================================

-- ============================================================================
-- 1. CREATE TABLE: surat_templates
-- Master template surat (e.g. Surat Keterangan, Surat Undangan, dll)
-- ============================================================================

CREATE TABLE surat_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  nama VARCHAR(200) NOT NULL,              -- "Surat Keterangan Aktif Belajar"
  kategori VARCHAR(100) NOT NULL,          -- "Keterangan", "Undangan", "Tugas", "Edaran"
  perihal_default VARCHAR(500),            -- Pre-fill perihal when template selected

  -- Content structure
  -- Array of body parts: text blocks and field group references
  -- Example:
  -- [
  --   { "type": "text", "value": "Yang bertanda tangan di bawah ini:" },
  --   { "type": "field_group", "section": "pejabat" },
  --   { "type": "text", "value": "Dengan ini menerangkan bahwa:" },
  --   { "type": "field_group", "section": "yang_bersangkutan" },
  --   { "type": "text", "value": "Demikian surat keterangan ini dibuat..." }
  -- ]
  body_parts JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Scope
  lembaga_id UUID REFERENCES lembaga(id) ON DELETE SET NULL, -- NULL = global template
  is_active BOOLEAN DEFAULT true,

  -- Audit
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_kategori ON surat_templates(kategori);
CREATE INDEX idx_templates_lembaga ON surat_templates(lembaga_id);
CREATE INDEX idx_templates_active ON surat_templates(is_active) WHERE is_active = true;

-- Trigger auto-update updated_at
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON surat_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE surat_templates IS 'Master template surat dengan body_parts JSONB';
COMMENT ON COLUMN surat_templates.body_parts IS 'Array JSON: text blocks + field_group references';

-- ============================================================================
-- 2. CREATE TABLE: surat_template_fields
-- Dynamic fields per template, organized by section
-- ============================================================================

CREATE TABLE surat_template_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES surat_templates(id) ON DELETE CASCADE,

  -- Field definition
  nama_field VARCHAR(100) NOT NULL,       -- "nama_siswa", "tempat_lahir"
  label VARCHAR(200) NOT NULL,            -- "Nama Lengkap", "Tempat Lahir"
  tipe VARCHAR(50) NOT NULL DEFAULT 'text', -- text | textarea | date | number | select
  urutan INT NOT NULL DEFAULT 0,
  required BOOLEAN DEFAULT false,

  -- UI hints
  placeholder VARCHAR(300),               -- "Masukkan nama lengkap"
  default_value VARCHAR(500),             -- Pre-fill value
  options JSONB,                          -- For select type: ["Laki-laki", "Perempuan"]

  -- Grouping
  section VARCHAR(100) NOT NULL,          -- "pejabat", "yang_bersangkutan", "detail"

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tpl_fields_template ON surat_template_fields(template_id);
CREATE INDEX idx_tpl_fields_section ON surat_template_fields(template_id, section);
CREATE INDEX idx_tpl_fields_urutan ON surat_template_fields(template_id, section, urutan);

-- Unique: no duplicate field names per template
CREATE UNIQUE INDEX idx_tpl_fields_unique ON surat_template_fields(template_id, nama_field);

-- Comments
COMMENT ON TABLE surat_template_fields IS 'Dynamic fields per template, grouped by section';
COMMENT ON COLUMN surat_template_fields.section IS 'Field group name, referenced by body_parts field_group';

-- ============================================================================
-- 3. ALTER TABLE: surat_keluar
-- Add template reference and filled data
-- ============================================================================

ALTER TABLE surat_keluar
  ADD COLUMN template_id UUID REFERENCES surat_templates(id) ON DELETE SET NULL,
  ADD COLUMN template_data JSONB DEFAULT NULL;
  -- template_data stores filled field values:
  -- {
  --   "nama_siswa": "Ahmad Fauzi",
  --   "tempat_lahir": "Jakarta",
  --   "tanggal_lahir": "2010-05-15",
  --   "kelas": "Paket B"
  -- }

-- Index
CREATE INDEX idx_surat_template ON surat_keluar(template_id) WHERE template_id IS NOT NULL;

-- Comments
COMMENT ON COLUMN surat_keluar.template_id IS 'FK to surat_templates, NULL for non-template surat';
COMMENT ON COLUMN surat_keluar.template_data IS 'JSONB filled field values from template';

-- ============================================================================
-- 4. RLS POLICIES for surat_templates
-- ============================================================================

ALTER TABLE surat_templates ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read active templates
CREATE POLICY "Users can read active templates"
  ON surat_templates
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND (
      lembaga_id IS NULL  -- global templates
      OR lembaga_id = get_my_lembaga_id()
      OR get_my_role() = 'super_admin'
    )
  );

-- Super admin + admin_tu can manage templates
CREATE POLICY "Admin can manage templates"
  ON surat_templates
  FOR ALL
  TO authenticated
  USING (
    get_my_role() IN ('super_admin', 'admin_tu')
  );

-- ============================================================================
-- 5. RLS POLICIES for surat_template_fields
-- ============================================================================

ALTER TABLE surat_template_fields ENABLE ROW LEVEL SECURITY;

-- Read: same as template read access
CREATE POLICY "Users can read template fields"
  ON surat_template_fields
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surat_templates t
      WHERE t.id = surat_template_fields.template_id
      AND t.is_active = true
      AND (
        t.lembaga_id IS NULL
        OR t.lembaga_id = get_my_lembaga_id()
        OR get_my_role() = 'super_admin'
      )
    )
  );

-- Admin can manage fields
CREATE POLICY "Admin can manage template fields"
  ON surat_template_fields
  FOR ALL
  TO authenticated
  USING (
    get_my_role() IN ('super_admin', 'admin_tu')
  );

-- ============================================================================
-- 6. SEED: Example Templates
-- ============================================================================

-- Note: These are example templates. In production, admin creates them via UI.
-- Uncomment to seed:

-- INSERT INTO surat_templates (nama, kategori, perihal_default, body_parts) VALUES
-- ('Surat Keterangan Aktif Belajar', 'Keterangan', 'Keterangan Aktif Belajar', '[
--   {"type": "text", "value": "Yang bertanda tangan di bawah ini:"},
--   {"type": "field_group", "section": "pejabat"},
--   {"type": "text", "value": "Dengan ini menerangkan bahwa:"},
--   {"type": "field_group", "section": "siswa"},
--   {"type": "text", "value": "Adalah benar peserta didik aktif pada lembaga kami. Surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya."}
-- ]'::jsonb);

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

-- Grants already handled by RLS policies above.
-- Functions don't need special grants since we're using direct table access.

-- ============================================================================
-- MIGRATION SELESAI!
-- ============================================================================
```

---

## VERIFICATION

```sql
-- Check new tables
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('surat_templates', 'surat_template_fields');

-- Check surat_keluar new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'surat_keluar'
AND column_name IN ('template_id', 'template_data');

-- Check RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('surat_templates', 'surat_template_fields');
```
