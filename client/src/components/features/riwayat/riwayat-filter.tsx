"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface RiwayatFilterValues {
  startDate: Date | undefined;
  endDate: Date | undefined;
  status: "all" | "valid" | "invalid" | "suspicious";
}

interface RiwayatFilterProps {
  values: RiwayatFilterValues;
  onChange: (values: RiwayatFilterValues) => void;
  onReset: () => void;
}

export function RiwayatFilter({ values, onChange, onReset }: RiwayatFilterProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const hasActiveFilters =
    values.startDate ||
    values.endDate ||
    values.status !== "all";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          Filter
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="mr-1 h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {/* Start Date */}
        <Popover open={startOpen} onOpenChange={setStartOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "justify-start text-left font-normal",
                !values.startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {values.startDate
                ? format(values.startDate, "dd MMM yy", { locale: id })
                : "Dari"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={values.startDate}
              onSelect={(date) => {
                onChange({ ...values, startDate: date });
                setStartOpen(false);
              }}
              disabled={(date) =>
                date > new Date() || (values.endDate ? date > values.endDate : false)
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* End Date */}
        <Popover open={endOpen} onOpenChange={setEndOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "justify-start text-left font-normal",
                !values.endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {values.endDate
                ? format(values.endDate, "dd MMM yy", { locale: id })
                : "Sampai"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={values.endDate}
              onSelect={(date) => {
                onChange({ ...values, endDate: date });
                setEndOpen(false);
              }}
              disabled={(date) =>
                date > new Date() ||
                (values.startDate ? date < values.startDate : false)
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <Select
          value={values.status}
          onValueChange={(value: "all" | "valid" | "invalid" | "suspicious") =>
            onChange({ ...values, status: value })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="valid">Valid</SelectItem>
            <SelectItem value="invalid">Invalid</SelectItem>
            <SelectItem value="suspicious">Mencurigakan</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}