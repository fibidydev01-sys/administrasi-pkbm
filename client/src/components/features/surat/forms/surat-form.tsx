"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { suratSchema } from "@/lib/validators";
import type { z } from "zod";

type SuratFormValues = z.input<typeof suratSchema>;
import { useSurat, useLembagaList, useTemplateList, useTemplate } from "@/hooks";
import { SURAT_SIFAT_OPTIONS, ROUTES } from "@/constants";
import { getToday } from "@/lib/date";
import type { BodyPart, SuratTemplateField } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import TembusanInput from "./tembusan-input";

interface SuratFormProps {
  mode: "create" | "edit";
  suratId?: string;
  defaultValues?: Partial<SuratFormValues>;
}

export default function SuratForm({ mode, suratId, defaultValues }: SuratFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createSurat, updateSurat } = useSurat(suratId);
  const { lembagas, loading: lembagaLoading } = useLembagaList();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SuratFormValues>({
    resolver: zodResolver(suratSchema),
    defaultValues: {
      lembaga_id: "",
      perihal: "",
      kepada: "",
      alamat_tujuan: "",
      isi_surat: "",
      lampiran: "",
      sifat: "Biasa",
      tanggal_surat: getToday(),
      tembusan: [],
      template_id: "",
      template_data: {},
      ...defaultValues,
    },
  });

  const lembagaId = watch("lembaga_id");
  const templateId = watch("template_id");
  const tembusanValue = watch("tembusan") ?? [];
  const templateDataValue: Record<string, string> = (watch("template_data") ?? {}) as Record<string, string>;

  // Load templates for selected lembaga
  const { templates, loading: templatesLoading } = useTemplateList(lembagaId || undefined);

  // Load selected template with fields
  const { template: selectedTemplate } = useTemplate(templateId || undefined);

  // When template is selected, auto-fill perihal and build isi_surat
  const buildIsiSurat = useCallback(
    (tmpl: typeof selectedTemplate, tplData: Record<string, string>) => {
      if (!tmpl) return "";

      const bodyParts = tmpl.body_parts as unknown as BodyPart[];
      const fields = tmpl.fields as SuratTemplateField[];

      const parts: string[] = [];

      for (const part of bodyParts) {
        if (part.type === "text") {
          parts.push(part.value);
        } else if (part.type === "field_group") {
          // Get fields for this section, sorted by urutan
          const sectionFields = fields
            .filter((f) => f.section === part.section)
            .sort((a, b) => a.urutan - b.urutan);

          if (sectionFields.length > 0) {
            const fieldLines = sectionFields.map((f) => {
              const value = tplData[f.nama_field] || f.default_value || "...";
              return `${f.label} : ${value}`;
            });
            parts.push(fieldLines.join("\n"));
          }
        }
      }

      return parts.join("\n\n");
    },
    []
  );

  // Handle template selection
  useEffect(() => {
    if (selectedTemplate && templateId) {
      // Auto-fill perihal if empty or in create mode
      if (selectedTemplate.perihal_default) {
        const currentPerihal = watch("perihal");
        if (!currentPerihal || mode === "create") {
          setValue("perihal", selectedTemplate.perihal_default);
        }
      }

      // Set default values for template fields
      const defaultData: Record<string, string> = { ...templateDataValue };
      for (const field of selectedTemplate.fields) {
        if (field.default_value && !defaultData[field.nama_field]) {
          defaultData[field.nama_field] = field.default_value;
        }
      }
      setValue("template_data", defaultData);

      // Build isi_surat from template
      const isiSurat = buildIsiSurat(selectedTemplate, defaultData);
      setValue("isi_surat", isiSurat);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate?.id, templateId]);

  // Update isi_surat when template_data changes (for template mode)
  function handleTemplateFieldChange(fieldName: string, value: string) {
    const updated = { ...templateDataValue, [fieldName]: value };
    setValue("template_data", updated);

    // Rebuild isi_surat
    if (selectedTemplate) {
      const isiSurat = buildIsiSurat(selectedTemplate, updated);
      setValue("isi_surat", isiSurat);
    }
  }

  async function onSubmit(data: SuratFormValues) {
    try {
      setIsSubmitting(true);

      if (mode === "create") {
        const result = await createSurat(data);
        toast.success("Surat berhasil dibuat");
        router.push(ROUTES.SURAT_DETAIL(result.data.id));
      } else if (suratId) {
        await updateSurat(suratId, data);
        toast.success("Surat berhasil diperbarui");
        router.push(ROUTES.SURAT_DETAIL(suratId));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (lembagaLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  // Group template fields by section
  const fieldsBySection: Record<string, SuratTemplateField[]> = {};
  if (selectedTemplate) {
    for (const field of selectedTemplate.fields) {
      if (!fieldsBySection[field.section]) {
        fieldsBySection[field.section] = [];
      }
      fieldsBySection[field.section].push(field);
    }
    // Sort fields within each section by urutan
    for (const section of Object.keys(fieldsBySection)) {
      fieldsBySection[section].sort((a, b) => a.urutan - b.urutan);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Buat Surat Baru" : "Edit Surat"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lembaga */}
          <div className="space-y-2">
            <Label htmlFor="lembaga_id">Lembaga *</Label>
            <Select
              value={watch("lembaga_id")}
              onValueChange={(val) => {
                setValue("lembaga_id", val, { shouldValidate: true });
                // Reset template when lembaga changes
                setValue("template_id", "");
                setValue("template_data", {});
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih lembaga" />
              </SelectTrigger>
              <SelectContent>
                {lembagas.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    [{l.kode}] {l.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lembaga_id && (
              <p className="text-sm text-destructive">{errors.lembaga_id.message}</p>
            )}
          </div>

          {/* Template Picker */}
          {lembagaId && (
            <div className="space-y-2">
              <Label>Template Surat</Label>
              <Select
                value={templateId || "none"}
                onValueChange={(val) => {
                  setValue("template_id", val === "none" ? "" : val);
                  if (val === "none") {
                    setValue("template_data", {});
                    setValue("isi_surat", "");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih template (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tanpa Template (Surat Bebas)</SelectItem>
                  {templatesLoading ? (
                    <SelectItem value="loading" disabled>
                      Memuat template...
                    </SelectItem>
                  ) : (
                    templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        [{t.kategori}] {t.nama}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Pilih template untuk mengisi field otomatis, atau biarkan kosong untuk surat bebas.
              </p>
            </div>
          )}

          {/* Perihal */}
          <div className="space-y-2">
            <Label htmlFor="perihal">Perihal *</Label>
            <Input id="perihal" {...register("perihal")} placeholder="Perihal surat" />
            {errors.perihal && (
              <p className="text-sm text-destructive">{errors.perihal.message}</p>
            )}
          </div>

          {/* Kepada */}
          <div className="space-y-2">
            <Label htmlFor="kepada">Kepada (Tujuan) *</Label>
            <Input id="kepada" {...register("kepada")} placeholder="Nama penerima surat" />
            {errors.kepada && (
              <p className="text-sm text-destructive">{errors.kepada.message}</p>
            )}
          </div>

          {/* Alamat Tujuan */}
          <div className="space-y-2">
            <Label htmlFor="alamat_tujuan">Alamat Tujuan</Label>
            <Input
              id="alamat_tujuan"
              {...register("alamat_tujuan")}
              placeholder="Alamat tujuan surat"
            />
          </div>

          {/* Tanggal Surat */}
          <div className="space-y-2">
            <Label htmlFor="tanggal_surat">Tanggal Surat</Label>
            <Input id="tanggal_surat" type="date" {...register("tanggal_surat")} />
          </div>

          {/* Sifat */}
          <div className="space-y-2">
            <Label htmlFor="sifat">Sifat Surat</Label>
            <Select
              value={watch("sifat")}
              onValueChange={(val) =>
                setValue("sifat", val as SuratFormValues["sifat"], { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih sifat surat" />
              </SelectTrigger>
              <SelectContent>
                {SURAT_SIFAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lampiran */}
          <div className="space-y-2">
            <Label htmlFor="lampiran">Lampiran</Label>
            <Input id="lampiran" {...register("lampiran")} placeholder="Keterangan lampiran" />
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Template Fields */}
      {selectedTemplate && Object.keys(fieldsBySection).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Field Template: {selectedTemplate.nama}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Isi field di bawah ini. Isi surat akan ter-generate otomatis.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(fieldsBySection).map(([section, sectionFields]) => (
              <div key={section} className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b pb-1">
                  {section.replace(/_/g, " ")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sectionFields.map((field) => (
                    <div key={field.id} className="space-y-1">
                      <Label className="text-sm">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {field.tipe === "textarea" ? (
                        <Textarea
                          value={templateDataValue[field.nama_field] || ""}
                          onChange={(e) =>
                            handleTemplateFieldChange(field.nama_field, e.target.value)
                          }
                          placeholder={field.placeholder || ""}
                          rows={3}
                        />
                      ) : field.tipe === "select" && field.options ? (
                        <Select
                          value={templateDataValue[field.nama_field] || ""}
                          onValueChange={(val) =>
                            handleTemplateFieldChange(field.nama_field, val)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder || "Pilih..."} />
                          </SelectTrigger>
                          <SelectContent>
                            {(field.options as unknown as string[]).map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.tipe === "date" ? "date" : field.tipe === "number" ? "number" : "text"}
                          value={templateDataValue[field.nama_field] || ""}
                          onChange={(e) =>
                            handleTemplateFieldChange(field.nama_field, e.target.value)
                          }
                          placeholder={field.placeholder || ""}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Isi Surat (manual or generated) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Isi Surat</CardTitle>
          {selectedTemplate && (
            <p className="text-sm text-muted-foreground">
              Isi surat ter-generate dari template. Anda tetap bisa mengedit secara manual.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              id="isi_surat"
              {...register("isi_surat")}
              placeholder="Tuliskan isi surat..."
              rows={12}
            />
            {errors.isi_surat && (
              <p className="text-sm text-destructive">{errors.isi_surat.message}</p>
            )}
          </div>

          {/* Tembusan */}
          <div className="space-y-2">
            <Label>Tembusan</Label>
            <TembusanInput
              value={tembusanValue}
              onChange={(val) => setValue("tembusan", val)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Menyimpan...
            </>
          ) : mode === "create" ? (
            "Buat Surat"
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}
