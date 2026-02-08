import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
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
      template_id,
      template_data,
    } = body;

    // Validate required fields
    if (!lembaga_id || !perihal) {
      return NextResponse.json(
        { error: "Field lembaga dan perihal wajib diisi" },
        { status: 400 }
      );
    }

    // Create surat with snapshot via RPC
    const { data: suratId, error: createError } = await supabase.rpc(
      "create_surat_with_snapshot",
      {
        p_lembaga_id: lembaga_id,
        p_perihal: perihal,
        p_kepada: kepada || "-",
        p_isi_surat: isi_surat || "",
        p_tanggal_surat:
          tanggal_surat || new Date().toISOString().split("T")[0],
        p_alamat_tujuan: alamat_tujuan || null,
        p_lampiran: lampiran || null,
        p_sifat: sifat || "Biasa",
        p_created_by: user.id,
      }
    );

    if (createError) {
      console.error("Error creating surat:", createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    // Update template_id and template_data if provided
    if (template_id && template_id !== "surat-umum") {
      const { error: templateError } = await supabase
        .from("surat_keluar")
        .update({
          template_id: template_id,
          template_data: template_data || {},
        })
        .eq("id", suratId);

      if (templateError) {
        console.error("Error saving template data:", templateError);
      }
    }

    // Insert tembusan (if any)
    if (tembusan && tembusan.length > 0) {
      const tembusanData = tembusan.map(
        (nama: string, index: number) => ({
          surat_id: suratId,
          nama_penerima: nama,
          urutan: index + 1,
        })
      );

      const { error: tembusanError } = await supabase
        .from("surat_tembusan")
        .insert(tembusanData);

      if (tembusanError) {
        console.error("Error creating tembusan:", tembusanError);
      }
    }

    // Get full surat data with relations
    const { data: surat, error: fetchError } = await supabase
      .from("surat_keluar")
      .select(
        `
        *,
        lembaga(*),
        tembusan:surat_tembusan(*)
      `
      )
      .eq("id", suratId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: surat,
    });
  } catch (error: unknown) {
    console.error("Error in create surat API:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
