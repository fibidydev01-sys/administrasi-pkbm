"use client";

import { getTemplate } from "@/constants/template-registry";
import type { TemplateField } from "@/types/template";
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

interface TemplateFieldsProps {
  templateId: string;
  templateData: Record<string, string>;
  onChange: (fieldName: string, value: string) => void;
  errors?: Record<string, string>;
}

function renderField(
  field: TemplateField,
  value: string,
  onChange: (value: string) => void,
  error?: string
) {
  const id = `template_${field.name}`;

  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
        />
      );

    case "select":
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={`Pilih ${field.label}...`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "date":
      return (
        <Input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "text":
    default:
      return (
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );
  }
}

export default function TemplateFields({
  templateId,
  templateData,
  onChange,
  errors,
}: TemplateFieldsProps) {
  const template = getTemplate(templateId);

  if (template.fields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Data {template.nama}
      </h3>
      {template.fields.map((field) => {
        const value = templateData[field.name] ?? field.defaultValue ?? "";
        const error = errors?.[field.name];

        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={`template_${field.name}`}>
              {field.label}
              {field.required && " *"}
            </Label>
            {renderField(
              field,
              value,
              (val) => onChange(field.name, val),
              error
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
