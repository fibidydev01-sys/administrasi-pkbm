"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Lembaga } from "@/types";

export function useLembaga(lembagaId?: string) {
  const [lembaga, setLembaga] = useState<Lembaga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const loadLembaga = useCallback(async () => {
    if (!lembagaId) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("lembaga")
        .select("*")
        .eq("id", lembagaId)
        .single();

      if (fetchError) throw fetchError;
      setLembaga(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memuat lembaga";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [lembagaId, supabase]);

  useEffect(() => {
    if (lembagaId) {
      loadLembaga();
    } else {
      setLoading(false);
    }
  }, [lembagaId, loadLembaga]);

  async function updateLembaga(data: Partial<Lembaga>) {
    const { error: updateError } = await supabase
      .from("lembaga")
      .update(data)
      .eq("id", lembagaId!);

    if (updateError) throw new Error(updateError.message);
    await loadLembaga();
  }

  return {
    lembaga,
    loading,
    error,
    updateLembaga,
    refresh: loadLembaga,
  };
}

export function useLembagaList() {
  const [lembagas, setLembagas] = useState<Lembaga[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadLembagas = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lembaga")
        .select("*")
        .eq("is_active", true)
        .order("nama");

      if (error) throw error;
      setLembagas(data ?? []);
    } catch (err) {
      console.error("Error loading lembagas:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadLembagas();
  }, [loadLembagas]);

  return {
    lembagas,
    loading,
    refresh: loadLembagas,
  };
}
