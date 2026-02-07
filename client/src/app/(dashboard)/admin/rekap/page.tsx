"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared";
import { RekapCalendar, RekapAttendance } from "@/components/features/admin";
import { createClient } from "@/lib/supabase/client";

export default function AdminRekapPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [autoCompleteRan, setAutoCompleteRan] = useState(false);

  // ✅ Trigger auto-complete saat halaman dibuka (sekali saja)
  useEffect(() => {
    const runAutoComplete = async () => {
      if (autoCompleteRan) return;

      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];

      try {
        // Panggil function auto_complete_pulang dengan type assertion
        const { data, error } = await supabase.rpc("auto_complete_pulang" as any, {
          target_date: today
        });

        if (error) {
          console.log("Auto-complete not available or error:", error.message);
        } else if (data != null && Number(data) > 0) {
          console.log(`✅ Auto-completed ${data} pulang records`);
        }
      } catch (err) {
        // Function mungkin belum dibuat, skip saja
        console.log("Auto-complete skipped");
      }

      setAutoCompleteRan(true);
    };

    runAutoComplete();
  }, [autoCompleteRan]);

  return (
    <div className="space-y-4 pb-28">
      <PageHeader
        title="Rekap Absensi"
        description="Lihat rekap kehadiran guru"
      />

      <RekapCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <RekapAttendance selectedDate={selectedDate} />
    </div>
  );
}