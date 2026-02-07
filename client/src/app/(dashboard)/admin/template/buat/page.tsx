"use client";

import { useRequireAdmin } from "@/hooks";

import { PageHeader, FullPageLoader } from "@/components/shared";
import TemplateForm from "@/components/features/template/template-form";

export default function BuatTemplatePage() {
  const { isLoading } = useRequireAdmin();

  if (isLoading) return <FullPageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buat Template Baru"
        description="Buat template surat dengan field dinamis"
      />
      <TemplateForm mode="create" />
    </div>
  );
}
