"use client";

import { use } from "react";
import { useRequireAdmin, useTemplate } from "@/hooks";

import { PageHeader, FullPageLoader } from "@/components/shared";
import TemplateForm from "@/components/features/template/template-form";

export default function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isLoading: authLoading } = useRequireAdmin();
  const { template, loading } = useTemplate(id);

  if (authLoading || loading) return <FullPageLoader />;

  if (!template) {
    return (
      <div className="space-y-6">
        <PageHeader title="Template tidak ditemukan" />
        <p className="text-muted-foreground">
          Template tidak ada atau sudah dihapus.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Template"
        description={template.nama}
      />
      <TemplateForm mode="edit" defaultValues={template} />
    </div>
  );
}
