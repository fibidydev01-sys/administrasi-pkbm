"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";

import { suratSchema, type SuratFormData, validateTemplateFields } from "@/lib/validators";
import { useSurat, useLembagaList } from "@/hooks";
import { SURAT_SIFAT_OPTIONS, ROUTES, getTemplate } from "@/constants";
import { getToday } from "@/lib/date";
import type { SuratSifat } from "@/types";

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
import TemplateSelector from "./template-selector";
import TemplateFields from "./template-fields";

interface SuratFormProps {
  mode: "create" | "edit";
  suratId?: string;
  defaultValues?: Partial<SuratFormData>;
}

export default function SuratForm({ mode, suratId, defaultValues }: SuratFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateFieldErrors, setTemplateFieldErrors] = useState<Record<string, string>>({});
  const { createSurat, updateSurat } = useSurat(suratId);
  const { lembagas, loading: lembagaLoading } = useLembagaList();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SuratFormData>({
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
      template_id: "surat-umum",
      template_data: {},
      ...defaultValues,
    },
  });

  const tembusanValue = watch("tembusan") ?? [];
  const templateId = watch("template_id") ?? "surat-umum";
  const templateData = watch("template_data") ?? {};
  const currentTemplate = getTemplate(templateId);

  /**
   * Handle template change: apply defaults, reset template_data, confirm if switching.
   */
  const handleTemplateChange = useCallback(
    (newTemplateId: string) => {
      const hasExistingData = Object.values(templateData).some((v) => v && v.trim() !== "");

      if (hasExistingData && newTemplateId !== templateId) {
        const confirmed = window.confirm(
          "Ganti template? Data field template sebelumnya akan direset."
        );
        if (!confirmed) return;
      }

      const newTemplate = getTemplate(newTemplateId);

      // Set template_id
      setValue("template_id", newTemplateId);

      // Reset template_data
      setValue("template_data", {});
      setTemplateFieldErrors({});

      // Apply defaults
      if (newTemplate.defaults.perihal) {
        setValue("perihal", newTemplate.defaults.perihal, { shouldValidate: true });
      }
      if (newTemplate.defaults.sifat) {
        setValue("sifat", newTemplate.defaults.sifat, { shouldValidate: true });
      }
      if (newTemplate.defaults.lampiran) {
        setValue("lampiran", newTemplate.defaults.lampiran);
      }

      // For templates that don't use "Kepada", set a default or clear
      if (!newTemplate.struktur.pakaiKepada) {
        setValue("kepada", "-");
      } else {
        // Only clear if currently set to the placeholder
        const currentKepada = watch("kepada");
        if (currentKepada === "-") {
          setValue("kepada", "");
        }
      }

      // For structured templates, isi_surat is composed automatically
      if (newTemplate.bodyComposer === "structured") {
        setValue("isi_surat", "");
      }
    },
    [templateId, templateData, setValue, watch]
  );

  /**
   * Handle template field value change.
   */
  const handleTemplateFieldChange = useCallback(
    (fieldName: string, value: string) => {
      const current = watch("template_data") ?? {};
      setValue("template_data", { ...current, [fieldName]: value });

      // Clear error for this field
      if (templateFieldErrors[fieldName]) {
        setTemplateFieldErrors((prev) => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
      }
    },
    [setValue, watch, templateFieldErrors]
  );

  async function onSubmit(data: SuratFormData) {
    // Validate template-specific required fields
    const tplErrors = validateTemplateFields(
      data.template_id ?? "surat-umum",
      data.template_data ?? {}
    );
    if (Object.keys(tplErrors).length > 0) {
      setTemplateFieldErrors(tplErrors);
      toast.error("Lengkapi semua field template yang wajib diisi");
      return;
    }

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
              onValueChange={(val) => setValue("lembaga_id", val, { shouldValidate: true })}
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

          {/* Template Selector */}
          <TemplateSelector
            value={templateId}
            onChange={handleTemplateChange}
          />

          {/* Template Dynamic Fields */}
          {currentTemplate.fields.length > 0 && (
            <TemplateFields
              templateId={templateId}
              templateData={templateData}
              onChange={handleTemplateFieldChange}
              errors={templateFieldErrors}
            />
          )}

          {/* Perihal */}
          <div className="space-y-2">
            <Label htmlFor="perihal">Perihal *</Label>
            <Input id="perihal" {...register("perihal")} placeholder="Perihal surat" />
            {errors.perihal && (
              <p className="text-sm text-destructive">{errors.perihal.message}</p>
            )}
          </div>

          {/* Kepada — only show if template uses it */}
          {currentTemplate.struktur.pakaiKepada && (
            <div className="space-y-2">
              <Label htmlFor="kepada">Kepada (Tujuan)</Label>
              <Input id="kepada" {...register("kepada")} placeholder="Nama penerima surat" />
              {errors.kepada && (
                <p className="text-sm text-destructive">{errors.kepada.message}</p>
              )}
            </div>
          )}

          {/* Alamat Tujuan — only show if template uses "Kepada" */}
          {currentTemplate.struktur.pakaiKepada && (
            <div className="space-y-2">
              <Label htmlFor="alamat_tujuan">Alamat Tujuan</Label>
              <Input
                id="alamat_tujuan"
                {...register("alamat_tujuan")}
                placeholder="Alamat tujuan surat"
              />
            </div>
          )}

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
                setValue("sifat", val as SuratSifat, { shouldValidate: true })
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

          {/* Isi Surat — only show for freeform templates */}
          {currentTemplate.bodyComposer === "freeform" && (
            <div className="space-y-2">
              <Label htmlFor="isi_surat">Isi Surat</Label>
              <Textarea
                id="isi_surat"
                {...register("isi_surat")}
                placeholder="Tuliskan isi surat..."
                rows={10}
              />
              {errors.isi_surat && (
                <p className="text-sm text-destructive">{errors.isi_surat.message}</p>
              )}
            </div>
          )}

          {/* Tembusan — only show if template supports it */}
          {currentTemplate.struktur.pakaiTembusan && (
            <div className="space-y-2">
              <Label>Tembusan</Label>
              <TembusanInput
                value={tembusanValue}
                onChange={(val) => setValue("tembusan", val)}
              />
            </div>
          )}
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
