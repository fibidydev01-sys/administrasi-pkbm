"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, X, GripVertical, ArrowUp, ArrowDown } from "lucide-react";

import {
  templateSchema,
  type TemplateFieldFormData,
} from "@/lib/validators";
import type { z } from "zod";

type TemplateFormValues = z.input<typeof templateSchema>;
import { useTemplateAdmin, useLembagaList } from "@/hooks";
import { ROUTES } from "@/constants";
import type { BodyPart, SuratTemplateWithFields } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const KATEGORI_OPTIONS = [
  "Keterangan",
  "Undangan",
  "Tugas",
  "Edaran",
  "Pernyataan",
  "Rekomendasi",
  "Pengantar",
  "Lainnya",
];

const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Teks (1 baris)" },
  { value: "textarea", label: "Teks Panjang" },
  { value: "date", label: "Tanggal" },
  { value: "number", label: "Angka" },
  { value: "select", label: "Pilihan (Select)" },
];

interface TemplateFormProps {
  mode: "create" | "edit";
  defaultValues?: SuratTemplateWithFields;
}

export default function TemplateForm({ mode, defaultValues }: TemplateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createTemplate, updateTemplate } = useTemplateAdmin();
  const { lembagas, loading: lembagaLoading } = useLembagaList();

  // Body parts state
  const [bodyParts, setBodyParts] = useState<BodyPart[]>(
    defaultValues
      ? (defaultValues.body_parts as unknown as BodyPart[])
      : [{ type: "text", value: "" }]
  );

  // Fields state
  const [fields, setFields] = useState<TemplateFieldFormData[]>(
    defaultValues?.fields?.map((f) => ({
      nama_field: f.nama_field,
      label: f.label,
      tipe: f.tipe as TemplateFieldFormData["tipe"],
      urutan: f.urutan,
      required: f.required,
      placeholder: f.placeholder || "",
      default_value: f.default_value || "",
      options: (f.options as string[]) || undefined,
      section: f.section,
    })) ?? []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      nama: defaultValues?.nama ?? "",
      kategori: defaultValues?.kategori ?? "",
      perihal_default: defaultValues?.perihal_default ?? "",
      lembaga_id: defaultValues?.lembaga_id ?? "",
      is_active: defaultValues?.is_active ?? true,
      body_parts: bodyParts,
      fields: fields,
    },
  });

  // Sync body_parts + fields with form
  function syncFormData() {
    setValue("body_parts", bodyParts);
    setValue("fields", fields);
  }

  // === BODY PARTS HANDLERS ===

  function addTextPart() {
    setBodyParts([...bodyParts, { type: "text", value: "" }]);
  }

  function addFieldGroupPart() {
    setBodyParts([...bodyParts, { type: "field_group", section: "" }]);
  }

  function updateBodyPart(index: number, part: BodyPart) {
    const updated = bodyParts.map((p, i) => (i === index ? part : p));
    setBodyParts(updated);
  }

  function removeBodyPart(index: number) {
    setBodyParts(bodyParts.filter((_, i) => i !== index));
  }

  function moveBodyPart(index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= bodyParts.length) return;
    const updated = [...bodyParts];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setBodyParts(updated);
  }

  // === FIELD HANDLERS ===

  function addField() {
    setFields([
      ...fields,
      {
        nama_field: "",
        label: "",
        tipe: "text",
        urutan: fields.length,
        required: false,
        placeholder: "",
        default_value: "",
        section: "",
      },
    ]);
  }

  function updateField(index: number, updates: Partial<TemplateFieldFormData>) {
    const updated = fields.map((f, i) =>
      i === index ? { ...f, ...updates } : f
    );
    setFields(updated);
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index));
  }

  // Get unique sections from body_parts field_groups
  const sections = bodyParts
    .filter((p): p is Extract<BodyPart, { type: "field_group" }> => p.type === "field_group")
    .map((p) => p.section)
    .filter((s) => s.length > 0);

  // === SUBMIT ===

  async function onSubmit(data: TemplateFormValues) {
    try {
      setIsSubmitting(true);
      syncFormData();

      const templateData = {
        nama: data.nama,
        kategori: data.kategori,
        perihal_default: data.perihal_default || undefined,
        body_parts: bodyParts,
        lembaga_id: data.lembaga_id || undefined,
        is_active: data.is_active,
      };

      const fieldData = fields.map((f, i) => ({
        nama_field: f.nama_field,
        label: f.label,
        tipe: f.tipe,
        urutan: i,
        required: f.required,
        placeholder: f.placeholder || null,
        default_value: f.default_value || null,
        options: f.options || null,
        section: f.section,
      }));

      if (mode === "create") {
        await createTemplate(templateData, fieldData);
        toast.success("Template berhasil dibuat");
      } else if (defaultValues) {
        await updateTemplate(defaultValues.id, templateData, fieldData);
        toast.success("Template berhasil diperbarui");
      }

      router.push(ROUTES.ADMIN_TEMPLATE);
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
    <form
      onSubmit={(e) => {
        syncFormData();
        handleSubmit(onSubmit)(e);
      }}
      className="space-y-6"
    >
      {/* === BASIC INFO === */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama */}
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Template *</Label>
              <Input
                id="nama"
                {...register("nama")}
                placeholder="Surat Keterangan Aktif Belajar"
              />
              {errors.nama && (
                <p className="text-sm text-destructive">{errors.nama.message}</p>
              )}
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori *</Label>
              <Select
                value={watch("kategori")}
                onValueChange={(val) =>
                  setValue("kategori", val, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI_OPTIONS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kategori && (
                <p className="text-sm text-destructive">{errors.kategori.message}</p>
              )}
            </div>
          </div>

          {/* Perihal default */}
          <div className="space-y-2">
            <Label htmlFor="perihal_default">Perihal Default</Label>
            <Input
              id="perihal_default"
              {...register("perihal_default")}
              placeholder="Otomatis terisi saat template dipilih"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lembaga */}
            <div className="space-y-2">
              <Label htmlFor="lembaga_id">Lembaga (kosongkan untuk global)</Label>
              <Select
                value={watch("lembaga_id") || "global"}
                onValueChange={(val) =>
                  setValue("lembaga_id", val === "global" ? "" : val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Global (semua lembaga)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (semua lembaga)</SelectItem>
                  {lembagas.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      [{l.kode}] {l.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active */}
            <div className="space-y-2 flex items-end gap-2 pb-1">
              <Checkbox
                id="is_active"
                checked={watch("is_active")}
                onCheckedChange={(checked) =>
                  setValue("is_active", !!checked)
                }
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Template aktif
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === BODY PARTS === */}
      <Card>
        <CardHeader>
          <CardTitle>Struktur Isi Surat (Body Parts)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Susun isi surat dari blok teks statis dan grup field dinamis.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {bodyParts.map((part, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30"
            >
              <div className="flex flex-col gap-1 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveBodyPart(index, "up")}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <GripVertical className="h-4 w-4 text-muted-foreground mx-auto" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveBodyPart(index, "down")}
                  disabled={index === bodyParts.length - 1}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex-1 space-y-2">
                {part.type === "text" ? (
                  <>
                    <Label className="text-xs text-muted-foreground">
                      Teks Statis #{index + 1}
                    </Label>
                    <Textarea
                      value={part.value}
                      onChange={(e) =>
                        updateBodyPart(index, {
                          type: "text",
                          value: e.target.value,
                        })
                      }
                      placeholder="Tuliskan teks statis surat..."
                      rows={3}
                    />
                  </>
                ) : (
                  <>
                    <Label className="text-xs text-muted-foreground">
                      Grup Field #{index + 1}
                    </Label>
                    <Input
                      value={part.section}
                      onChange={(e) =>
                        updateBodyPart(index, {
                          type: "field_group",
                          section: e.target.value,
                        })
                      }
                      placeholder="Nama section (e.g. pejabat, siswa, detail)"
                    />
                  </>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive mt-6"
                onClick={() => removeBodyPart(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addTextPart}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah Teks
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFieldGroupPart}
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah Grup Field
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* === TEMPLATE FIELDS === */}
      <Card>
        <CardHeader>
          <CardTitle>Field Dinamis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Definisikan field yang harus diisi saat menggunakan template ini.
            Setiap field harus masuk ke salah satu section yang ada di Body Parts.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg space-y-3 bg-muted/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Field #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeField(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nama Field</Label>
                  <Input
                    value={field.nama_field}
                    onChange={(e) =>
                      updateField(index, { nama_field: e.target.value })
                    }
                    placeholder="nama_siswa"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) =>
                      updateField(index, { label: e.target.value })
                    }
                    placeholder="Nama Lengkap"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Section</Label>
                  {sections.length > 0 ? (
                    <Select
                      value={field.section || ""}
                      onValueChange={(val) =>
                        updateField(index, { section: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={field.section}
                      onChange={(e) =>
                        updateField(index, { section: e.target.value })
                      }
                      placeholder="section_name"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tipe</Label>
                  <Select
                    value={field.tipe}
                    onValueChange={(val) =>
                      updateField(index, {
                        tipe: val as TemplateFieldFormData["tipe"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Placeholder</Label>
                  <Input
                    value={field.placeholder || ""}
                    onChange={(e) =>
                      updateField(index, { placeholder: e.target.value })
                    }
                    placeholder="Hint untuk user"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Default Value</Label>
                  <Input
                    value={field.default_value || ""}
                    onChange={(e) =>
                      updateField(index, { default_value: e.target.value })
                    }
                    placeholder="Nilai awal"
                  />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <Checkbox
                    id={`required-${index}`}
                    checked={field.required}
                    onCheckedChange={(checked) =>
                      updateField(index, { required: !!checked })
                    }
                  />
                  <Label
                    htmlFor={`required-${index}`}
                    className="text-xs cursor-pointer"
                  >
                    Wajib diisi
                  </Label>
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addField}>
            <Plus className="h-4 w-4 mr-1" />
            Tambah Field
          </Button>
        </CardContent>
      </Card>

      {/* === ACTIONS === */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Menyimpan...
            </>
          ) : mode === "create" ? (
            "Buat Template"
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(ROUTES.ADMIN_TEMPLATE)}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
