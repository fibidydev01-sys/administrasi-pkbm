"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface RekapCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const DAYS = ["M", "S", "S", "R", "K", "J", "S"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function RekapCalendar({ selectedDate, onSelectDate }: RekapCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [datesWithAbsensi, setDatesWithAbsensi] = useState<Set<string>>(new Set());

  // PERUBAHAN: State untuk animasi
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");

  useEffect(() => {
    const fetchAbsensiDates = async () => {
      const supabase = createClient();
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);

      const { data } = await supabase
        .from("absensi")
        .select("tanggal")
        .gte("tanggal", firstDay.toISOString().split("T")[0])
        .lte("tanggal", lastDay.toISOString().split("T")[0]);

      if (data) {
        setDatesWithAbsensi(new Set(data.map((d) => d.tanggal)));
      }
    };
    fetchAbsensiDates();
  }, [currentMonth, currentYear]);

  // PERUBAHAN: Selalu 42 kotak (6 baris x 7 kolom) agar tidak naik turun
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: (number | null)[] = [];

    // Padding awal
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Tanggal
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    // PERUBAHAN: Padding akhir agar selalu 42 kotak (6 baris)
    while (days.length < 42) {
      days.push(null);
    }

    return days;
  }, [currentMonth, currentYear]);

  // PERUBAHAN: Fungsi ganti bulan dengan animasi
  const changeMonth = (direction: "prev" | "next") => {
    setSlideDirection(direction === "next" ? "left" : "right");
    setIsAnimating(true);

    setTimeout(() => {
      if (direction === "prev") {
        if (currentMonth === 0) {
          setCurrentMonth(11);
          setCurrentYear(currentYear - 1);
        } else {
          setCurrentMonth(currentMonth - 1);
        }
      } else {
        if (currentMonth === 11) {
          setCurrentMonth(0);
          setCurrentYear(currentYear + 1);
        } else {
          setCurrentMonth(currentMonth + 1);
        }
      }
      setTimeout(() => setIsAnimating(false), 50);
    }, 150);
  };

  const goToMonth = (monthIndex: number, year: number) => {
    const targetDate = new Date(year, monthIndex, 1);
    const currentDate = new Date(currentYear, currentMonth, 1);

    setSlideDirection(targetDate > currentDate ? "left" : "right");
    setIsAnimating(true);

    setTimeout(() => {
      setCurrentMonth(monthIndex);
      setCurrentYear(year);
      setTimeout(() => setIsAnimating(false), 50);
    }, 150);
  };

  const isSelected = (day: number) =>
    day === selectedDate.getDate() &&
    currentMonth === selectedDate.getMonth() &&
    currentYear === selectedDate.getFullYear();

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const hasAbsensi = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return datesWithAbsensi.has(dateStr);
  };

  const handleDateClick = (day: number) => {
    onSelectDate(new Date(currentYear, currentMonth, day));
  };

  const monthScrollItems = useMemo(() => {
    const items: { month: number; year: number; label: string }[] = [];
    for (let i = -3; i <= 3; i++) {
      let m = currentMonth + i;
      let y = currentYear;
      if (m < 0) { m += 12; y -= 1; }
      else if (m > 11) { m -= 12; y += 1; }
      items.push({ month: m, year: y, label: MONTHS[m] });
    }
    return items;
  }, [currentMonth, currentYear]);

  return (
    <Card>
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => changeMonth("prev")}
            className="p-1.5 hover:bg-muted rounded-full transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="font-semibold text-sm">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={() => changeMonth("next")}
            className="p-1.5 hover:bg-muted rounded-full transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* PERUBAHAN: Calendar Grid dengan animasi */}
        <div
          className={cn(
            "transition-all duration-150 ease-in-out",
            isAnimating && slideDirection === "left" && "opacity-0 -translate-x-4",
            isAnimating && slideDirection === "right" && "opacity-0 translate-x-4",
            !isAnimating && "opacity-100 translate-x-0"
          )}
        >
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-0 mb-1">
            {DAYS.map((day, idx) => (
              <div key={idx} className="text-center text-[10px] text-muted-foreground py-1 font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* PERUBAHAN: Date Cells - Fixed 6 rows (42 cells) */}
          <div className="grid grid-cols-7 gap-0">
            {calendarDays.map((day, index) => (
              <div key={index} className="text-center p-0.5 h-9 flex items-center justify-center">
                {day !== null ? (
                  <button
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "w-8 h-8 text-xs rounded-full relative transition-all duration-200",
                      "hover:bg-muted active:scale-95",
                      isSelected(day) && "bg-primary text-primary-foreground hover:bg-primary",
                      isToday(day) && !isSelected(day) && "border border-primary text-primary font-semibold"
                    )}
                  >
                    {day}
                    {hasAbsensi(day) && (
                      <span
                        className={cn(
                          "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                          isSelected(day) ? "bg-white" : "bg-green-500"
                        )}
                      />
                    )}
                  </button>
                ) : (
                  <div className="w-8 h-8" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Month Scroll */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t overflow-x-auto scrollbar-hide">
          <span className="flex-shrink-0 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-bold">
            {currentYear}
          </span>
          {monthScrollItems.map((item, index) => {
            const isCurrent = item.month === currentMonth && item.year === currentYear;
            return (
              <button
                key={`${item.month}-${item.year}-${index}`}
                onClick={() => goToMonth(item.month, item.year)}
                className={cn(
                  "flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all duration-200",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}