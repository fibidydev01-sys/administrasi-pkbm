"use client";

import { getTemplateOptions } from "@/constants/template-registry";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TemplateSelectorProps {
  value: string;
  onChange: (templateId: string) => void;
  disabled?: boolean;
}

export default function TemplateSelector({
  value,
  onChange,
  disabled,
}: TemplateSelectorProps) {
  const options = getTemplateOptions();

  return (
    <div className="space-y-2">
      <Label htmlFor="template_id">Template Surat</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Pilih Template..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span>{opt.label}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                — {opt.deskripsi}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
