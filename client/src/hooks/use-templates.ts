"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/types/database";
import type {
  SuratTemplate,
  SuratTemplateField,
  SuratTemplateWithFields,
} from "@/types";

/**
 * Hook to load a single template with its fields
 */
export function useTemplate(templateId?: string) {
  const [template, setTemplate] = useState<SuratTemplateWithFields | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const loadTemplate = useCallback(async () => {
    if (!templateId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("surat_templates")
        .select(
          `
          *,
          fields:surat_template_fields(*),
          lembaga(*)
        `
        )
        .eq("id", templateId)
        .single();

      if (fetchError) throw fetchError;
      setTemplate(data as unknown as SuratTemplateWithFields);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat template";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [templateId, supabase]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  return { template, loading, error, refresh: loadTemplate };
}

/**
 * Hook to list templates, optionally filtered by lembaga
 */
export function useTemplateList(lembagaId?: string) {
  const [templates, setTemplates] = useState<SuratTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("surat_templates")
        .select("*")
        .eq("is_active", true)
        .order("kategori")
        .order("nama");

      if (lembagaId) {
        // Show global templates (lembaga_id IS NULL) + lembaga-specific
        query = query.or(`lembaga_id.is.null,lembaga_id.eq.${lembagaId}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTemplates((data as SuratTemplate[]) ?? []);
    } catch (err) {
      console.error("Error loading templates:", err);
    } finally {
      setLoading(false);
    }
  }, [lembagaId, supabase]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return { templates, loading, refresh: loadTemplates };
}

/**
 * Hook for admin template CRUD operations
 */
export function useTemplateAdmin() {
  const [templates, setTemplates] = useState<SuratTemplateWithFields[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("surat_templates")
        .select(
          `
          *,
          fields:surat_template_fields(*),
          lembaga(*)
        `
        )
        .order("kategori")
        .order("nama");

      if (error) throw error;
      setTemplates(
        (data as unknown as SuratTemplateWithFields[]) ?? []
      );
    } catch (err) {
      console.error("Error loading templates:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  async function createTemplate(
    templateData: {
      nama: string;
      kategori: string;
      perihal_default?: string;
      body_parts: unknown[];
      lembaga_id?: string;
      is_active?: boolean;
    },
    fields: Omit<SuratTemplateField, "id" | "template_id" | "created_at">[]
  ) {
    // Insert template
    const { data: newTemplate, error: templateError } = await supabase
      .from("surat_templates")
      .insert({
        nama: templateData.nama,
        kategori: templateData.kategori,
        perihal_default: templateData.perihal_default || null,
        body_parts: templateData.body_parts as unknown as Json,
        lembaga_id: templateData.lembaga_id || null,
        is_active: templateData.is_active ?? true,
      })
      .select()
      .single();

    if (templateError) throw new Error(templateError.message);

    // Insert fields if any
    if (fields.length > 0) {
      const fieldsWithTemplateId = fields.map((f) => ({
        ...f,
        template_id: newTemplate.id,
      }));

      const { error: fieldsError } = await supabase
        .from("surat_template_fields")
        .insert(fieldsWithTemplateId);

      if (fieldsError) throw new Error(fieldsError.message);
    }

    await loadTemplates();
    return newTemplate;
  }

  async function updateTemplate(
    id: string,
    templateData: {
      nama?: string;
      kategori?: string;
      perihal_default?: string;
      body_parts?: unknown[];
      lembaga_id?: string | null;
      is_active?: boolean;
    },
    fields?: Omit<SuratTemplateField, "id" | "template_id" | "created_at">[]
  ) {
    const { error: templateError } = await supabase
      .from("surat_templates")
      .update({
        nama: templateData.nama,
        kategori: templateData.kategori,
        perihal_default: templateData.perihal_default,
        body_parts: templateData.body_parts as unknown as Json,
        lembaga_id: templateData.lembaga_id,
        is_active: templateData.is_active,
      })
      .eq("id", id);

    if (templateError) throw new Error(templateError.message);

    // Replace fields if provided
    if (fields !== undefined) {
      // Delete existing fields
      const { error: deleteError } = await supabase
        .from("surat_template_fields")
        .delete()
        .eq("template_id", id);

      if (deleteError) throw new Error(deleteError.message);

      // Insert new fields
      if (fields.length > 0) {
        const fieldsWithTemplateId = fields.map((f) => ({
          ...f,
          template_id: id,
        }));

        const { error: fieldsError } = await supabase
          .from("surat_template_fields")
          .insert(fieldsWithTemplateId);

        if (fieldsError) throw new Error(fieldsError.message);
      }
    }

    await loadTemplates();
  }

  async function deleteTemplate(id: string) {
    const { error } = await supabase
      .from("surat_templates")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    await loadTemplates();
  }

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refresh: loadTemplates,
  };
}
