"use client";

import { useState, useEffect } from "react";
import { Users, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { getToday } from "@/lib/utils";
import { getCurrentDayIndex } from "@/lib/jadwal";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

function StatCard({ title, value, icon, description, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const [stats, setStats] = useState({
    totalGuru: 0,
    jadwalHariIni: 0,
    sudahAbsen: 0,
    belumAbsen: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const today = getToday();
      const todayIndex = getCurrentDayIndex();

      try {
        // Get total active guru
        const { count: totalGuru } = await supabase
          .from("guru")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        // Get today's jadwal
        const { data: jadwalToday } = await supabase
          .from("jadwal")
          .select("id, guru_id")
          .eq("hari", todayIndex)
          .eq("is_active", true);

        // Get today's absen masuk (unique guru)
        const { data: todayAbsen } = await supabase
          .from("absensi")
          .select("guru_id")
          .eq("tanggal", today)
          .eq("tipe", "masuk");

        const uniqueGuruAbsen = new Set(todayAbsen?.map((a) => a.guru_id) || []);
        const uniqueGuruJadwal = new Set(jadwalToday?.map((j) => j.guru_id) || []);

        // Calculate stats
        const sudahAbsen = [...uniqueGuruJadwal].filter((id) =>
          uniqueGuruAbsen.has(id)
        ).length;

        setStats({
          totalGuru: totalGuru || 0,
          jadwalHariIni: jadwalToday?.length || 0,
          sudahAbsen,
          belumAbsen: uniqueGuruJadwal.size - sudahAbsen,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kehadiranPersen =
    stats.jadwalHariIni > 0
      ? Math.round(
        (stats.sudahAbsen / new Set([...Array(stats.jadwalHariIni)]).size) *
        100
      )
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Guru"
        value={stats.totalGuru}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        description="Guru aktif"
      />
      <StatCard
        title="Jadwal Hari Ini"
        value={stats.jadwalHariIni}
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        description="Sesi terjadwal"
      />
      <StatCard
        title="Sudah Absen"
        value={stats.sudahAbsen}
        icon={<CheckCircle className="h-4 w-4 text-green-600" />}
        description="Guru sudah absen masuk"
        className="border-green-500/20"
      />
      <StatCard
        title="Belum Absen"
        value={stats.belumAbsen}
        icon={<XCircle className="h-4 w-4 text-yellow-600" />}
        description="Guru belum absen masuk"
        className={stats.belumAbsen > 0 ? "border-yellow-500/20" : ""}
      />
    </div>
  );
}