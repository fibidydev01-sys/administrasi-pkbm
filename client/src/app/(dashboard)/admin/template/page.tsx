"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileStack } from "lucide-react";

import { useTemplateAdmin, useRequireAdmin } from "@/hooks";
import { ROUTES } from "@/constants";

import { PageHeader, EmptyState, FullPageLoader, DeleteConfirmDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminTemplatePage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const router = useRouter();
  const { templates, loading, deleteTemplate } = useTemplateAdmin();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteTemplate(deleteId);
      toast.success("Template berhasil dihapus");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus template";
      toast.error(message);
    } finally {
      setDeleteId(null);
    }
  }

  if (authLoading) return <FullPageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Template Surat"
        description="Kelola template surat untuk berbagai jenis surat"
      >
        <Button onClick={() => router.push(ROUTES.ADMIN_TEMPLATE_BUAT)}>
          <Plus className="h-4 w-4 mr-2" />
          Buat Template
        </Button>
      </PageHeader>

      {loading ? (
        <FullPageLoader />
      ) : templates.length === 0 ? (
        <EmptyState
          title="Belum ada template"
          description="Buat template pertama untuk mempercepat pembuatan surat"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold line-clamp-1">
                  {template.nama}
                </CardTitle>
                <Badge variant="outline">{template.kategori}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-1">
                  {template.perihal_default && (
                    <p className="line-clamp-1">Perihal: {template.perihal_default}</p>
                  )}
                  <p>
                    <FileStack className="h-3.5 w-3.5 inline mr-1" />
                    {template.fields.length} field
                    {template.lembaga ? ` · ${template.lembaga.kode}` : " · Global"}
                  </p>
                  <p>
                    Status:{" "}
                    <Badge variant={template.is_active ? "default" : "secondary"} className="text-xs">
                      {template.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(ROUTES.ADMIN_TEMPLATE_EDIT(template.id))}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(template.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Template"
        description="Template yang dihapus tidak dapat dikembalikan. Surat yang sudah menggunakan template ini tidak akan terpengaruh."
      />
    </div>
  );
}
