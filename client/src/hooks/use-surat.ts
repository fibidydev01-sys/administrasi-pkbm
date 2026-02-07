"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SuratWithRelations } from "@/types";
import { useAuth } from "./use-auth";

export function useSurat(suratId?: string) {
  const [surat, setSurat] = useState<SuratWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { user } = useAuth();

  const loadSurat = useCallback(async () => {
    if (!suratId) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("surat_keluar")
        .select(
          `
          *,
          lembaga(*),
          tembusan:surat_tembusan(*),
          created_by_profile:user_profiles!created_by(full_name, role)
        `
        )
        .eq("id", suratId)
        .is("deleted_at", null)
        .single();

      if (fetchError) throw fetchError;
      setSurat(data as unknown as SuratWithRelations);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memuat surat";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [suratId, supabase]);

  useEffect(() => {
    if (suratId) {
      loadSurat();
    } else {
      setLoading(false);
    }
  }, [suratId, loadSurat]);

  async function createSurat(data: Record<string, unknown>) {
    const response = await fetch("/api/surat/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Gagal membuat surat");
    }

    return await response.json();
  }

  async function updateSurat(id: string, data: Record<string, unknown>) {
    const { error: updateError } = await supabase
      .from("surat_keluar")
      .update(data)
      .eq("id", id);

    if (updateError) throw new Error(updateError.message);
    await loadSurat();
  }

  async function deleteSurat(id: string) {
    const { error: deleteError } = await supabase
      .from("surat_keluar")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id,
      })
      .eq("id", id);

    if (deleteError) throw new Error(deleteError.message);
  }

  return {
    surat,
    loading,
    error,
    createSurat,
    updateSurat,
    deleteSurat,
    refresh: loadSurat,
  };
}

export function useSuratList(lembagaId?: string) {
  const [surats, setSurats] = useState<SuratWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadSurats = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("surat_keluar")
        .select(
          `
          *,
          lembaga(*),
          tembusan:surat_tembusan(*)
        `
        )
        .is("deleted_at", null)
        .order("tanggal_surat", { ascending: false })
        .limit(50);

      if (lembagaId) {
        query = query.eq("lembaga_id", lembagaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSurats((data as unknown as SuratWithRelations[]) ?? []);
    } catch (err) {
      console.error("Error loading surats:", err);
    } finally {
      setLoading(false);
    }
  }, [lembagaId, supabase]);

  useEffect(() => {
    loadSurats();
  }, [loadSurats]);

  return {
    surats,
    loading,
    refresh: loadSurats,
  };
}
