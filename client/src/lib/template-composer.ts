/**
 * Template Composer
 *
 * Composes surat body content from template config + template_data.
 * Used by both form submission (compose before save) and renderer (compose for display).
 *
 * Referensi: doc/INFRA_TEMPLATE_SURAT.md Section 4 + 6.4
 */

import { getTemplate } from "@/constants/template-registry";
import type { TemplateConfig, TemplateData } from "@/types/template";
import type { Lembaga } from "@/types";

/**
 * Get field label from template config by field name.
 */
function getFieldLabel(template: TemplateConfig, fieldName: string): string {
  const field = template.fields.find((f) => f.name === fieldName);
  return field?.label ?? fieldName;
}

/**
 * Compose structured body for templates like Surat Keterangan, Surat Tugas.
 * Generates HTML with data blocks (tables of key-value pairs).
 */
function composeStructuredBody(
  template: TemplateConfig,
  templateData: TemplateData,
  lembaga: Lembaga
): string {
  const parts: string[] = [];

  if (template.dataBlocks) {
    for (const block of template.dataBlocks) {
      // Add block label
      parts.push(`<p>${block.label}</p>`);

      if (block.source === "lembaga") {
        // Auto-fill from lembaga data
        const lembagaFields = [
          { label: "Nama", value: lembaga.ttd_nama },
          { label: "Jabatan", value: lembaga.ttd_jabatan },
        ];
        parts.push('<table style="margin-left: 2em; margin-top: 0.5em; margin-bottom: 1em;">');
        for (const item of lembagaFields) {
          if (item.value) {
            parts.push(
              `<tr><td style="padding: 2px 0; vertical-align: top; width: 140px;">${item.label}</td><td style="padding: 2px 8px; vertical-align: top;">:</td><td style="padding: 2px 0;">${item.value}</td></tr>`
            );
          }
        }
        parts.push("</table>");
      } else {
        // Input fields from template_data
        parts.push('<table style="margin-left: 2em; margin-top: 0.5em; margin-bottom: 1em;">');
        for (const fieldName of block.fieldNames) {
          const value = templateData[fieldName];
          if (value) {
            const label = getFieldLabel(template, fieldName);
            parts.push(
              `<tr><td style="padding: 2px 0; vertical-align: top; width: 140px;">${label}</td><td style="padding: 2px 8px; vertical-align: top;">:</td><td style="padding: 2px 0;">${value}</td></tr>`
            );
          }
        }
        parts.push("</table>");
      }
    }
  }

  // Add "Untuk:" section for Surat Tugas
  if (template.id === "surat-tugas" && templateData.uraian_tugas) {
    parts.push(`<p>Untuk:</p>`);
    parts.push(`<p style="margin-left: 2em;">${templateData.uraian_tugas}</p>`);
  }

  // Add closing text for Surat Keterangan with dynamic data
  if (template.id === "surat-keterangan-aktif") {
    const namaLembaga = lembaga.nama;
    const alamatLembaga = lembaga.alamat;
    const keperluan = templateData.keperluan || "";

    parts.push(
      `<p>Adalah benar peserta didik aktif pada ${namaLembaga} yang beralamat di ${alamatLembaga}.</p>`
    );

    if (keperluan) {
      parts.push(
        `<p>Surat keterangan ini dibuat untuk keperluan ${keperluan} dan agar dapat dipergunakan sebagaimana mestinya.</p>`
      );
    }
  }

  return parts.join("\n");
}

/**
 * Compose freeform body for templates like Surat Undangan, Pemberitahuan, Permohonan.
 * Uses the isi_surat field directly, optionally adding data blocks (waktu/tempat/acara).
 */
function composeFreeformBody(
  template: TemplateConfig,
  templateData: TemplateData,
  isiSurat: string
): string {
  const parts: string[] = [];

  // For surat undangan: add paragraf_pembuka then data block
  if (template.id === "surat-undangan" && templateData.paragraf_pembuka) {
    parts.push(`<p style="text-indent: 1.25cm;">${templateData.paragraf_pembuka}</p>`);

    if (template.dataBlocks && template.dataBlocks.length > 0) {
      const block = template.dataBlocks[0];
      parts.push(`<p style="text-indent: 1.25cm;">${block.label}</p>`);
      parts.push('<table style="margin-left: 2em; margin-top: 0.5em; margin-bottom: 1em;">');
      for (const fieldName of block.fieldNames) {
        const value = templateData[fieldName];
        if (value) {
          const label = getFieldLabel(template, fieldName);
          parts.push(
            `<tr><td style="padding: 2px 0; vertical-align: top; width: 120px;">${label}</td><td style="padding: 2px 8px; vertical-align: top;">:</td><td style="padding: 2px 0;">${value}</td></tr>`
          );
        }
      }
      parts.push("</table>");
    }

    return parts.join("\n");
  }

  // Default: use isi_surat as-is
  if (isiSurat) {
    parts.push(isiSurat);
  }

  return parts.join("\n");
}

/**
 * Main composer function.
 * Composes the full body HTML based on template type.
 */
export function composeBodyFromTemplate(
  templateId: string,
  templateData: TemplateData,
  lembaga: Lembaga,
  isiSurat: string
): string {
  const template = getTemplate(templateId);

  if (template.bodyComposer === "structured") {
    return composeStructuredBody(template, templateData, lembaga);
  }

  return composeFreeformBody(template, templateData, isiSurat);
}

/**
 * Auto-compose perihal based on template + dynamic field values.
 * Some templates auto-compose perihal from field values.
 */
export function composePerihal(templateId: string, templateData: TemplateData): string {
  const template = getTemplate(templateId);
  const defaultPerihal = template.defaults.perihal ?? "";

  switch (templateId) {
    case "surat-undangan":
      return `Undangan ${templateData.nama_acara || ""}`.trim();
    case "surat-permohonan":
      return `Permohonan ${templateData.perihal_detail || ""}`.trim();
    case "surat-tugas":
      return "Surat Tugas";
    default:
      return defaultPerihal;
  }
}
