"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

interface TembusanInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function TembusanInput({ value, onChange }: TembusanInputProps) {
  function addTembusan() {
    onChange([...value, ""]);
  }

  function removeTembusan(index: number) {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  }

  function updateTembusan(index: number, newValue: string) {
    const updated = value.map((item, i) => (i === index ? newValue : item));
    onChange(updated);
  }

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
          <Input
            value={item}
            onChange={(e) => updateTembusan(index, e.target.value)}
            placeholder="Nama penerima tembusan"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeTembusan(index)}
            className="h-9 w-9 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addTembusan} className="mt-2">
        <Plus className="h-4 w-4 mr-1" />
        Tambah Tembusan
      </Button>
    </div>
  );
}
