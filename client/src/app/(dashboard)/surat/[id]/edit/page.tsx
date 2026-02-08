"use client";

import { use } from "react";

import { useSurat } from "@/hooks";
import { PageHeader, FullPageLoader } from "@/components/shared";
import SuratForm from "@/components/features/surat/forms/surat-form";

export default function EditSuratPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { surat, loading } = useSurat(id);

  if (loading) return <FullPageLoader />;

  if (!surat) {
    return (
      <div className="space-y-6">
        <PageHeader title="Surat tidak ditemukan" />
        <p className="text-muted-foreground">Surat tidak ada atau sudah dihapus.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Surat"
        description={surat.nomor_surat || "Draft"}
      />
      <SuratForm
        mode="edit"
        suratId={id}
        defaultValues={{
          lembaga_id: surat.lembaga_id,
          perihal: surat.perihal,
          kepada: surat.kepada,
          alamat_tujuan: surat.alamat_tujuan ?? "",
          isi_surat: surat.isi_surat,
          lampiran: surat.lampiran ?? "",
          sifat: surat.sifat as "Biasa" | "Penting" | "Segera" | "Rahasia",
          tembusan: surat.tembusan?.map((t) => t.nama_penerima) ?? [],
          template_id: surat.template_id ?? "surat-umum",
          template_data: (surat.template_data as Record<string, string>) ?? {},
        }}
      />
    </div>
  );
}
