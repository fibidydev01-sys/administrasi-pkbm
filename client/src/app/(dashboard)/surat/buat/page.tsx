"use client";

import { PageHeader } from "@/components/shared";
import SuratForm from "@/components/features/surat/forms/surat-form";

export default function BuatSuratPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buat Surat Baru"
        description="Isi formulir untuk membuat surat keluar baru"
      />
      <SuratForm mode="create" />
    </div>
  );
}
